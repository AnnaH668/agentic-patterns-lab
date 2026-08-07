"""手写检索：从 1075 个文本块里挑出最相关的几块。

step4 开始，这个文件被反复复用。它不是一个「步骤」，是个工具箱。

──────────────────────────────────────────────────────────────
为什么不用向量数据库？
──────────────────────────────────────────────────────────────
你搜 RAG 教程，十篇有九篇让你装 Chroma / Pinecone / FAISS。这里故意不用：

1. **少一层黑箱。** 检索的本质就是「算两段文字有多像」，一百行 numpy
   就能写完。先看见它是什么，再去用别人封装好的。
2. **少一个装不上的依赖。** 向量库经常编译失败，新手第一天就卡死在这。
3. **Anthropic 没有 embedding 接口。** 用向量检索意味着你还得再申请一个
   别家的 API key。对「跑通第一个 agent」来说是纯粹的干扰。

这里用的是 **TF-IDF + 余弦相似度**——搜索引擎在神经网络之前用了几十年的
办法。它按「词」匹配，不懂同义词（问 "car" 找不到只写 "automobile" 的段落），
这是它真实的天花板。但对「在一本技术书里按术语查东西」这个场景，
术语本来就是固定写法，它够用，而且快得多。

什么时候该换成向量检索：当你的用户会用完全不同的词问同一件事的时候。
"""

import json
import math
import re
from collections import Counter
from pathlib import Path

import numpy as np

CHUNKS_PATH = Path(__file__).parent / "data" / "book_chunks.json"

# 英文里出现频率极高但不携带信息的词。留着它们会让每一块都「有点像」。
STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "at",
    "for", "with", "by", "from", "as", "is", "are", "was", "were", "be", "been",
    "being", "it", "its", "this", "that", "these", "those", "which", "who",
    "what", "when", "where", "how", "why", "can", "could", "will", "would",
    "should", "may", "might", "must", "do", "does", "did", "not", "no", "so",
    "than", "then", "there", "their", "them", "they", "we", "you", "your",
    "our", "us", "he", "she", "his", "her", "have", "has", "had", "more",
    "most", "other", "some", "such", "only", "own", "same", "s", "t",
}


def tokenize(text: str) -> list[str]:
    """把一段文字拆成词。

    只做三件事：转小写、按非字母数字切开、扔掉停用词和单字符。
    没有做词干还原（stemming），所以 "agent" 和 "agents" 会被当成两个词——
    这是个已知的粗糙之处，你可以自己加。
    """
    words = re.findall(r"[a-z0-9_]+", text.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 1]


class Retriever:
    """把所有文本块变成向量，然后按相似度排序。

    三步：
      1. 建词表 —— 全书出现过的词，每个词分配一个列号
      2. 算 TF-IDF 矩阵 —— 每个块变成一个向量
      3. 查询时把问题也变成向量，算余弦相似度，取最高的几个
    """

    def __init__(self, chunks: list[dict]):
        self.chunks = chunks
        docs = [tokenize(c["text"]) for c in chunks]
        n_docs = len(docs)

        # ── 1. 词表 ──────────────────────────────────────────────
        # 只出现过一次的词基本是 OCR 噪声或人名，留着白占内存
        df = Counter()                       # document frequency：多少块含这个词
        for d in docs:
            df.update(set(d))
        vocab = [w for w, c in df.items() if c >= 2]
        self.vocab = {w: i for i, w in enumerate(vocab)}

        # ── 2. IDF：一个词越稀有，它作为线索就越值钱 ────────────────
        #    "agent" 全书每块都有 → 权重接近 0，因为它区分不出任何东西
        #    "circuit" 只出现在少数块 → 权重高，是个强信号
        #    +1 是为了避免除零，log 是为了压缩量级差距
        self.idf = np.zeros(len(vocab), dtype=np.float32)
        for w, i in self.vocab.items():
            self.idf[i] = math.log(n_docs / (1 + df[w])) + 1.0

        # ── 3. 每块一行的 TF-IDF 矩阵 ────────────────────────────
        #    TF 用「出现次数 / 该块总词数」，否则长块天然占便宜
        self.matrix = np.zeros((n_docs, len(vocab)), dtype=np.float32)
        for row, d in enumerate(docs):
            if not d:
                continue
            counts = Counter(d)
            for w, c in counts.items():
                col = self.vocab.get(w)
                if col is not None:
                    self.matrix[row, col] = (c / len(d)) * self.idf[col]

        # 每行归一化成单位长度。之后算余弦相似度就只剩一次点乘。
        norms = np.linalg.norm(self.matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        self.matrix /= norms

    def search(self, query: str, k: int = 4) -> list[dict]:
        """返回最相关的 k 块，每块带一个 score。"""
        vec = np.zeros(len(self.vocab), dtype=np.float32)
        for w, c in Counter(tokenize(query)).items():
            col = self.vocab.get(w)
            if col is not None:
                vec[col] = c * self.idf[col]

        norm = np.linalg.norm(vec)
        if norm == 0:
            return []          # 问题里的词全书都没出现过
        vec /= norm

        scores = self.matrix @ vec            # 一次矩阵乘法搞定全部 1075 块
        top = np.argsort(scores)[::-1][:k]

        return [
            {**self.chunks[i], "score": round(float(scores[i]), 4)}
            for i in top
            if scores[i] > 0
        ]


_cached: Retriever | None = None


def get_retriever() -> Retriever:
    """全局单例。建索引要几秒，不要每次提问都重建一遍。"""
    global _cached
    if _cached is None:
        if not CHUNKS_PATH.exists():
            raise FileNotFoundError(
                f"找不到 {CHUNKS_PATH.name}，先跑：python step0_prepare_book.py"
            )
        chunks = json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))
        _cached = Retriever(chunks)
    return _cached


def search_book(query: str, k: int = 4) -> list[dict]:
    """给 agent 当工具用的入口。"""
    return get_retriever().search(query, k)


if __name__ == "__main__":
    # 直接跑这个文件就是检索自测，不花钱、不联网。
    import sys

    r = get_retriever()
    print(f"索引就绪：{len(r.chunks)} 块，词表 {len(r.vocab)} 个词\n")

    queries = sys.argv[1:] or [
        "circuit breaker retry backoff",
        "reflection critic evaluate own output",
        "model context protocol MCP primitives",
    ]
    for q in queries:
        print(f"── 查询：{q}")
        hits = search_book(q, k=3)
        if not hits:
            print("   （没找到。TF-IDF 只认字面词，换个说法试试）\n")
            continue
        for h in hits:
            snippet = h["text"][:160].replace("\n", " ")
            print(f"   [{h['score']:.3f}] p.{h['page']:>3}  {snippet}…")
        print()
