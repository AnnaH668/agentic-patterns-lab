# Agent Workshop — 从零搭一个能问答这本书的 Agent

配套知识平台：`../agentic-patterns-lab/`（网页版教材）
这里是练习册。**左边开网页看原理，右边开终端跑代码。**

最终成果：一个能回答《Agentic Design Patterns》这本 PDF 内容的 Agent。
你学的材料和你搭出来的东西是同一个。

---

## 开源版说明：data/ 不在仓库里

`data/book_chunks.json` 是原书全文切块的结果，**没有随仓库发布**——
那等于转载整本书。你需要自己准备一份 PDF，然后跑：

```bash
python step0_prepare_book.py /你的/书.pdf
```

换任何一本 PDF 都行，后面七步不用改一行代码。

---

## 这些代码验证到什么程度

明说，因为这直接影响你踩坑时该先怀疑谁。

**已实测跑通**（都不需要 API key，你克隆下来就能自己复现）

- `step0_prepare_book.py` → 482 页 PDF 切成 **1033 个文本块**（平均 912 字符）
- `retrieval.py` 自测 → 查 `reflection producer critic` 命中原书第 66 页
  Producer/Critic 那一段，相关度 0.615
- 全部文件通过语法检查；离线路径逐个测过：
  安全计算器（含 `eval` 注入尝试被挡）、检索工具、输入与输出护栏、
  评测的确定性检查、工具 schema 自动生成

**未实测**

- `step1`–`step8` 里真正发出网络请求的那几行。

  这些代码不是伪代码，是照着 Anthropic 官方 SDK 的当前接口写的，
  但**作者没有配置 API key，所以真实调用从未执行过**。
  你很可能是第一个跑它的人——**遇到问题请提 issue**，那对这个项目很有价值。

---

## 第 0 步：环境准备（零基础从这里开始）

### 0.1 打开终端

Mac 上按 `Command + 空格`，输入 `Terminal`，回车。
弹出的这个黑框（或白框）就是终端。下面所有以 `$` 开头的命令，都是在这里敲的——
**`$` 本身不用输入**，它只是提示符。

先进到这个项目目录：

```bash
cd 你克隆下来的目录/agent-workshop
```

### 0.2 确认 Python

```bash
python3 --version
```

看到 `Python 3.10` 或更高就行。如果提示 `command not found`，去 python.org 装一个。

### 0.3 建一个虚拟环境（venv）

**为什么需要**：装依赖包时，如果直接装到系统 Python 里，不同项目之间会互相污染
（这个项目要 A 库的 1.0，那个项目要 2.0，就打架了）。虚拟环境相当于给这个项目
单独开一个干净的房间，装什么都只影响它自己。

```bash
python3 -m venv .venv
source .venv/bin/activate
```

第二行执行完，你的命令提示符前面会多出 `(.venv)`。**看到它才算激活成功。**

> 每次新开终端窗口都要重新 `source .venv/bin/activate`。忘了激活的话，
> 会报 `ModuleNotFoundError: No module named 'anthropic'`——这是最常见的一个坑。

### 0.4 装依赖

```bash
pip install -r requirements.txt
```

### 0.5 拿到 API key

1. 打开 https://console.anthropic.com
2. 注册 / 登录
3. 左侧 **API Keys** → **Create Key**
4. 复制那串以 `sk-ant-` 开头的字符

> **key 只显示一次**，关掉就再也看不到了，复制好再关。

### 0.6 把 key 放到 .env 文件里

```bash
cp .env.example .env
```

然后用任意编辑器打开 `.env`，把 `sk-ant-你的key粘贴在这里` 换成你刚复制的那串。

**为什么不直接写在代码里**：代码是要给别人看、要传到 GitHub 的。
key 写进代码 = 把家门钥匙贴在门上。别人拿到你的 key 就能用你的钱。
`.env` 已经写进 `.gitignore`，永远不会被提交上去。

**这条规则没有例外，也没有「就这一次」。**

### 0.7 自检

```bash
python check_setup.py
```

它会依次检查：Python 版本 → 依赖装没装 → key 在不在 → 能不能真的调通模型。
**全绿了再往下走**，不然后面每一步都会报同样的错。

---

## 七步实战

每一步都能单独跑：`python stepN_xxx.py`。
每个文件顶部都标了它对应知识平台里的哪个模式。

| 步骤 | 文件 | 你会加上什么 | 对应模式 |
|---|---|---|---|
| 0 | `step0_prepare_book.py` | 把 PDF 变成可检索的文本块 | — |
| 1 | `step1_bare_call.py` | 一次裸调用（**还不是 Agent**） | 基础 · Agent 到底是什么 |
| 2 | `step2_chain.py` | 把任务拆成一串步骤 | 01 提示链 |
| 3 | `step3_tools.py` | **工具 + 循环 → 这一步才叫 Agent** | 05 工具使用 / 17 推理技术 |
| 4 | `step4_rag.py` | 检索这本书来回答问题 | 14 知识检索 |
| 5 | `step5_memory.py` | 记住多轮对话 | 08 记忆管理 |
| 6 | `step6_guardrails.py` | 护栏 + 容错 | 18 护栏 / 12 异常处理 |
| 7 | `step7_eval.py` | 评测集，量化好坏 | 19 评估与监控 |
| 附 | `step8_with_framework.py` | 同样的东西用框架写 | 基础 · 框架怎么选 |

**先跑 step0。**
它生成的 `data/book_chunks.json` 是 step4–8 的输入，换书时才需要重跑。

`retrieval.py` 不是步骤，是 step4 起复用的检索模块。
它可以单独跑，不花钱、不联网，用来验证检索本身好不好：

```bash
python retrieval.py "circuit breaker retry backoff"
```

### 跟网页教材怎么配合

知识平台里的 **「从零搭一个 Agent」** 那一页，就是这七步的图文版：
每一步都标了对应哪个文件、该敲什么命令、跑出来长什么样、会踩什么坑。
反过来，每个模式详情页底部也会告诉你「这个模式在实战路径的第几步用到」。

**建议左边开网页看原理，右边开终端跑代码。**

### 为什么前面几步不用框架

知识平台里讲的是 LangChain / LangGraph / CrewAI。但第一次搭 Agent 就用框架，
你会看不见工具调用真正长什么样——框架把它包起来了。

所以 step1–7 用 Anthropic 官方 SDK 直接写，**让你亲眼看见模型吐出的那段 tool_use**。
step8 再展示「同样的东西，框架一行搞定」，那时你才知道框架替你省了什么。

---

## 关于花钱

这些脚本用的是 `claude-opus-5`（$5 / 百万输入 token，$25 / 百万输出 token）。

七步全跑一遍，大约几万 token，**成本在几毛到几块人民币之间**。
`step7_eval.py` 会打印每次调用的实际 token 数，你可以自己核对。

想省钱可以把各文件顶部的 `MODEL` 改成 `claude-sonnet-5`（约为 Opus 的 60%）
或 `claude-haiku-4-5`（约 20%）。能力会下降，但跑通流程完全够用。

---

## 你一定会遇到的报错

| 报错 | 含义 | 怎么修 |
|---|---|---|
| `ModuleNotFoundError: No module named 'anthropic'` | 虚拟环境没激活，或依赖没装 | `source .venv/bin/activate` 再 `pip install -r requirements.txt` |
| `AuthenticationError` / `invalid x-api-key` | key 错了、过期了，或 `.env` 没配好 | 重新检查 `.env`，key 要以 `sk-ant-` 开头，前后别有多余空格或引号 |
| `RateLimitError` | 短时间调太多次 | SDK 会自动重试两次；还失败就等一会儿。这是**临时性故障**（见模式 12） |
| `APIConnectionError` | 网络连不上 Anthropic | 检查网络。国内可能需要代理 |
| `NotFoundError: model not found` | 模型名写错了 | 检查 `MODEL` 变量，别自己拼日期后缀 |
| `stop_reason == "max_tokens"` | 输出被截断了 | 调大 `max_tokens`。注意 Opus 5 默认开启思考，思考和回答**共享**这个额度 |
| `FileNotFoundError: data/book_chunks.json` | 没跑 step0 | `python step0_prepare_book.py` |

---

## 目录说明

```
agent-workshop/
├── README.md              ← 你在读的这个
├── requirements.txt       ← 依赖清单
├── .env.example           ← key 配置模板（复制成 .env 再填）
├── .gitignore             ← 确保 .env 不会被提交
├── check_setup.py         ← 一键自检
├── retrieval.py           ← 手写的检索函数（20 行，step4 起复用）
├── step0_prepare_book.py  ← PDF → 文本块
├── step1..step8_*.py      ← 七步 + 框架对照
└── data/                  ← step0 生成，已 gitignore
```
