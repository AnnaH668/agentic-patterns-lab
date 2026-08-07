"""第 5 步：记忆——短期（这轮对话）和长期（跨会话）。

    python step5_memory.py          进入多轮对话，输入 quit 退出

前置：先跑过 python step0_prepare_book.py
对应知识平台：模式 08 记忆管理

──────────────────────────────────────────────────────────────
先破除一个误解：**模型本身没有记忆，一点都没有。**
──────────────────────────────────────────────────────────────
每次调用都是全新的。ChatGPT 之所以「记得」你上一句说了什么，
不是因为它记住了，而是因为程序**把整段历史重新发了一遍**。

所以「给 agent 加记忆」的真实含义是：你负责决定每次带哪些内容过去。
记忆是个工程问题，不是模型能力问题。

两种记忆，解决的是完全不同的问题：

  短期记忆 = messages 列表。这轮对话里说过的话。
      实现：不清空 messages，一直往后 append。就这么简单。
      代价：**它会一直变长，而你每一轮都要为全部历史付钱。**
            聊到第 20 轮时，你在重复发送第 1 轮的内容，第 20 次。

  长期记忆 = 存到文件/数据库，下次启动读回来。
      实现：给模型一个「记住这件事」的工具，让它自己决定存什么。
      难点不在存，在**取**：存了几千条，这次该带哪几条进上下文？
      这里用最笨的办法（全带上），因为条数少。真实系统里要按相关度检索——
      也就是说，长期记忆最后还是变成一个 RAG 问题。
"""

import json
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

import anthropic

from retrieval import search_book
from step4_rag import search_the_book

MODEL = "claude-opus-5"
client = anthropic.Anthropic()

MEMORY_PATH = Path(__file__).parent / "data" / "memory.json"

# 上下文超过这个长度就该处理了。这里只是提醒你，不自动截断——
# 让你亲眼看着数字涨上去，比读十遍「注意上下文管理」有用。
CONTEXT_WARN = 25_000


# ══════════════════════════════════════════════════════════════
# 长期记忆：两个工具
# ══════════════════════════════════════════════════════════════

def load_memory() -> list[str]:
    if MEMORY_PATH.exists():
        return json.loads(MEMORY_PATH.read_text(encoding="utf-8"))
    return []


def remember(fact: str) -> str:
    """把一条事实写进长期记忆。

    让**模型自己决定**存什么，是这一步的关键设计。
    你也可以改成每轮都由代码自动抽取——但那样存进去的多半是废话。
    模型知道什么值得记：偏好、目标、纠正过的错误。
    """
    facts = load_memory()
    if fact in facts:
        return "这条已经记过了。"
    facts.append(fact)
    MEMORY_PATH.parent.mkdir(exist_ok=True)
    MEMORY_PATH.write_text(
        json.dumps(facts, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    print(f"   💾 写入长期记忆：{fact}")
    return f"已记住。当前共 {len(facts)} 条。"


TOOLS = [
    {
        "name": "search_the_book",
        "description": (
            "在《Agentic Design Patterns》全书中检索原文，返回片段和页码。"
            "回答书中内容前必须调用。"
            "**query 必须是英文关键词**（书是英文的，按字面匹配），"
            "2-5 个词，例如 'reflection producer critic'。"
        ),
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
    {
        "name": "remember",
        "description": (
            "把一条关于用户的长期事实存起来，下次启动仍然有效。"
            "适合存：用户的身份背景、学习目标、明确表达的偏好、纠正过你的地方。"
            "不要存：这轮对话的临时内容、你自己的推测、书里的知识。"
            "用户说「记住…」时必须调用。"
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "fact": {
                    "type": "string",
                    "description": "一句话，第三人称，例如「用户是产品经理，没有编程基础」",
                }
            },
            "required": ["fact"],
        },
    },
]

IMPLS = {"search_the_book": search_the_book, "remember": remember}


def build_system() -> str:
    """每次启动重新拼 system——长期记忆就是这样「回到」上下文里的。"""
    base = """你是《Agentic Design Patterns》的学习助手，服务中文读者。

规矩：
1. 回答书中内容前必须先用 search_the_book 查证，并标注页码（第 X 页）。
2. 查不到就说查不到，不要编。
3. 用户透露了值得长期记住的信息时，主动调用 remember。
4. 用中文回答，专业术语保留英文原词。
"""
    facts = load_memory()
    if facts:
        base += "\n关于这位用户，你之前记住的事：\n"
        base += "\n".join(f"- {f}" for f in facts)
    return base


# ══════════════════════════════════════════════════════════════
# 带记忆的循环
# ══════════════════════════════════════════════════════════════

def chat_turn(messages: list, system: str) -> str:
    """处理一轮用户输入，可能内含多次工具调用。

    和 step3 的循环几乎一样，只有一个关键差别：
    **messages 是外面传进来的，函数结束后不销毁。**
    短期记忆的全部实现，就是这一个「不销毁」。
    """
    while True:
        resp = client.messages.create(
            model=MODEL,
            max_tokens=4000,
            system=system,
            tools=TOOLS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": resp.content})

        if resp.stop_reason != "tool_use":
            print(f"\n   [上下文已用 {resp.usage.input_tokens} token]", end="")
            if resp.usage.input_tokens > CONTEXT_WARN:
                print(" ⚠️ 在变长，注意成本", end="")
            print()
            return "".join(b.text for b in resp.content if b.type == "text")

        results = []
        for block in resp.content:
            if block.type != "tool_use":
                continue
            print(f"   🔧 {block.name}({json.dumps(block.input, ensure_ascii=False)})")
            fn = IMPLS.get(block.name)
            try:
                out = fn(**block.input) if fn else f"错误：没有 {block.name} 这个工具"
            except Exception as e:
                out = f"工具执行出错：{type(e).__name__}: {e}"
            results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": out,
            })
        messages.append({"role": "user", "content": results})


def main() -> None:
    try:
        search_book("warmup", k=1)          # 提前建索引，别让第一次提问卡住
    except FileNotFoundError as e:
        print(f"✗ {e}")
        sys.exit(1)

    facts = load_memory()
    print(f"""
{'═' * 62}
  多轮对话已启动。输入 quit 退出，输入 forget 清空长期记忆。

  长期记忆：{len(facts)} 条{'（第一次跑，还是空的）' if not facts else ''}
{chr(10).join('    · ' + f for f in facts)}

  建议这样试，才能看出两种记忆的区别：
    1. 「记住我是产品经理，没有编程基础」
    2. 「什么是 Reflection 模式？」          ← 它会查书
    3. 「那它和刚才说的有什么关系？」        ← 短期记忆：它知道「刚才」指什么
    4. quit 退出，然后**重新运行这个脚本**
    5. 「我是做什么的？」                    ← 长期记忆：跨会话还记得
{'═' * 62}
""")

    messages: list = []
    system = build_system()

    while True:
        try:
            user_input = input("\n你 › ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n再见。")
            break

        if not user_input:
            continue
        if user_input.lower() in {"quit", "exit", "q"}:
            print("再见。长期记忆已存在 data/memory.json，下次启动会读回来。")
            break
        if user_input.lower() == "forget":
            MEMORY_PATH.unlink(missing_ok=True)
            system = build_system()
            messages.clear()
            print("长期记忆已清空，短期记忆也重置了。")
            continue

        messages.append({"role": "user", "content": user_input})

        try:
            answer = chat_turn(messages, system)
        except anthropic.AuthenticationError:
            print("✗ key 不对。先跑 python check_setup.py")
            sys.exit(1)
        except anthropic.APIConnectionError:
            print("✗ 连不上服务器，检查网络。这轮没算数，可以重问。")
            messages.pop()
            continue

        print(f"\n助手 › {answer.strip()}")

    print("""
  聊了几轮之后，回头看那个 token 数字——它只会涨，不会降。
  这是所有长对话 agent 都要面对的问题，三种常见解法：

    · 截断：只留最近 N 轮。简单，但会突然「失忆」。
    · 摘要：老对话压成一段摘要塞进 system。省 token，但丢细节。
    · 检索：把历史存起来，每轮只捞相关的几段回来。
            ——注意这就是 step4 的 RAG，只是检索对象换成了聊天记录。

  下一步给它加护栏和容错：
      python step6_guardrails.py
""")


if __name__ == "__main__":
    main()
