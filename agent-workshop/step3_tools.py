"""第 3 步：工具 + 循环。**到这一步才配叫 Agent。**

    python step3_tools.py
    python step3_tools.py "你自己的问题"

对应知识平台：模式 05 工具使用、模式 17 推理技术（ReAct）

──────────────────────────────────────────────────────────────
这一步加的东西：**模型可以决定调用什么，代码在循环里执行它。**
──────────────────────────────────────────────────────────────
step2 里，走几步、走哪几步，是你写死的。
这里不一样：你只给模型一份「工具清单」，它自己决定用不用、用哪个、
用几次、按什么顺序。你的代码只负责**执行它点的菜，然后把结果端回去**。

这个「决定权在模型手上」的转移，就是 workflow 和 agent 的分界线。

循环长这样，一共就四行逻辑：

    while True:
        resp = 发给模型(对话历史)
        if resp.stop_reason != "tool_use":   # 它不想调工具了 → 说完了
            break
        对话历史 += 模型的这轮输出
        对话历史 += 我执行工具得到的结果

框架（LangGraph、CrewAI）替你写的核心，就是这个 while。
这里手写一遍，是为了让你**亲眼看见模型吐出来的那段 tool_use 长什么样**。
用框架你永远看不到它。
"""

import ast
import json
import operator
import sys
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

import anthropic

MODEL = "claude-opus-5"
client = anthropic.Anthropic()

DEFAULT_QUESTION = "现在是几点？另外，如果一个 agent 每一步的成功率是 95%，" \
                   "连续 12 步之后整体成功率是多少？算出百分比。"


# ══════════════════════════════════════════════════════════════
# 一、工具的实现（就是普通 Python 函数，没有任何魔法）
# ══════════════════════════════════════════════════════════════

def get_now() -> str:
    """模型不可能知道现在几点——它的知识停在训练截止那天。"""
    return datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")


# 只允许这几种运算。**不要用 eval()**——
# eval("__import__('os').system('rm -rf ~')") 会真的执行。
# 这是模式 18 护栏里说的「永远不要把模型的输出直接当代码跑」。
_OPS = {
    ast.Add: operator.add, ast.Sub: operator.sub,
    ast.Mult: operator.mul, ast.Div: operator.truediv,
    ast.Pow: operator.pow, ast.USub: operator.neg,
    ast.Mod: operator.mod, ast.FloorDiv: operator.floordiv,
}


def _safe_eval(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in _OPS:
        return _OPS[type(node.op)](_safe_eval(node.left), _safe_eval(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _OPS:
        return _OPS[type(node.op)](_safe_eval(node.operand))
    raise ValueError("只支持数字和 + - * / ** % // 运算")


def calculate(expression: str) -> str:
    """模型算数不可靠，尤其是小数幂。这类事一律交给代码。"""
    try:
        return str(_safe_eval(ast.parse(expression, mode="eval").body))
    except Exception as e:
        # 出错也要**返回给模型**，不要抛异常中断循环。
        # 模型看到错误信息通常会自己改写表达式重试——这就是 agent 的自愈。
        return f"计算失败：{e}"


TOOL_IMPLS = {"get_now": get_now, "calculate": calculate}


# ══════════════════════════════════════════════════════════════
# 二、工具的说明书（模型只能看到这个，看不到上面的代码）
# ══════════════════════════════════════════════════════════════
# description 写得好不好，直接决定模型会不会用、用得对不对。
# 它是**给模型读的文档**，不是给同事读的注释。要写清楚：
# 这个工具干什么、什么时候该用、参数是什么格式。

TOOLS = [
    {
        "name": "get_now",
        "description": "获取当前的真实日期和时间（含时区）。"
                       "任何涉及「现在」「今天」「此刻」的问题都必须调用它，"
                       "不要根据自己的知识猜测当前时间。",
        "input_schema": {"type": "object", "properties": {}, "required": []},
    },
    {
        "name": "calculate",
        "description": "计算一个数学表达式并返回精确结果。"
                       "涉及乘方、小数、多位数运算时必须使用，不要心算。"
                       "只支持数字和 + - * / ** % // 运算符。",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "Python 语法的数学表达式，例如 0.95 ** 12",
                }
            },
            "required": ["expression"],
        },
    },
]


# ══════════════════════════════════════════════════════════════
# 三、循环
# ══════════════════════════════════════════════════════════════

def run_agent(
    question: str,
    tools: list | None = None,
    impls: dict | None = None,
    system: str | None = None,
    max_turns: int = 10,
) -> str:
    """通用的 agent 循环。

    注意它对「有哪些工具」一无所知——工具是参数传进来的。
    step4 会原样 import 这个函数，只换一份工具清单，就变成了知识问答 agent。
    循环本身一行都不用改。这不是巧合：**循环是通用的，能力全在工具里。**
    """
    tools = TOOLS if tools is None else tools
    impls = TOOL_IMPLS if impls is None else impls

    messages = [{"role": "user", "content": question}]

    for turn in range(1, max_turns + 1):
        kwargs = {"system": system} if system else {}
        resp = client.messages.create(
            model=MODEL,
            max_tokens=4000,
            tools=tools,
            messages=messages,
            **kwargs,
        )

        # 把模型这一轮说的话原样存进历史。
        # 必须是**整个 resp.content**，不能只挑 text 块——
        # 里面的 thinking 块和 tool_use 块下一轮还要用，漏了会报 400。
        messages.append({"role": "assistant", "content": resp.content})

        # 看看它这轮说了什么、想调什么
        for block in resp.content:
            if block.type == "text" and block.text.strip():
                print(f"\n💭 模型：{block.text.strip()}")
            elif block.type == "tool_use":
                print(f"\n🔧 模型要调工具：{block.name}")
                print(f"   参数：{json.dumps(block.input, ensure_ascii=False)}")

        # ── 出口：它不想再调工具了，说明答完了 ──────────────────
        if resp.stop_reason != "tool_use":
            return "".join(b.text for b in resp.content if b.type == "text")

        # ── 执行它点的每一个工具 ─────────────────────────────────
        results = []
        for block in resp.content:
            if block.type != "tool_use":
                continue

            fn = impls.get(block.name)
            if fn is None:
                # 模型偶尔会调一个根本不存在的工具（幻觉）。
                # 照样返回结果块，只是内容是错误说明——别让循环崩掉。
                out = f"错误：没有名为 {block.name} 的工具"
            else:
                try:
                    out = fn(**block.input)
                except Exception as e:
                    out = f"工具执行出错：{type(e).__name__}: {e}"

            print(f"   ← 返回：{out}")

            results.append({
                "type": "tool_result",
                "tool_use_id": block.id,   # 必须原样带回，模型靠它对上号
                "content": out,
            })

        # 工具结果是以 **user 角色**送回去的。第一次看会觉得别扭，
        # 但 API 就这么设计的：所有非模型产出的内容都算 user。
        messages.append({"role": "user", "content": results})

    return "（达到最大轮数还没结束——多半是工具描述写得不清楚，模型在原地打转）"


def main() -> None:
    question = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_QUESTION
    print(f"问：{question}")

    try:
        answer = run_agent(question)
    except anthropic.AuthenticationError:
        print("\n✗ key 不对。先跑 python check_setup.py")
        sys.exit(1)
    except anthropic.APIConnectionError:
        print("\n✗ 连不上服务器，检查网络")
        sys.exit(1)

    print(f"\n{'═' * 62}\n最终回答：\n{answer.strip()}\n{'═' * 62}")
    print("""
  往上翻，看那几行 🔧。那就是 tool_use ——模型不会自己执行任何东西，
  它只是**说**「我要调 calculate，参数是 0.95 ** 12」。
  真正跑代码的是你的 Python。模型连你的电脑都碰不到。

  这一点值得记牢：模型没有手，只有嘴。所有实际动作都是你的代码做的，
  所以**能做什么、不能做什么，完全由你给的工具决定**。这也是安全的边界。

  你已经有一个 agent 了。但它现在只能看时间和算数——
  下一步给它一双能读书的眼睛：
      python step4_rag.py
""")


if __name__ == "__main__":
    main()
