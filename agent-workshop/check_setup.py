"""一键自检：把「跑不起来」的原因在这里全部暴露出来。

用法：  python check_setup.py

它按依赖顺序检查五件事，任何一步失败就停下并告诉你怎么修。
全绿之后再去跑 step1，不然后面每一步都会栽在同一个坑上。
"""

import os
import sys

OK = "\033[32m✓\033[0m"
NO = "\033[31m✗\033[0m"

MODEL = "claude-opus-5"


def fail(msg: str, fix: str) -> None:
    print(f"{NO} {msg}")
    print(f"\n   怎么修：{fix}\n")
    sys.exit(1)


def main() -> None:
    print("\n检查环境…\n")

    # 1. Python 版本 -------------------------------------------------------
    major, minor = sys.version_info[:2]
    if (major, minor) < (3, 10):
        fail(
            f"Python 版本太低：{major}.{minor}",
            "需要 3.10 以上。去 python.org 装个新版本，然后重建虚拟环境。",
        )
    print(f"{OK} Python {major}.{minor}")

    # 2. 虚拟环境（不是硬性要求，但装错地方是最常见的坑）--------------------
    in_venv = sys.prefix != sys.base_prefix
    if in_venv:
        print(f"{OK} 虚拟环境已激活")
    else:
        print("  ! 没有检测到虚拟环境（能跑，但建议用 venv 隔离依赖）")
        print("    source .venv/bin/activate")

    # 3. 依赖 --------------------------------------------------------------
    missing = []
    for pkg, import_name in [
        ("anthropic", "anthropic"),
        ("python-dotenv", "dotenv"),
        ("pypdf", "pypdf"),
        ("numpy", "numpy"),
    ]:
        try:
            __import__(import_name)
        except ImportError:
            missing.append(pkg)
    if missing:
        fail(
            f"缺少依赖：{', '.join(missing)}",
            "先确认虚拟环境已激活（提示符前有 (.venv)），再运行：\n"
            "        pip install -r requirements.txt",
        )
    print(f"{OK} 依赖齐全")

    # 4. API key -----------------------------------------------------------
    from dotenv import load_dotenv

    load_dotenv()
    key = os.environ.get("ANTHROPIC_API_KEY", "").strip()

    if not key:
        fail(
            "没找到 ANTHROPIC_API_KEY",
            "cp .env.example .env  然后编辑 .env，把 key 填进去。\n"
            "        key 在 https://console.anthropic.com → API Keys 创建。",
        )
    # 模板占位符没换掉，是新手第一次配置时最常见的一种「看起来配好了」
    if "你的key" in key or "YOUR" in key.upper() or key.rstrip() == "sk-ant-":
        fail(
            ".env 里还是模板里的占位文字，没有换成真正的 key",
            "打开 .env，把等号后面那一整串（sk-ant-你的key粘贴在这里）\n"
            "        整个删掉，粘上你从 console.anthropic.com 复制的那串。\n"
            "        等号后面不应该留下任何中文。",
        )

    if key.startswith(("'", '"')) or key.endswith(("'", '"')):
        fail(
            "key 两端带了引号",
            ".env 里不需要引号，直接写 ANTHROPIC_API_KEY=sk-ant-xxx",
        )
    if not key.startswith("sk-ant-"):
        fail(
            f"key 格式看着不对（以 {key[:8]}... 开头）",
            "Anthropic 的 key 都以 sk-ant- 开头。确认没复制错、没粘漏。",
        )
    print(f"{OK} API key 已读到（{key[:12]}…）")

    # 5. 真的调一次 --------------------------------------------------------
    #    前面四项都是本地检查；只有真发一次请求，才知道 key 是否有效、
    #    网络是否通、账户有没有额度。
    print("\n  正在做一次真实调用（几秒钟，花费不到 0.01 元）…")

    import anthropic

    client = anthropic.Anthropic()
    try:
        resp = client.messages.create(
            model=MODEL,
            max_tokens=64,
            messages=[{"role": "user", "content": "回复两个字：成功"}],
        )
    except anthropic.AuthenticationError:
        fail(
            "key 无效（认证失败）",
            "去 console.anthropic.com 确认这个 key 还在、没被删。必要时重新建一个。",
        )
    except anthropic.PermissionDeniedError:
        fail(
            "key 没有权限，或账户欠费",
            "去 console.anthropic.com 的 Billing 页面看看有没有余额。",
        )
    except anthropic.NotFoundError:
        fail(
            f"模型名不存在：{MODEL}",
            "检查 MODEL 变量。别自己给模型名拼日期后缀。",
        )
    except anthropic.RateLimitError:
        fail("被限流了", "等一分钟再试。这属于临时性故障（见模式 12 异常处理）。")
    except anthropic.APIConnectionError:
        fail(
            "连不上 Anthropic 服务器",
            "检查网络。国内网络环境可能需要代理。",
        )

    text = "".join(b.text for b in resp.content if b.type == "text").strip()
    print(f"{OK} 调用成功，模型回了：{text!r}")
    print(f"   用量：输入 {resp.usage.input_tokens} token，"
          f"输出 {resp.usage.output_tokens} token")

    print("\n环境没问题，可以开始了：\n")
    print("    python step0_prepare_book.py")
    print("    python step1_bare_call.py\n")


if __name__ == "__main__":
    main()
