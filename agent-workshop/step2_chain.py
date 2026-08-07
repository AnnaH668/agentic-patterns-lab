"""第 2 步：提示链——把一件大事拆成一串小事。

    python step2_chain.py

对应知识平台：模式 01 提示链（Prompt Chaining）

──────────────────────────────────────────────────────────────
这一步加的东西：**多次调用，前一次的输出当后一次的输入。**
──────────────────────────────────────────────────────────────
注意它还**不是** Agent：走哪几步是你在代码里写死的，模型没有任何选择权。
这叫 workflow（工作流），不叫 agent。区别就在「谁决定下一步做什么」。

这个区别很重要，因为大部分人真正需要的是 workflow，不是 agent。
流程固定就写死——更便宜、更快、更可预测、出了错好查。

为什么要拆？一个提示塞三件事，模型会顾此失彼：格式对了内容就浅，
内容深了格式就崩。拆开之后每次只干一件事，每一步的中间结果你都能
打印出来看、能单独改、能换掉。

**代价是真实的**：三步链 = 三倍延迟 + 三倍价钱，而且错误会累积。
每步 95% 正确，三步串下来 0.95³ ≈ 86%；十步就只剩 60%。
链条越长越脆，这不是玄学，是乘法。
"""

import sys

from dotenv import load_dotenv

load_dotenv()

import anthropic

MODEL = "claude-opus-5"
client = anthropic.Anthropic()

TOPIC = "AI agent 的工具调用（tool use）"


def call(system: str, user: str, label: str) -> str:
    """一次调用，顺便把用量打出来——链条的成本就是这么一步步加上去的。"""
    print(f"\n{'━' * 62}\n▶ {label}\n{'━' * 62}")

    resp = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    text = "".join(b.text for b in resp.content if b.type == "text").strip()

    print(text)
    print(f"\n  [本步 token：入 {resp.usage.input_tokens} / "
          f"出 {resp.usage.output_tokens}]")
    return text


def main() -> None:
    try:
        # ── 第 1 环：只做提纲，不写正文 ────────────────────────────
        # 单独做这一步，是为了让结构先定下来。如果提纲就跑偏了，
        # 你在这里就能看出来，不用等到读完三段废话。
        outline = call(
            system="你是技术写作者。只输出提纲，不要写正文。",
            user=f"给「{TOPIC}」列一个三点提纲，讲给完全没接触过的新手。"
                 f"每点一行，不超过 15 字。",
            label="第 1 环：拆提纲",
        )

        # ── 第 2 环：拿上一环的输出当输入 ──────────────────────────
        # 这一行就是「链」的全部含义：outline 变量流进了下一个提示。
        explain = call(
            system="你是技术写作者。用具体例子，不要空话。",
            user=f"按下面这个提纲，把「{TOPIC}」讲清楚。\n"
                 f"每点写 2-3 句，必须举一个具体场景。\n\n"
                 f"提纲：\n{outline}",
            label="第 2 环：按提纲展开",
        )

        # ── 第 3 环：压缩 ──────────────────────────────────────────
        # 「先展开再压缩」比「直接让它写得短」质量高得多。
        # 因为压缩的时候，模型面对的是已经想清楚的内容，不是空白页。
        call(
            system="你在做速记卡。只留最关键的，宁可少不可凑。",
            user=f"把下面这段压缩成一张速记卡：一句话定义 + 三个要点，"
                 f"每个要点不超过 20 字。\n\n{explain}",
            label="第 3 环：压成速记卡",
        )

    except anthropic.AuthenticationError:
        print("✗ key 不对。先跑 python check_setup.py")
        sys.exit(1)
    except anthropic.APIConnectionError:
        print("✗ 连不上服务器，检查网络")
        sys.exit(1)

    print(f"""
{'─' * 62}

  刚才发生了什么：三次独立调用，用变量把它们串起来。
  第 2 环看得见第 1 环的输出，第 3 环看得见第 2 环的。

  ⚠️ 但模型自己**并不知道**它在一条链里。每次调用对它来说都是全新的、
     孤立的一次对话——上下文是你手动拼进去的。
     模型没有记忆这件事，到 step5 才会正面解决。

  想自己验证「拆开有没有用」？把这三环合成一个大提示跑一次，
  对比一下输出质量。通常结构会明显变松散。

  下一步是真正的分水岭——让模型自己决定调用什么：
      python step3_tools.py
""")


if __name__ == "__main__":
    main()
