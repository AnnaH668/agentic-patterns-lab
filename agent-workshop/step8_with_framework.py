"""附录：同样的 agent，用官方 Tool Runner 写。

    python step8_with_framework.py
    python step8_with_framework.py "反思模式的两个角色是什么？"

对应知识平台：基础篇 · 框架怎么选

──────────────────────────────────────────────────────────────
现在才让你看框架，是故意的。
──────────────────────────────────────────────────────────────
如果第一天就给你这个文件，你会觉得「哦，agent 就是调个 tool_runner」，
然后在它出问题的时候完全不知道从哪查起——因为你从没见过里面那个 while。

现在你见过了。所以你能看懂下面这段代码到底替你做了什么：
它就是 step3 那个循环，别人写好了而已。

──────────────────────────────────────────────────────────────
省了什么
──────────────────────────────────────────────────────────────
step3 手写循环那部分大约 55 行：发请求、判断 stop_reason、
append 历史、遍历 tool_use 块、执行、拼 tool_result、对 id、防崩溃。
这里 3 行。

而且 @beta_tool 会**从函数签名和 docstring 自动生成 input_schema**——
step3 里那三十行手写的 JSON Schema 全省了。函数签名就是工具定义，
两者永远不会不同步（手写 schema 最常见的 bug 就是改了函数忘了改 schema）。

──────────────────────────────────────────────────────────────
失去了什么
──────────────────────────────────────────────────────────────
默认情况下你**看不见中间过程**。它调了几次工具、每次传了什么参数、
哪一次返回了空——都在 until_done() 里面悄悄发生了。
下面用 for 循环遍历 runner 把它打印出来，就是为了演示：
框架不是不让你看，是你得知道去哪看。

这就是「先手写再用框架」的全部理由：
**你调试的是循环，不是模型。** 看不见循环的时候，你什么都调不了。

──────────────────────────────────────────────────────────────
那 LangChain / LangGraph / CrewAI 呢
──────────────────────────────────────────────────────────────
它们比这个更上层，解决的也不只是循环：多 agent 编排、状态图、
持久化、可视化调试。但底下那一层，仍然是这个 while。

选型的实话：
  · 单 agent + 几个工具 → 官方 SDK 就够，别引入框架
  · 流程固定、分支明确 → LangGraph（把流程画成图，好调试）
  · 多个角色分工协作   → CrewAI / AutoGen
  · 不确定需要什么     → **先手写。** 等你说得出「我需要 X，手写太麻烦」，
                          再去找有 X 的框架。反过来做，你会被框架绑架。
"""

import sys

from dotenv import load_dotenv

load_dotenv()

import anthropic
from anthropic import beta_tool

from retrieval import search_book

MODEL = "claude-opus-5"
client = anthropic.Anthropic()

SYSTEM = """你是《Agentic Design Patterns》的学习助手，服务中文读者。
回答书中内容前必须先检索并标注页码（第 X 页）。查不到就说查不到，不编。
用中文回答，专业术语保留英文原词。"""


# ══════════════════════════════════════════════════════════════
# 工具：一个装饰器，没有 JSON Schema
# ══════════════════════════════════════════════════════════════
# 对比 step3 里那三十行手写 schema。这里的类型标注 (query: str) 和
# docstring 会被自动转成 input_schema —— 而 **docstring 就是模型看到的
# 工具描述**，所以它要写给模型看，不是写给同事看。

@beta_tool
def search_the_book(query: str) -> str:
    """检索《Agentic Design Patterns》原文，返回相关片段和页码。

    回答关于这本书的任何具体问题前，都必须先调用它，不要凭记忆回答。
    这本书是英文的，检索按英文单词字面匹配。

    Args:
        query: 英文关键词，2-5 个词，空格分隔。
               好例子：'reflection producer critic'
               坏例子：'反思模式是什么'
    """
    hits = search_book(query, k=4)
    if not hits:
        return f"没有找到与「{query}」匹配的内容，请换英文关键词重试。"
    return "\n\n---\n\n".join(
        f"[第 {h['page']} 页]\n{h['text']}" for h in hits
    )


def main() -> None:
    question = sys.argv[1] if len(sys.argv) > 1 else \
        "这本书第 66 页讲的是哪个模式？原文用了哪两个角色名？"
    print(f"问：{question}\n")

    try:
        search_book("warmup", k=1)
    except FileNotFoundError as e:
        print(f"✗ {e}")
        sys.exit(1)

    # ── 全部的 agent 逻辑，就这一段 ──────────────────────────────
    try:
        runner = client.beta.messages.tool_runner(
            model=MODEL,
            max_tokens=4000,
            system=SYSTEM,
            tools=[search_the_book],
            messages=[{"role": "user", "content": question}],
            max_iterations=8,          # 对应 step3 里的 max_turns，防止烧钱
        )

        # 遍历 runner 就能看见每一轮——不遍历的话直接 runner.until_done()
        # 一行拿最终结果，但中间过程就完全看不到了。
        for message in runner:
            for block in message.content:
                if block.type == "tool_use":
                    print(f"   🔧 {block.name}({block.input})")

        final = runner.until_done()

    except anthropic.AuthenticationError:
        print("✗ key 不对。先跑 python check_setup.py")
        sys.exit(1)
    except anthropic.APIConnectionError:
        print("✗ 连不上服务器，检查网络")
        sys.exit(1)

    answer = "".join(b.text for b in final.content if b.type == "text")
    print(f"\n{'═' * 62}\n{answer.strip()}\n{'═' * 62}")

    print("""
  和 step4 的输出对比一下——**结果应该是一样的**。

  不一样的是你现在的位置：
    · step3/4 里，那个 while 是你写的，你知道每一行为什么在那
    · 这里，那个 while 是 SDK 写的，但你**读得懂它在干什么**

  这两者的差别不在代码，在于出问题的时候你能不能修。

  ──────────────────────────────────────────────────────────
  接下来往哪走（按性价比排序）：

  1. 换掉这本书。把 step0 指向你自己的 PDF：
         python step0_prepare_book.py ~/Downloads/你的文件.pdf
     一行不用改，你就有了一个自己领域的问答 agent。
     **这是最值得做的一件事**——真正的理解发生在你把它用到自己问题上的时候。

  2. 加一个真正有副作用的工具（写文件、发请求、查数据库）。
     只读工具出错最多是答错；有副作用的工具出错是真的会搞坏东西。
     从这里开始，你会真正需要模式 13 的人类审核（HITL）。

  3. 把 step7 的评测集扩到 20 题，加你自己遇到的 badcase。
     然后每改一次代码都跑一遍。这是把 demo 变成产品的分水岭。

  4. 回知识平台，把那 21 个模式当成菜单重读一遍。
     现在每个模式对你都不再是名词了——你知道它要往这个循环的哪个位置插。
""")


if __name__ == "__main__":
    main()
