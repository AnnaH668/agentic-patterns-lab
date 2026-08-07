# 附：用 AI 工具搭 agent，以及怎么验收它写的东西

前面 step1–8 是**手写**，目的是让你看见循环内部。
这一篇讲另一件事：**现实里你多半会让 Claude Code 帮你写。**

这两件事不冲突。手写给你的不是「不用工具的能力」，是**验收能力**——
AI 生成的 agent 跑歪的时候，你知道去哪儿看。

---

## 一、怎么让它写

### 别这么说

> 帮我搭一个 AI agent

这样出来的东西，十次有九次是：装了 LangChain，抄了一段文档里的示例，
循环没有出口，key 硬编码在第 3 行，跑一次就把上下文撑爆。

原因不是模型笨，是**你没给规格**。它只能猜。

### 这么说

把七步的节奏直接变成规格。一次只加一样东西：

```
用 Anthropic 官方 SDK（anthropic 包）写一个 Python agent，不要用 LangChain。

功能：回答关于本地 PDF 的问题。
工具只有一个：search_book(query) -> str，检索 data/book_chunks.json 并返回
带页码的片段。检索用 TF-IDF，不要引入向量数据库。

要求：
- 手写 while 循环，不要用 tool_runner，我要看得见 tool_use
- 循环必须有 max_turns 上限
- 工具抛异常时把错误信息当作 tool_result 返回，不要中断循环
- API key 从 .env 读，绝对不要出现在代码里
- 模型用 claude-opus-5

先只写这些。跑通之后我再告诉你下一步加什么。
```

三个关键点：

1. **指定 SDK 和模型**，否则它会用训练数据里最常见的那套（往往是过时的）
2. **说明「不要什么」**，比说要什么更有效——不要 LangChain、不要向量库、不要 tool_runner
3. **明确说「先只写这些」**，否则它会一口气把记忆、护栏、评测全塞进来，
   出了问题你不知道是哪一层的

### 让它跑，别只让它写

最重要的一条：

> 写完之后你自己运行一次，把实际输出贴给我。

代码「看起来对」和「跑得起来」之间的差距，比你想的大。
让它自己跑一遍，大部分低级错误在你看到之前就被它自己修掉了。

### 把铁律写进 CLAUDE.md

在项目根目录建一个 `CLAUDE.md`，Claude Code 每次都会读：

```markdown
# 项目规则

- API key 只能从 .env 读取，任何情况下不得写入代码、注释、日志或测试文件
- 模型统一用 claude-opus-5
- 不引入 LangChain / LlamaIndex / 向量数据库
- 所有 agent 循环必须有轮数上限
- 改动后必须实际运行一次并贴出输出
```

写一次，之后每次对话都生效，不用重复叮嘱。

---

## 二、验收清单

**这才是这一篇的重点。** 下面每一条，都对应你在前面某一步亲眼见过的机制。
不知道这些机制的人，拿到生成的代码只能「看着挺像那么回事」。

拿到 AI 写的 agent 之后，逐条查：

### 1. 循环有没有出口

```bash
grep -n "while\|for.*range\|max_turns\|max_iterations" agent.py
```

必须有轮数上限。没有的话，模型一旦陷入「调工具 → 结果不满意 → 再调」的死循环，
会一直烧到你发现为止。**这是最贵的一种 bug。**

对照：`step3_tools.py` 的 `max_turns=10`。

### 2. 历史存的是不是整个 content

```bash
grep -n "messages.append" agent.py
```

必须是 `{"role": "assistant", "content": resp.content}`。

如果它写成只挑 text 块（`[b for b in resp.content if b.type == "text"]`），
在开启思考时下一轮直接 400 报错——thinking 块和 tool_use 块必须原样回传。

对照：`step3_tools.py` 里那句「必须是**整个** resp.content」。

### 3. tool_use_id 有没有原样回传

```bash
grep -n "tool_use_id" agent.py
```

必须是 `block.id`，不能是它自己生成的编号。模型靠这个 id 把结果和调用对上号。

### 4. 工具出错是不是当结果返回

看工具执行那段有没有 `try/except`，并且 except 分支是**返回错误字符串**，
而不是 `raise` 或 `sys.exit()`。

抛异常 = 整个循环崩掉。返回错误 = 模型看到错误信息，自己改参数重试。
后者才是 agent 的自愈能力。

对照：`step3_tools.py` 的 `out = f"工具执行出错：{type(e).__name__}: {e}"`。

### 5. 有没有 eval()

```bash
grep -rn "eval(\|exec(\|os.system\|subprocess" .
```

**任何一个命中都要停下来看。** AI 写计算类工具时特别容易直接上 `eval()`。
`eval("__import__('os').system('rm -rf ~')")` 会真的执行——而表达式是模型生成的。

这条会扫到注释和文档（这个项目里就会命中 `step3_tools.py` 那几行讲解），
不用怕噪声——**这一条宁可多看几眼，也不能漏。**
要看的是：有没有哪个地方把**模型的输出**直接送进了 `eval` / `exec` /
`subprocess`。模型输出进解释器，等于把执行权交给了任何能影响提示的人。

对照：`step3_tools.py` 用 `ast` 白名单只放行数字和四则运算。

### 6. key 有没有泄漏

```bash
grep -rnE "sk-ant-[A-Za-z0-9_-]{20,}" . --exclude-dir=.venv
```

注意这里要匹配**真正的 key 形状**（`sk-ant-` 后面跟一长串随机字符），
而不是光搜 `sk-ant-`。我实测过：光搜前缀会在这个项目里命中 9 处，
全都是文档里的说明文字和 `check_setup.py` 的格式校验——**噪声会淹掉真信号，
你扫两次就不想扫了。** 加上 `{20,}` 之后正常情况应该是零命中。

再查两条：

```bash
grep -x ".env" .gitignore          # 必须有输出
grep -rn "print.*key\|logging.*key" . --exclude-dir=.venv
```

第二条是查有没有把 key 打进日志——这比写进代码更隐蔽，
因为日志经常被贴进工单、聊天窗口或监控平台。

这条同样有噪声：在这个项目里它会命中 9 处，其中 8 处是
`print("✗ key 不对…")` 这种**只提到「key」这个词、没有打印值**的错误提示，
没问题。要看的只有一件事：**有没有把 key 的值本身打出来。**

剩下那 1 处是 `check_setup.py` 的 `print(f"API key 已读到（{key[:12]}…）")`——
只截前 12 个字符（`sk-ant-` 占了 7 个，实际只露 5 个），
是为了让你确认读到的是不是你想要的那把 key。
**截断显示可以，完整打印绝对不行。**

### 7. 检索回来的内容有没有当数据包起来

看工具返回值有没有明确的边界标记。没有的话，任何被检索到的文本里
只要写着「忽略以上指令」，就会被模型当成指令读。

对照：`step6_guardrails.py` 的 `wrap_untrusted()` 和 system 里那条规矩。

### 8. 有没有处理 max_tokens 截断

```bash
grep -n "stop_reason" agent.py
```

除了判断 `"tool_use"`，还应该在某处检查 `== "max_tokens"`。
没检查的话，回答被截断了你也不知道，只会觉得「模型今天答得有点怪」。

### 9. 重试是不是只重试临时性故障

```bash
grep -n "except\|retry\|sleep" agent.py
```

`except Exception: retry` 是**错的**——`AuthenticationError` 重试一万次
还是同样结果，纯烧时间。只有限流、超时、5xx、网络抖动值得重试。

对照：`step6_guardrails.py` 的 `RETRYABLE` 元组。

### 10. 有没有评测

基本不会有。AI 生成的 agent 几乎从不自带评测集——因为你没要。

这是最容易被跳过、也最该补的一条。没有评测集，你后面每一次「优化」都是赌博。

---

## 三、最好用的一招：拿手写版的评测集去测 AI 版

你手上已经有 `step7_eval.py` 了。它跑的是**行为**，不关心底下是谁写的代码。

把它指向 AI 生成的那个 agent：

```python
# step7_eval.py 里换掉这一行
from step6_guardrails import SYSTEM, TOOLS, search_the_book
# 改成
from ai_generated_agent import SYSTEM, TOOLS, search_the_book
```

然后 `python step7_eval.py`，两个版本的分数直接并排比。

**这就是手写那七步真正的回报**：你不是多了一份代码，你多了一把尺子。
以后不管是 Claude Code 写的、同事写的、还是你自己半年后写的，
都能用同一套题量出好坏。

---

## 四、什么时候根本不该自己搭

老实说，下面这几种情况，前面所有内容都可以跳过：

| 你的需求 | 更省事的做法 |
|---|---|
| 就想让 AI 读文件、改代码、跑命令 | 直接用 Claude Code，它本身就是 agent |
| 想把这种能力嵌进自己的程序 | Claude Agent SDK（Claude Code 打包成库，自带读写文件/Bash 等工具） |
| 想让 Anthropic 托管循环和沙箱 | Managed Agents |
| 只是要分类、摘要、抽取 | **压根不需要 agent**，一次调用就够（见 step1） |

最后一行值得多看一眼。**很多被叫做 agent 的东西，其实是 workflow，
甚至只是一次调用。** 流程固定就写死——更便宜、更快、更可预测、出错好查。

判断标准就四条：任务是不是多步且没法提前写死？结果值不值这个成本和延迟？
模型干得了吗？出了错能不能兜住？

有一条答不上「是」，就往下退一档。
