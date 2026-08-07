"""第 0 步：把 PDF 变成可检索的文本块。

    python step0_prepare_book.py
    python step0_prepare_book.py /路径/到/别的.pdf     # 换一本书也行

这一步**不花钱、不联网**，纯本地处理。跑完会生成 data/book_chunks.json，
它是 step4 之后所有脚本的输入。

──────────────────────────────────────────────────────────────
为什么要「切块」？
──────────────────────────────────────────────────────────────
整本书 80 多万字符，一次塞给模型既贵又蠢——模型在超长上下文里会
「中间遗忘」（lost in the middle，见知识平台 模式 14）。
正确做法是：先切成小块，提问时只挑最相关的几块喂给模型。

块切多大是个真实的工程权衡：
  · 太小（200 字符）→ 一句话被腰斩，检索到了也读不懂
  · 太大（5000 字符）→ 一块里混了三个主题，相关信号被稀释
这里用 1200 字符 + 200 字符重叠。**重叠**是为了防止一个完整的论述
正好卡在两块边界上被切断。

这些数字没有标准答案，跑通之后你应该自己改改看效果。
"""

import json
import re
import sys
from pathlib import Path

CHUNK_SIZE = 1200      # 每块目标字符数
CHUNK_OVERLAP = 200    # 相邻块的重叠字符数
MIN_CHUNK = 120        # 短于这个的块直接丢掉（多半是页眉页脚残渣）

DEFAULT_PDF = Path.home() / "Downloads" / "Agentic_Design_Patterns.pdf"
OUT_PATH = Path(__file__).parent / "data" / "book_chunks.json"


def clean(text: str) -> str:
    """把 PDF 抽出来的脏文本洗干净。

    PDF 里的文字是「画」上去的，不是排版好的。这本书抽出来是这样：

        "the\n \nspecifications.\n \nThe\n \nfull_chain\n"

    原书是 Google Docs 导出的，**每个单词后面跟一个换行加空格**。
    实测某页 2867 个字符里有 427 个换行，等于一词一行。

    我第一版想「保留段落、只压缩句内换行」，结果失败了：
    段落分隔符长得和单词分隔符一模一样（都是 \n + 空格 + \n），
    正则区分不开，整本书被切成了十五万个单词段落。

    所以这里做一个明确的取舍：**放弃段落结构，把所有连续空白压成一个空格。**
    理由是这本 PDF 里根本没有段落结构可捞——它在导出时就丢了。
    而对检索来说也不需要：块本身就是切分单位，模型读连续文字毫无问题。

    如果你换一本排版正常的 PDF，这里可以改回保留 \n\n。
    """
    text = re.sub(r"-\n\s*(\w)", r"\1", text)   # 接回被连字符拆到两行的词
    text = re.sub(r"\s+", " ", text)             # 所有连续空白 → 一个空格
    return text.strip()


def split_into_chunks(text: str, page: int) -> list[dict]:
    """按字符数切块，尽量在句子边界断开。"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE

        if end < len(text):
            # 在目标位置往前找最近的句号/换行，避免把句子切成两半
            window = text[start + CHUNK_SIZE // 2 : end]
            m = None
            for m in re.finditer(r"[.!?]\s", window):
                pass                                 # 取最后一个匹配
            if m:
                end = start + CHUNK_SIZE // 2 + m.end()

        piece = text[start:end].strip()
        if len(piece) >= MIN_CHUNK:
            chunks.append({"page": page, "text": piece})

        if end >= len(text):
            break
        start = end - CHUNK_OVERLAP                  # 回退一点，制造重叠

    return chunks


def main() -> None:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF

    if not pdf_path.exists():
        print(f"✗ 找不到 PDF：{pdf_path}\n")
        print("  把书放到 ~/Downloads/Agentic_Design_Patterns.pdf，")
        print("  或者直接指定路径：python step0_prepare_book.py /你的/书.pdf")
        sys.exit(1)

    try:
        from pypdf import PdfReader
    except ImportError:
        print("✗ 缺少 pypdf。先激活虚拟环境，再 pip install -r requirements.txt")
        sys.exit(1)

    print(f"读取 {pdf_path.name} …")
    reader = PdfReader(str(pdf_path))
    total_pages = len(reader.pages)

    all_chunks: list[dict] = []
    empty_pages = 0

    for i, page in enumerate(reader.pages, start=1):
        raw = page.extract_text() or ""
        text = clean(raw)
        if len(text) < MIN_CHUNK:
            empty_pages += 1          # 纯图片页、封面、分隔页——正常现象
            continue
        all_chunks.extend(split_into_chunks(text, page=i))

        if i % 50 == 0:
            print(f"  已处理 {i}/{total_pages} 页，累计 {len(all_chunks)} 块")

    # 编号放在最后统一加，保证 id 连续
    for n, c in enumerate(all_chunks):
        c["id"] = n

    OUT_PATH.parent.mkdir(exist_ok=True)
    OUT_PATH.write_text(
        json.dumps(all_chunks, ensure_ascii=False, indent=1), encoding="utf-8"
    )

    avg = sum(len(c["text"]) for c in all_chunks) // max(len(all_chunks), 1)
    print(f"\n✓ 完成")
    print(f"  {total_pages} 页 → {len(all_chunks)} 个文本块（平均 {avg} 字符）")
    print(f"  跳过 {empty_pages} 页（纯图片或空白页，正常）")
    print(f"  写入 {OUT_PATH.relative_to(Path.cwd()) if OUT_PATH.is_relative_to(Path.cwd()) else OUT_PATH}")

    print("\n  抽一块看看长什么样：\n")
    sample = all_chunks[len(all_chunks) // 2]
    print(f"  [id={sample['id']}  第 {sample['page']} 页]")
    print(f"  {sample['text'][:300]}…\n")

    print("下一步：python step1_bare_call.py")


if __name__ == "__main__":
    main()
