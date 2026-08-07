"""第 1 步：一次裸调用。**这还不是 Agent。**

    python step1_bare_call.py

对应知识平台：基础篇 · Agent 到底是什么

──────────────────────────────────────────────────────────────
这一步的唯一目的：先看清最底层那一层长什么样。
──────────────────────────────────────────────────────────────
所有 Agent、所有框架、所有花哨的东西，剥到最后都是这一个函数调用：
把一段话发给模型，模型返回一段话。仅此而已。

一次调用之后，模型什么都不记得，什么都做不了，也没法验证自己说的对不对。
后面六步就是在这个赤裸的调用外面，一层一层加东西，直到它变成 Agent。

跑完你会看到两件事：
  1. 返回的不是一个字符串，是一个**结构化对象**（content 是个列表）
  2. 问它书里的具体内容，它会答得很像回事——但那多半是编的
"""

import os
import sys

from dotenv import load_dotenv

load_dotenv()

import anthropic

MODEL = "claude-opus-5"

client = anthropic.Anthropic()   # 自动从环境变量读 ANTHROPIC_API_KEY


def ask(question: str) -> None:
    print(f"\n{'─' * 62}\n问：{question}\n")

    try:
        resp = client.messages.create(
            model=MODEL,
            max_tokens=2000,     # 注意：思考和回答**共用**这个额度，别给太小
            messages=[{"role": "user", "content": question}],
        )
    except anthropic.AuthenticationError:
        print("✗ key 不对。先跑 python check_setup.py")
        sys.exit(1)
    except anthropic.APIConnectionError:
        print("✗ 连不上服务器，检查网络")
        sys.exit(1)

    # ── 返回的东西长什么样 ──────────────────────────────────────
    # resp.content 是个**列表**，不是字符串。为什么？因为一次回复里可能
    # 混着好几种块：思考块（thinking）、文字块（text）、工具调用块（tool_use）。
    # 新手最常见的错就是直接 print(resp.content) 然后一脸茫然。
    #
    # 记住这个取文字的写法，后面每一步都要用：
    text = "".join(b.text for b in resp.content if b.type == "text")

    print(text.strip())

    kinds = [b.type for b in resp.content]
    print(f"\n  [content 里的块类型：{kinds}]")
    print(f"  [stop_reason: {resp.stop_reason}]")
    print(f"  [token：输入 {resp.usage.input_tokens}，"
          f"输出 {resp.usage.output_tokens}]")

    if resp.stop_reason == "max_tokens":
        print("  ⚠️  被截断了！调大 max_tokens 再试")


def main() -> None:
    # 1. 它能做的事：凭已有知识回答
    ask("用两句话解释什么是 AI agent。")

    # 2. 它做不到的事：查证具体来源
    #    模型没读过你手上这本 PDF。但它**不会说不知道**，
    #    它会用训练时见过的相似内容拼出一个听起来很合理的答案。
    #    这就是幻觉，也是 step4 要用检索解决的问题。
    ask("《Agentic Design Patterns》这本书第 66 页讲的是哪个模式？"
        "原文用了哪两个角色名？")

    print(f"\n{'─' * 62}")
    print("""
  停下来想想第二个回答。

  它答得很流畅、很自信。但模型根本没看过你 Downloads 里那个 PDF——
  它是在**猜**。可能猜对了（这本书在训练数据里的概率不低），
  也可能整段是编的，而你从语气上完全分不出来。

  这就是裸调用的三个天花板：
    · 不知道 → 没有外部信息，只能靠训练时记住的
    · 不记得 → 这次对话结束，下次它完全不认识你
    · 做不了 → 它只能吐字，不能查、不能算、不能改文件

  下一步先解决「一次做不完的事怎么办」：
      python step2_chain.py
""")


if __name__ == "__main__":
    main()
