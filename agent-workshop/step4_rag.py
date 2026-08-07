"""第 4 步：让 agent 真的去查这本书。

    python step4_rag.py
    python step4_rag.py "反思模式里的两个角色叫什么？"

前置：先跑过 python step0_prepare_book.py
对应知识平台：模式 14 知识检索（RAG）

──────────────────────────────────────────────────────────────
这一步加的东西：**一个能查书的工具。就这一个。**
──────────────────────────────────────────────────────────────
把 step1 那个「第 66 页讲什么」的问题再问一遍，对比一下答案。
上次它靠猜，这次它会先去翻书，然后带着页码回答。

看清楚这一步的关键点：**agent 循环一行都没改。**
下面这个 import 就是证据——step3 写的 run_agent 原封不动拿过来用。
变的只有工具清单。这就是 agent 架构最值钱的性质：
**加能力 = 加工具，不是改流程。**

──────────────────────────────────────────────────────────────
RAG 只是这么回事
──────────────────────────────────────────────────────────────
Retrieval-Augmented Generation，听起来很唬人，拆开就三步：
  检索（找到相关段落）→ 增强（塞进提示里）→ 生成（模型基于它回答）

这里唯一的不同是：**检索是模型自己发起的**，不是你在代码里强制先查一遍。
它可以查一次、查三次、换个关键词再查，也可以判断「这个不用查」直接答。
这叫 agentic RAG，比固定先查一次的传统 RAG 灵活，代价是多几轮调用。
"""

import sys

from dotenv import load_dotenv

load_dotenv()

import anthropic

from retrieval import search_book
# 同一个循环，一字未改。
from step3_tools import run_agent


# ══════════════════════════════════════════════════════════════
# 工具：查书
# ══════════════════════════════════════════════════════════════

def search_the_book(query: str, k: int = 4) -> str:
    """检索并把结果拼成模型能读的一段文本。

    注意返回值里**一定要带页码**。不带的话模型没法给出处，
    你也就没法验证它说的对不对——那 RAG 就白做了一半。
    """
    hits = search_book(query, k=min(int(k), 8))

    if not hits:
        # 空结果也要说清楚「为什么空」和「怎么办」，
        # 模型看到这句话通常会换个关键词自己重试。
        return (f"没有找到与「{query}」匹配的内容。"
                f"检索按英文单词字面匹配，请换用书中可能出现的英文术语再试。")

    parts = []
    for h in hits:
        parts.append(f"[第 {h['page']} 页 · 相关度 {h['score']}]\n{h['text']}")
    return "\n\n---\n\n".join(parts)


TOOLS = [
    {
        "name": "search_the_book",
        "description": (
            "在《Agentic Design Patterns》(Antonio Gulli 著) 全书中检索相关段落，"
            "返回原文片段和页码。\n"
            "任何关于这本书的具体内容、术语定义、章节位置的问题，都必须先调用它，"
            "不要凭记忆回答。\n"
            "重要：**这本书是英文的，检索按英文单词字面匹配**，"
            "所以 query 必须用英文关键词，不要用中文，也不要写成完整句子。"
            "好的 query：'reflection producer critic'、'circuit breaker retry'。"
            "差的 query：'反思模式是什么'、'what does the book say about reflection'。\n"
            "一次查不到就换关键词再查，最多查三次。"
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "英文关键词，2-5 个词，空格分隔",
                },
                "k": {
                    "type": "integer",
                    "description": "返回几段，默认 4，最多 8",
                },
            },
            "required": ["query"],
        },
    }
]

IMPLS = {"search_the_book": search_the_book}

# system 提示定的是「行为规矩」，工具描述定的是「工具怎么用」。
# 两者分开写，改起来才不会互相打架。
SYSTEM = """你是《Agentic Design Patterns》这本书的学习助手，服务对象是中文读者。

规矩：
1. 回答书里的内容之前，必须先用 search_the_book 查证。不许凭印象答。
2. 每个具体说法后面标出页码，格式：（第 66 页）。
3. 查不到就直说「书里没查到」，然后可以补充你自己的理解，
   但要明确标注这部分不是来自本书。**绝对不要把猜测说成书里写的。**
4. 用中文回答。专业术语保留英文原词并加中文解释，例如：Reflection（反思）。
"""

DEFAULT_QUESTION = "这本书第 66 页讲的是哪个模式？原文用了哪两个角色名？"


def main() -> None:
    question = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_QUESTION
    print(f"问：{question}")

    try:
        answer = run_agent(question, tools=TOOLS, impls=IMPLS, system=SYSTEM)
    except FileNotFoundError as e:
        print(f"\n✗ {e}")
        sys.exit(1)
    except anthropic.AuthenticationError:
        print("\n✗ key 不对。先跑 python check_setup.py")
        sys.exit(1)
    except anthropic.APIConnectionError:
        print("\n✗ 连不上服务器，检查网络")
        sys.exit(1)

    print(f"\n{'═' * 62}\n最终回答：\n{answer.strip()}\n{'═' * 62}")
    print("""
  把这个答案和 step1 的第二个答案放一起对比——这就是 RAG 的全部价值：
  从「听起来很对」变成「可以翻到那一页去核对」。

  三件值得自己动手试的事：

  1. 问一个书里绝对没有的东西（比如「书里怎么讲量子计算的？」），
     看它会不会老实说没查到。这是在测你的 system 提示第 3 条管不管用。

  2. 用中文关键词强行提问，比如「查一下『护栏』」。
     TF-IDF 匹配不到中文，你会看到它扑空然后换英文重试——
     这个自我纠正就是 agent 循环的价值。

  3. 打开 retrieval.py，把 search() 的 k 改成 1，再问一次。
     检索质量直接决定回答质量。**RAG 做不好，八成不是模型的问题，
     是检索的问题。**

  下一步让它记住你说过的话：
      python step5_memory.py
""")


if __name__ == "__main__":
    main()
