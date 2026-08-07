/* ============================================================
   Part One — 核心执行模式 / Core Execution (Patterns 1–7)
   Explanations are rewritten for beginners, not copied from the book.
   ============================================================ */
window.PATTERNS.push(

/* ---------------------------------------------------------- 1 */
{
  id: 'prompt-chaining', num: 1, part: 1, core: true, icon: '⛓️',
  pages: '23–35',
  name: { zh: '提示链', en: 'Prompt Chaining' },
  alias: { zh: '流水线模式 Pipeline', en: 'Pipeline pattern' },
  keywords: 'chain pipeline sequential 拆步骤 串联 流水线',
  oneLiner: {
    zh: '别指望模型一口气干完复杂任务，把它拆成一串小步骤，上一步的输出当下一步的输入。',
    en: 'Stop asking for everything at once — split the task into small steps and feed each output into the next.'
  },
  analogy: {
    icon: '🏭',
    title: { zh: '工厂流水线', en: 'A factory assembly line' },
    body: {
      zh: '造一辆车，没有哪个工人从头包到尾。焊接、喷漆、装配各是一个工位，每人只做一件事，做完往下传。提示链就是给模型建一条流水线：每一站只交代一个明确任务，做完把半成品递给下一站。工位越简单，出错越少。',
      en: 'Nobody builds a whole car alone. Welding, painting and assembly are separate stations; each worker does one thing and passes the part along. Prompt chaining builds that line for a model — each station gets one clear job and hands the half-finished work onward. Simpler stations, fewer mistakes.'
    }
  },
  problem: {
    zh: '把「读完这份市场报告 → 总结 → 找出三个趋势并附数据 → 写成邮件」塞进一个 **Prompt**，模型往往会顾此失彼：总结写得不错，但趋势的数据编了，邮件格式也忘了。任务一多，模型的认知负担就上去了，**Hallucination**、漏指令、丢上下文全都会冒出来。',
    en: 'Put "read this report → summarise → find three trends with data → draft an email" into one **Prompt** and the model juggles badly: a decent summary, invented numbers, a forgotten email format. As instructions pile up, cognitive load rises and you get skipped instructions, lost context and **Hallucination**.'
  },
  solution: {
    zh: '拆成一条链：第一次调用只做总结，第二次拿着总结只找趋势，第三次拿着趋势只写邮件。每次调用面对的任务都很窄，模型几乎不会跑偏。而且每一步之间你都能检查、能加工具、能要求输出 **JSON**，整条流程变得可调试、可控制。',
    en: 'Chain it: one call summarises, the next takes that summary and finds trends, the third turns trends into an email. Each call faces one narrow job, so the model rarely drifts. Between steps you can inspect the output, call tools, or demand **JSON** — the whole flow becomes debuggable.'
  },
  without: {
    zh: '一个巨型提示丢过去，输出看起来像那么回事，但你根本不知道哪一环出了错——要改只能整段重写提示，然后祈祷这次好一点。',
    en: 'One giant prompt returns something plausible, but you cannot tell which part went wrong. Fixing it means rewriting the whole prompt and hoping.'
  },
  with: {
    zh: '出问题时你能精确定位到「第 2 步的趋势提取不准」，只改那一步的提示，前后两步完全不用动。这就是模块化带来的好处。',
    en: 'When something breaks you can point at "step 2 extracts trends badly", fix that prompt alone, and leave the rest untouched. That is what modularity buys you.'
  },
  whenToUse: [
    { zh: '任务明显包含好几个**不同性质**的阶段（先读、再算、最后写）', en: 'The task has several **distinct** stages — read, then compute, then write' },
    { zh: '中间需要插入工具调用、数据库查询或人工检查', en: 'You need to slot a tool call, database lookup or human check between stages' },
    { zh: '你希望能单独调试、单独优化某一个环节', en: 'You want to debug and tune one stage independently' },
    { zh: '每一步的输出可以用 **JSON** 等结构化格式稳定传递', en: 'Steps can hand off cleanly in a structured format like **JSON**' }
  ],
  whenNotToUse: [
    { zh: '任务本身一句话就能说清（「把这段翻译成英文」），拆开纯属浪费钱和时间', en: 'The task is genuinely one instruction ("translate this") — chaining just adds cost and latency' },
    { zh: '各步骤之间其实互不依赖——那该用**并行化**而不是串行链', en: 'The steps do not actually depend on each other — use parallelisation instead' },
    { zh: '链太长（超过 5–6 步）而中间没有校验：一步出错会一路放大到最后', en: 'The chain runs long with no checks — one early error amplifies all the way down' }
  ],
  deepDive: [
    { t: { zh: '误差累积：链越长，可靠性掉得越快', en: 'Error compounding: reliability falls fast with length' },
      d: { zh: '这是决定链条长度的硬约束。假设每一步独立成功率 95%，整条链的端到端成功率是 0.95^n：3 步 86%，5 步 77%，8 步只剩 66%。所以**长链必须在中间插入校验**——每一步做完就检查输出是否符合预期结构，不合格就重试或降级，把误差截断在本步而不是传下去。',
        en: 'This is the hard constraint on chain length. At 95% success per independent step, end-to-end reliability is 0.95^n: 86% at three steps, 77% at five, 66% at eight. So **long chains must validate between steps** — check each output against its expected shape and retry or degrade on failure, cutting the error off locally instead of passing it on.' } },
    { t: { zh: '结构化输出是步骤之间的契约', en: 'Structured output is the contract between steps' },
      d: { zh: '别只在提示里写「请输出 JSON」——模型会偶尔加上 markdown 代码块或解释性前言，把解析打挂。生产做法是用模型 API 的**结构化输出/JSON mode 或 function calling schema** 强制约束，让格式由解码层保证而不是靠祈祷。约定好的 schema 同时成了这一步的**验收标准**：字段缺失就是这一步失败。',
        en: 'Do not merely ask for JSON in the prompt — models occasionally wrap it in a code fence or add a preamble and break the parser. In production use the API\'s **structured output / JSON mode or a function-calling schema** so the decoder enforces the shape rather than hope. The agreed schema doubles as the step\'s **acceptance test**: a missing field is a failed step.' } },
    { t: { zh: '别把全部历史一路传下去', en: 'Do not carry the whole history down the chain' },
      d: { zh: '新手最常见的写法是把每一步的输出都累加进下一步的提示，结果 token 成本呈平方增长，而且无关内容会稀释模型注意力。正确做法是**每一步只传它真正需要的那部分**——写邮件那步只需要趋势 JSON，不需要原始报告全文。这既省钱又提升质量。',
        en: 'The common beginner shape appends every step\'s output to the next prompt, so token cost grows quadratically and irrelevant text dilutes attention. Instead **pass only what the step actually needs** — the email step needs the trends JSON, not the full original report. This is cheaper and produces better output.' } },
    { t: { zh: '框架里的对应物', en: 'What this maps to in frameworks' },
      d: { zh: '**LangChain** 的 LCEL 用管道运算符把 Runnable 串起来；**LangGraph** 用 StateGraph 定义节点和边，共享一份 **State**，适合需要分支和循环的复杂链；**ADK** 提供 SequentialAgent 直接表达顺序执行。三者的差别主要在**状态怎么传**：LCEL 是值传递，LangGraph 是共享状态对象。',
        en: '**LangChain**\'s LCEL pipes Runnables together; **LangGraph** defines nodes and edges over a shared **State**, which suits chains needing branches and loops; **ADK** offers SequentialAgent for straight sequential execution. The main difference is **how state moves**: LCEL passes values, LangGraph mutates a shared state object.' } }
  ],
  diagram: {
    w: 760, h: 275,
    nodes: [
      { id: 'user', kind: 'actor',  x: 80,  y: 70,  label: { zh: '用户任务', en: 'User task' }, sub: { zh: '市场报告', en: 'market report' } },
      { id: 's1',   kind: 'llm',    x: 255, y: 70,  label: { zh: '步骤 1 总结', en: 'Step 1 summarise' }, sub: 'Prompt 1' },
      { id: 's2',   kind: 'llm',    x: 430, y: 70,  label: { zh: '步骤 2 找趋势', en: 'Step 2 find trends' }, sub: 'Prompt 2' },
      { id: 's3',   kind: 'llm',    x: 605, y: 70,  label: { zh: '步骤 3 写邮件', en: 'Step 3 draft email' }, sub: 'Prompt 3' },
      { id: 'out',  kind: 'output', x: 605, y: 200, label: { zh: '成品邮件', en: 'Finished email' } }
    ],
    edges: [
      { from: 'user', to: 's1' },
      { from: 's1', to: 's2', label: { zh: '摘要', en: 'summary' } },
      { from: 's2', to: 's3', label: { zh: '趋势 JSON', en: 'trends JSON' } },
      { from: 's3', to: 'out' }
    ],
    steps: [
      { edge: 'user->s1', say: { zh: '用户丢来一个复合任务：读报告、找趋势、写邮件。一次全交给模型，它会顾此失彼。', en: 'One compound request: read the report, find trends, write an email. Handed over all at once, the model juggles badly.' } },
      { edge: 's1->s2', say: { zh: '第一站只做总结。任务单一，模型专注度高，这一步的质量就有保障。', en: 'Station one only summarises. A single narrow job means the model stays focused and this step comes out clean.' } },
      { edge: 's2->s3', say: { zh: '第二站拿着上一步的摘要，只负责提取三个趋势，并要求输出成 JSON——结构化格式让下一步能精确解析，不会因为文字歧义而崩。', en: 'Station two takes that summary and only extracts three trends, emitting JSON. Structured output means the next step can parse it exactly.' } },
      { edge: 's3->out', say: { zh: '最后一站只管把趋势写成邮件。每一步都简单，但串起来完成了一件单次提示根本做不好的复杂工作。', en: 'The last station only writes the email. Every step is simple, yet together they do a job a single prompt handles badly.' } }
    ]
  },
  code: [
    '# 一条最小的提示链：三次调用，各管一件事',
    'summary = llm("请总结这份市场报告：" + report)',
    '',
    '# 上一步的输出，直接当下一步的输入',
    'trends = llm("根据下面的摘要，找出 3 个趋势，用 JSON 返回：" + summary)',
    '',
    'email  = llm("把这些趋势写成一封给市场部的邮件：" + trends)',
    'return email'
  ],
  useCases: [
    { zh: '**内容生产流水线**：抓网页正文 → 清洗 → 摘要 → 提取人名地名 → 生成报告。', en: '**Content pipelines**: scrape a page, clean it, summarise, extract entities, generate a report.' },
    { zh: '**客服工单处理**：判断问题类型 → 抽取关键信息 → 查知识库 → 生成回复草稿。', en: '**Support tickets**: classify, extract key fields, search the knowledge base, draft a reply.' },
    { zh: '**代码生成**：先让模型写实现，再单独一步写测试，最后一步补文档注释。', en: '**Code generation**: write the implementation, then tests in a separate step, then docs.' }
  ],
  quiz: [
    {
      q: { zh: '提示链最核心的机制是什么？', en: 'What is the core mechanism of prompt chaining?' },
      options: [
        { zh: '让多个模型同时回答同一个问题，再投票选最好的', en: 'Several models answer the same question and vote' },
        { zh: '把上一步的输出当作下一步的输入，形成依赖链', en: 'Each step\'s output becomes the next step\'s input' },
        { zh: '把提示词写得尽可能长和详细', en: 'Write one very long, very detailed prompt' },
        { zh: '用更大的模型来一次性解决问题', en: 'Use a bigger model to solve it in one shot' }
      ],
      answer: 1,
      why: {
        zh: '「上一步输出 = 下一步输入」正是这个模式得名「链」的原因。每个环节只处理一件事，信息沿着链条逐步累积，最终逼近答案。',
        en: 'Output-becomes-input is exactly why it is called a chain. Each link handles one thing, and context accumulates along the chain toward the answer.'
      }
    },
    {
      q: { zh: '为什么书里特别强调步骤之间最好用 JSON 传递数据？', en: 'Why does the book stress passing data between steps as JSON?' },
      options: [
        { zh: '因为 JSON 更省 token，能降低成本', en: 'JSON uses fewer tokens and saves money' },
        { zh: '因为模型只看得懂 JSON 格式', en: 'Models can only read JSON' },
        { zh: '因为自然语言有歧义，结构化格式才能被下一步精确解析', en: 'Natural language is ambiguous; structured data can be parsed exactly' },
        { zh: '因为 JSON 可以让模型输出得更快', en: 'JSON makes the model respond faster' }
      ],
      answer: 2,
      why: {
        zh: '链条的可靠性取决于步骤之间传递的数据是否干净。如果第一步输出一段模棱两可的散文，第二步就可能理解错。约定 JSON 结构，等于给两个环节之间加了一份契约。',
        en: 'A chain is only as reliable as what flows between links. Ambiguous prose invites misreading; an agreed JSON shape is a contract between the two steps.'
      }
    },
    {
      q: { zh: '下面哪个任务**最不适合**用提示链？', en: 'Which task is the **worst** fit for prompt chaining?' },
      options: [
        { zh: '把一句中文翻译成英文', en: 'Translate one sentence into English' },
        { zh: '分析财报 → 提取风险点 → 生成给管理层的简报', en: 'Analyse a filing, extract risks, brief management' },
        { zh: '读论文 → 提取方法 → 对比已有工作 → 写综述', en: 'Read papers, extract methods, compare, write a review' },
        { zh: '解析简历 → 匹配岗位要求 → 生成面试问题', en: 'Parse a CV, match a role, generate interview questions' }
      ],
      answer: 0,
      why: {
        zh: '翻译一句话本来就是单一、原子的任务，硬拆成多步只会多花钱、多等时间，还多了出错环节。模式是用来解决复杂度的，任务不复杂就别上。',
        en: 'Translating one sentence is already atomic. Splitting it only adds cost, latency and failure points. Patterns exist to tame complexity — no complexity, no pattern.'
      }
    }
  ],
  terms: [
    { en: 'Prompt Chaining / Pipeline pattern', zh: { zh: '提示链 / 流水线模式', en: 'Prompt chaining' }, d: { zh: '把复杂任务分解成一串提示，每一步的输出作为下一步的输入。原书指出它也被称作 Pipeline 模式。', en: 'Decomposing a complex task into a sequence of prompts, each output feeding the next. The book notes it is also called the pipeline pattern.' } },
    { en: 'Sequential Decomposition', zh: { zh: '顺序分解', en: 'Sequential decomposition' }, d: { zh: '原书用来描述这个模式核心机制的术语：把多面任务拆成聚焦的顺序工作流，以提升可靠性和可控性。', en: 'The book\'s term for the mechanism: breaking a multifaceted task into a focused sequential workflow to improve reliability and control.' } },
    { en: 'Structured Output', zh: { zh: '结构化输出', en: 'Structured output' }, d: { zh: '要求模型按 JSON/XML 等固定格式输出，使步骤间的数据可被精确解析。原书称其为链条可靠性的关键组成部分。', en: 'Requiring a fixed format such as JSON or XML so data between steps parses exactly. The book calls it a key component of chain reliability.' } },
    { en: 'Instruction Neglect / Contextual Drift', zh: { zh: '指令遗漏 / 上下文漂移', en: 'Instruction neglect / contextual drift' }, d: { zh: '原书列举的单一巨型提示的两种典型失效：模型漏掉提示中的部分指令，以及在长任务中逐渐丢失最初的上下文。', en: 'Two failure modes the book attributes to single monolithic prompts: parts of the instruction being overlooked, and the original context being lost as the task runs on.' } }
  ],
  refs: [
    { kind: 'docs', title: 'LangChain — LangChain Expression Language (LCEL)', url: 'https://python.langchain.com/docs/concepts/lcel/', note: { zh: '用管道符把步骤串成链', en: 'piping steps into a chain' } },
    { kind: 'docs', title: 'LangGraph — 官方文档', url: 'https://langchain-ai.github.io/langgraph/', note: { zh: '需要分支和循环时用它', en: 'for chains needing branches and loops' } },
    { kind: 'docs', title: 'Prompt Engineering Guide — Chaining Prompts', url: 'https://www.promptingguide.ai/techniques/chaining' },
    { kind: 'docs', title: 'Vertex AI Prompt Optimizer', url: 'https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/prompt-optimizer', note: { zh: '书中提到的自动优化提示的工具', en: 'the automated prompt-tuning tool the book cites' } }
  ],
  related: ['routing', 'parallelization', 'planning']
},

/* ---------------------------------------------------------- 2 */
{
  id: 'routing', num: 2, part: 1, core: true, icon: '🔀',
  pages: '36–49',
  name: { zh: '路由', en: 'Routing' },
  keywords: 'router dispatch triage classify 分诊 分发 意图识别',
  oneLiner: {
    zh: '先判断这个请求属于哪一类，再把它交给最合适的那条处理路径。',
    en: 'Work out what kind of request this is, then hand it to the branch best suited to it.'
  },
  analogy: {
    icon: '🏥',
    title: { zh: '医院分诊台', en: 'The hospital triage desk' },
    body: {
      zh: '你走进医院，不会有一个「全能医生」什么病都看。分诊护士先问几句，判断你该去骨科、内科还是急诊，然后指个方向。路由模式做的就是这件事：入口只有一个，但后面通向许多条专门的路，走哪条由入口处的判断决定。',
      en: 'You do not meet one all-purpose doctor. A triage nurse asks a few questions and points you at orthopaedics, internal medicine or A&E. Routing is that desk: one entrance, many specialised paths, and a judgement at the door that picks one.'
    }
  },
  problem: {
    zh: '**提示链**是一条固定的直线，来什么请求都走同一套流程。可现实里用户的问题千奇百怪：有人问价格，有人报故障，有人要改账单。用同一条流水线处理全部，等于让骨科医生看牙——流程僵硬，没法随情况变化。',
    en: 'A chain is a straight line: every request walks the same route. But real users ask about pricing, report bugs, and want billing changed. One pipeline for all of it is the orthopaedist doing dentistry — rigid, and blind to context.'
  },
  solution: {
    zh: '在流程入口加一个**判断节点**。它先分析请求的意图，然后动态决定把控制权交给哪个工具、哪条子流程或哪个 **Sub-agent**。判断可以用三种方式实现：让 **LLM** 直接分类、写死关键词规则、或用 **Embedding** 算语义相似度。执行路径从此不再是预先写死的，而是随输入而变。',
    en: 'Put a **decision node** at the entrance. It reads the request\'s intent, then dynamically routes control to the right tool, sub-flow or **Sub-agent**. Three ways to decide: let an **LLM** classify, write keyword rules, or compare **Embedding** similarity. The path stops being hard-coded and starts following the input.'
  },
  without: {
    zh: '一个「万能提示」里塞满了 if-else 式的自然语言说明：「如果用户问价格就…如果是报故障就…」。提示越写越长，模型越来越容易看漏其中一条。',
    en: 'One mega-prompt stuffed with natural-language if-else: "if they ask about pricing… if they report a bug…". It grows, and the model starts missing branches.'
  },
  with: {
    zh: '入口只判断一件事：这属于哪一类。判断完只激活对应的那一个分支，其他分支的提示词根本不会进入上下文——又短又准，还省钱。',
    en: 'The entrance decides one thing: which category. Only that branch activates; the other branches\' prompts never enter the context at all — shorter, sharper, cheaper.'
  },
  whenToUse: [
    { zh: '用户输入类型多样，需要不同的处理逻辑（客服、助手类产品几乎必用）', en: 'Inputs vary in kind and need different handling — nearly every assistant or support bot' },
    { zh: '你有一组各有专长的工具或 **Sub-agent**，需要挑一个来用', en: 'You have specialised tools or **Sub-agent**s and must pick one' },
    { zh: '想让简单问题走便宜的小模型，复杂问题才走贵的大模型', en: 'You want cheap models for easy questions and expensive ones only when needed' }
  ],
  whenNotToUse: [
    { zh: '只有两三种情况且规则明确——直接写 if-else 代码更快更稳，不必让模型判断', en: 'Two or three well-defined cases — plain if-else code is faster and more reliable than asking a model' },
    { zh: '各分支处理逻辑其实差不多，分了也是重复代码', en: 'The branches do nearly the same thing, so splitting only duplicates logic' },
    { zh: '类别边界本身很模糊，路由器会频繁误判——这时不如让一个 Agent 带全部工具自己决定', en: 'Category boundaries are genuinely fuzzy and the router will misfire — better to give one agent all the tools' }
  ],
  deepDive: [
    { t: { zh: '三种路由实现的取舍', en: 'Choosing among the three routing mechanisms' },
      d: { zh: '**规则匹配**：零延迟、零成本、完全可复现，但只能处理表述稳定的场景，用户换个说法就失效。**Embedding 相似度**：一次向量化的开销（毫秒级、成本近乎为零），能处理同义表达，类别多时尤其划算，但难以处理需要推理的意图。**LLM 分类**：最灵活、能理解言外之意，但每次多一次调用的延迟和费用。实践中常用**级联**：先规则，命中不了再 embedding，还不行才上 LLM。',
        en: '**Rules**: zero latency, zero cost, fully reproducible — but they break the moment someone phrases it differently. **Embedding similarity**: one vectorisation (milliseconds, negligible cost), handles paraphrase well and scales to many categories, but cannot handle intent requiring inference. **LLM classification**: most flexible, reads implication, costs a call in latency and money. In practice **cascade them**: rules first, then embeddings, and only then an LLM.' } },
    { t: { zh: '路由是分类问题，所以它可以被量化评估', en: 'Routing is classification, so it can be measured' },
      d: { zh: '这是个常被忽略的实践优势：路由器的输出是离散标签，你可以攒一批带标注的真实请求，算出**准确率和混淆矩阵**，精确看到「技术支持被误判成售前」这类具体错误有多少。相比之下生成质量很难量化。**先把路由的准确率做上去，往往比调下游提示词收益大得多**。',
        en: 'An often-missed practical advantage: the router emits discrete labels, so you can collect labelled real requests and compute **accuracy and a confusion matrix**, seeing exactly how often support gets misfiled as sales. Generation quality is far harder to quantify. **Fixing router accuracy usually pays more than tuning downstream prompts.**' } },
    { t: { zh: '必须有兜底分支', en: 'You must have a default branch' },
      d: { zh: '分类器一定会遇到不属于任何已知类别的输入。没有 default 分支时，常见的失败是模型被迫从现有类别里硬选一个，把一个完全无关的请求塞进「技术支持」。正确做法是**显式提供一个 fallback 类别**，并让它走通用处理或转人工——同时这些落入 fallback 的请求正是你发现新类别的最佳数据源。',
        en: 'A classifier will meet inputs belonging to none of its categories. Without a default, the typical failure is the model being forced to pick one anyway and filing something unrelated as tech support. Provide an **explicit fallback category** routed to generic handling or a human — and note those fallback requests are your best source for discovering categories you are missing.' } },
    { t: { zh: '框架里的对应物', en: 'What this maps to in frameworks' },
      d: { zh: '**LangGraph** 用 `add_conditional_edges` 把一个函数的返回值映射到不同节点，路由逻辑显式写在图上、可视化也一目了然。**ADK** 的思路不同：它更多依赖 LLM 驱动的工具委派——把每条分支定义成一个工具或 sub-agent，由模型自己选。前者可控性强，后者更灵活。',
        en: '**LangGraph** uses `add_conditional_edges` to map a function\'s return value onto different nodes, so routing is explicit on the graph and visualises clearly. **ADK** takes a different line, leaning on LLM-driven delegation — each branch is a tool or sub-agent and the model picks. The first gives control, the second flexibility.' } }
  ],
  diagram: {
    w: 760, h: 310,
    nodes: [
      { id: 'user',   kind: 'actor',    x: 80,  y: 155, label: { zh: '用户提问', en: 'User asks' } },
      { id: 'router', kind: 'decision', x: 255, y: 155, label: { zh: '路由器', en: 'Router' }, sub: { zh: '判断意图', en: 'classify intent' } },
      { id: 'b1',     kind: 'agent',    x: 470, y: 55,  label: { zh: '售前咨询', en: 'Sales' } },
      { id: 'b2',     kind: 'agent',    x: 470, y: 155, label: { zh: '技术支持', en: 'Tech support' } },
      { id: 'b3',     kind: 'agent',    x: 470, y: 255, label: { zh: '账户管理', en: 'Billing' } },
      { id: 'out',    kind: 'output',   x: 665, y: 155, label: { zh: '针对性回答', en: 'Tailored reply' } }
    ],
    edges: [
      { from: 'user', to: 'router' },
      { from: 'router', to: 'b1', dash: true },
      { from: 'router', to: 'b2' },
      { from: 'router', to: 'b3', dash: true },
      { from: 'b2', to: 'out' }
    ],
    steps: [
      { edge: 'user->router', say: { zh: '所有请求都从同一个入口进来：「我的账号登不上了」。', en: 'Everything arrives at one entrance: "I cannot log into my account."' } },
      { node: 'router', show: ['b1', 'b2', 'b3'], say: { zh: '路由器先分类。它可以让 LLM 判断意图、匹配关键词、或用 Embedding 比对语义——三种做法准确度和成本各不相同。', en: 'The router classifies first — by asking an LLM, matching keywords, or comparing embeddings. The three differ in accuracy and cost.' } },
      { edge: 'router->b2', say: { zh: '判定为「技术支持」，于是只有这一条分支被激活。注意另外两条是虚线：它们存在，但这次根本没被执行，也没占用上下文。', en: 'Classified as tech support, so only that branch fires. The dashed branches exist but never run — and never consume context.' } },
      { edge: 'b2->out', say: { zh: '专门的分支带着自己的提示和工具作答。换一个问题进来，走的就是完全不同的一条路。', en: 'The specialised branch answers with its own prompt and tools. A different question would take an entirely different path.' } }
    ]
  },
  code: [
    '# 让模型只做一件事：分类',
    'kind = llm("这条消息属于 sales / support / billing 中哪一类？只回答一个词：" + msg)',
    '',
    '# 再按分类把活儿交给专门的处理器',
    'if kind == "sales":',
    '    return sales_agent(msg)      # 每个分支有自己的提示和工具',
    'elif kind == "support":',
    '    return support_agent(msg)',
    'else:',
    '    return billing_agent(msg)'
  ],
  useCases: [
    { zh: '**客服机器人**：把咨询、报障、退款分流到三套完全不同的流程和知识库。', en: '**Support bots**: split enquiries, bug reports and refunds into different flows and knowledge bases.' },
    { zh: '**成本优化**：简单问答交给便宜的小模型，复杂推理才路由到贵的大模型。', en: '**Cost control**: cheap model for simple Q&A, expensive model only for hard reasoning.' },
    { zh: '**多语言助手**：先识别语种，再路由到对应语言调优过的提示模板。', en: '**Multilingual assistants**: detect the language, then route to a prompt tuned for it.' }
  ],
  quiz: [
    {
      q: { zh: '路由模式和提示链最本质的区别是什么？', en: 'What most fundamentally separates routing from chaining?' },
      options: [
        { zh: '路由更快，因为跳过了一些步骤', en: 'Routing is faster because it skips steps' },
        { zh: '路由引入了条件判断，执行路径随输入而变；提示链是固定的直线', en: 'Routing adds a decision, so the path varies with the input; a chain is fixed' },
        { zh: '路由必须用 LLM 来判断，提示链不用', en: 'Routing must use an LLM to decide; chaining does not' },
        { zh: '路由只能用在客服场景', en: 'Routing only applies to customer support' }
      ],
      answer: 1,
      why: {
        zh: '关键词是「条件」。提示链无论输入是什么都走同样的步骤，路由则先看输入再决定走哪条路——这让系统从静态变成了上下文感知的。',
        en: 'The keyword is conditional. A chain runs the same steps whatever arrives; routing looks first and then chooses — turning a static flow into a context-aware one.'
      }
    },
    {
      q: { zh: '书中提到路由判断可以怎么实现？', en: 'How can the routing decision be made, per the book?' },
      options: [
        { zh: '只能靠 LLM 判断意图', en: 'Only by asking an LLM' },
        { zh: '只能靠人工写死的规则', en: 'Only by hand-written rules' },
        { zh: 'LLM 判断、预设规则、或 Embedding 语义相似度，三种都行', en: 'An LLM, preset rules, or embedding similarity — any of the three' },
        { zh: '必须先微调一个专门的分类模型', en: 'You must fine-tune a dedicated classifier first' }
      ],
      answer: 2,
      why: {
        zh: '三种方式各有取舍：规则最快最省钱但不灵活；LLM 最灵活但有成本和延迟；Embedding 相似度介于两者之间，适合类别多且描述稳定的场景。',
        en: 'Each trades off differently: rules are fastest and cheapest but brittle; an LLM is flexible but costs time and money; embedding similarity sits between, and suits many stable categories.'
      }
    },
    {
      q: { zh: '什么情况下**不该**用 LLM 做路由？', en: 'When should you **not** use an LLM as the router?' },
      options: [
        { zh: '只有「是」和「否」两种分支，规则一行代码就能写清楚', en: 'There are two branches and a one-line rule decides them' },
        { zh: '用户输入是自由文本，意图多达十几种', en: 'Inputs are free text with a dozen possible intents' },
        { zh: '分类标准会随业务频繁调整', en: 'The categories shift often with the business' },
        { zh: '需要理解用户话里的言外之意', en: 'You need to read implied intent' }
      ],
      answer: 0,
      why: {
        zh: '能用一行确定性代码解决的事，就别引入一次 LLM 调用——那会平白增加延迟、成本和一个可能出错的环节。模式是工具，不是必须交的作业。',
        en: 'If deterministic code settles it, do not add an LLM call: that is pure latency, cost and one more thing that can be wrong. Patterns are tools, not homework.'
      }
    }
  ],
  terms: [
    { en: 'Routing', zh: { zh: '路由', en: 'Routing' }, d: { zh: '在 Agent 的运行框架里引入条件逻辑，先分析请求意图，再把控制流动态导向最合适的工具、函数或子 Agent。', en: 'Introducing conditional logic into an agent\'s operation: analyse intent first, then dynamically direct control to the most appropriate tool, function or sub-agent.' } },
    { en: 'Intent Classification', zh: { zh: '意图识别', en: 'Intent classification' }, d: { zh: '路由的第一步：判断进来的这条请求属于哪一类。它本质是个分类问题，因此可以用准确率和混淆矩阵来量化评估。', en: 'Routing\'s first step: deciding which category an incoming request belongs to. Being a classification problem, it can be measured with accuracy and a confusion matrix.' } },
    { en: 'Embedding-based Semantic Similarity', zh: { zh: '基于嵌入的语义相似度', en: 'Embedding-based similarity' }, d: { zh: '原书列出的三种路由实现方式之一（另两种是 LLM 判断和预设规则）：把请求和各类别都转成向量，比较距离来分类。', en: 'One of the book\'s three routing mechanisms, alongside LLM classification and predefined rules: vectorise request and categories, then compare distances.' } },
    { en: 'LLM-Driven Delegation', zh: { zh: 'LLM 驱动的委派', en: 'LLM-driven delegation' }, d: { zh: 'ADK 的路由思路：把每条分支定义成工具或 sub-agent，由模型自己决定调哪个，而不是在图上显式写条件边。', en: 'ADK\'s approach: define each branch as a tool or sub-agent and let the model choose, rather than writing conditional edges explicitly on a graph.' } }
  ],
  refs: [
    { kind: 'docs', title: 'LangGraph — 条件边与路由', url: 'https://langchain-ai.github.io/langgraph/', note: { zh: '用 add_conditional_edges 把返回值映射到节点', en: 'add_conditional_edges maps a return value onto nodes' } },
    { kind: 'docs', title: 'Google Agent Development Kit (ADK)', url: 'https://google.github.io/adk-docs/', note: { zh: '走 LLM 驱动工具委派的另一条路线', en: 'the LLM-driven tool delegation alternative' } }
  ],
  related: ['prompt-chaining', 'multi-agent', 'planning']
},

/* ---------------------------------------------------------- 3 */
{
  id: 'parallelization', num: 3, part: 1, core: true, icon: '⚡',
  pages: '50–64',
  name: { zh: '并行化', en: 'Parallelization' },
  keywords: 'parallel concurrent async fan-out 并发 同时 加速',
  oneLiner: {
    zh: '互不依赖的子任务同时开跑，总耗时从「加起来」变成「最慢的那个」。',
    en: 'Run independent sub-tasks at the same time: total time stops being the sum and becomes the slowest one.'
  },
  analogy: {
    icon: '🍳',
    title: { zh: '做一桌菜', en: 'Cooking a full dinner' },
    body: {
      zh: '炖汤要 40 分钟，米饭要 20 分钟，炒菜要 10 分钟。傻办法是一样一样来，70 分钟才开饭。聪明的做法是汤先炖上、饭同时下锅，最后炒菜——40 分钟全上桌。并行化就是找出那些「不用等别人」的活儿，让它们同时进行。',
      en: 'Soup takes 40 minutes, rice 20, stir-fry 10. Done one after another, dinner is 70 minutes away. Start the soup, put the rice on at the same time, stir-fry at the end — everything lands in 40. Parallelisation is spotting what does not have to wait.'
    }
  },
  problem: {
    zh: '很多流程被写成串行，纯粹是因为「顺手」。查三个 **API** 各要 2 秒，串着跑就是 6 秒——可这三次查询谁也不用等谁。**Latency** 大头往往不是模型在思考，而是在傻等外部返回。',
    en: 'Plenty of flows are sequential purely out of habit. Three **API** calls at 2 seconds each run in 6 — yet none of them needs the others. Most **Latency** is not the model thinking; it is idle waiting on the outside world.'
  },
  solution: {
    zh: '先识别出流程里**彼此不依赖**的部分，然后同时发起，全部返回后再汇总。**LangChain** 里用 `RunnableParallel`，Python 里用 `asyncio.gather`，**ADK** 里则可以让协调 Agent 把独立子任务分给多个 **Sub-agent** 并发处理。总耗时被压缩到最慢的那一支。',
    en: 'Identify the parts that **do not depend on each other**, fire them together, and join when all return. **LangChain** has `RunnableParallel`, Python has `asyncio.gather`, and in **ADK** a coordinator can hand independent sub-tasks to several **Sub-agent**s at once. Total time collapses to the slowest branch.'
  },
  without: {
    zh: '用户点了「生成旅行方案」，然后盯着转圈等 12 秒——其中 10 秒是三个 API 在排队，明明可以一起查。',
    en: 'The user clicks "plan my trip" and stares at a spinner for 12 seconds — 10 of which are three APIs politely queueing.'
  },
  with: {
    zh: '同样三个查询一起发出，4 秒后全部到齐，模型再花 2 秒汇总。体验从「慢得想关掉」变成「还行」。',
    en: 'The same three calls go out together, all back in 4 seconds, 2 more to synthesise. The experience goes from "I am closing this tab" to "fine".'
  },
  whenToUse: [
    { zh: '多个 **API**、数据库或检索请求彼此独立', en: 'Several **API**, database or retrieval calls are independent of each other' },
    { zh: '要对同一份内容做多个角度的分析（情感、主题、实体各来一遍）', en: 'You need several analyses of the same content — sentiment, topics, entities' },
    { zh: '想生成多个候选方案再挑最好的一个', en: 'You want several candidate outputs and will pick the best' },
    { zh: '大批量处理：几百条数据各自独立地跑同一套逻辑', en: 'Batch work: hundreds of independent items running the same logic' }
  ],
  whenNotToUse: [
    { zh: '后一步需要前一步的结果——这是真依赖，强行并行只会拿到空数据', en: 'A step genuinely needs the previous result — forcing parallelism just hands it nothing' },
    { zh: '只有两个很快的调用，并发带来的复杂度不值当', en: 'Only two fast calls: the added complexity is not worth it' },
    { zh: '外部服务有严格速率限制，一起打过去会被限流甚至封禁', en: 'The external service rate-limits hard and a burst gets you throttled or banned' },
    { zh: '**注意**：并发会让调试和日志变难很多，出问题时不容易还原当时的执行顺序', en: '**Note**: concurrency makes debugging and logs much harder — execution order is no longer reproducible' }
  ],
  deepDive: [
    { t: { zh: '并行省的是时间，不是钱', en: 'Parallelism saves time, not money' },
      d: { zh: '这一点经常被搞混：三个调用并行执行，token 消耗和 API 费用与串行**完全一样**——你只是把等待时间从相加变成了取最大值。真正省钱要靠**资源感知优化**（换小模型、限制输出长度、提示缓存）。把并行当成降本手段，最后会发现账单一分没少。',
        en: 'Frequently confused: running three calls concurrently consumes **exactly the same** tokens and API spend as running them in series — you only turned a sum of waits into a maximum. Actual savings come from resource-aware optimisation: smaller models, output caps, prompt caching. Treat parallelism as a cost lever and the bill will not move.' } },
    { t: { zh: '部分失败的语义必须想清楚', en: 'Decide your partial-failure semantics up front' },
      d: { zh: '三个并发请求里挂了一个，你要什么行为？`asyncio.gather` 默认**一个抛异常就整体失败**，另外两个的结果直接丢掉——这往往不是你想要的。加上 `return_exceptions=True` 可以拿到「两个成功一个异常」的混合结果，再决定是降级交付还是整体重试。**这个默认值坑过很多人**。',
        en: 'One of three concurrent calls fails — what should happen? `asyncio.gather` defaults to **failing the whole thing on the first exception** and discarding the other two results, which is rarely what you want. `return_exceptions=True` returns the mixed outcome so you can choose between degraded delivery and a full retry. **This default catches people out.**' } },
    { t: { zh: '限流与并发上限', en: 'Rate limits and a concurrency ceiling' },
      d: { zh: '把一百条数据一次性 `gather` 出去，几乎必然撞上供应商的每分钟请求数或 token 限额，换来一批 429。生产写法是用 **Semaphore 控制同时在飞的请求数**（通常 5–20），配合退避重试。并发度不是越高越好——超过服务端承受能力后，实际吞吐反而下降。',
        en: 'Firing a hundred items through one `gather` will almost certainly breach the provider\'s requests-per-minute or token limits and return a wave of 429s. Production code caps **in-flight requests with a semaphore** (typically 5–20) plus backoff retries. More concurrency is not better: past the server\'s capacity, effective throughput drops.' } },
    { t: { zh: '框架里的对应物', en: 'What this maps to in frameworks' },
      d: { zh: '**LangChain** 的 `RunnableParallel` 让你声明式地并排跑多个链，返回一个 dict；Python 原生用 `asyncio.gather`；**ADK** 提供 ParallelAgent，也可以走 LLM 驱动委派——协调 Agent 自己识别出独立子任务并分派给多个 **Sub-agent** 并发处理。后者更灵活但并行与否取决于模型判断，不如显式声明可控。',
        en: '**LangChain**\'s `RunnableParallel` declares several chains side by side and returns a dict; plain Python uses `asyncio.gather`; **ADK** offers ParallelAgent, or LLM-driven delegation where a coordinator identifies independent sub-tasks and dispatches them to several **Sub-agent**s. The latter is more flexible but leaves parallelism to the model\'s judgement rather than your declaration.' } }
  ],
  diagram: {
    w: 760, h: 315,
    nodes: [
      { id: 'task', kind: 'actor',  x: 78,  y: 158, label: { zh: '复杂任务', en: 'Complex task' }, sub: { zh: '规划三天旅行', en: '3-day trip' } },
      { id: 'fan',  kind: 'plan',   x: 240, y: 158, label: { zh: '拆成独立子任务', en: 'Split into independent parts' } },
      { id: 'w1',   kind: 'tool',   x: 428, y: 58,  label: { zh: '查天气', en: 'Weather API' }, sub: '2s' },
      { id: 'w2',   kind: 'tool',   x: 428, y: 158, label: { zh: '查酒店', en: 'Hotels API' }, sub: '4s' },
      { id: 'w3',   kind: 'tool',   x: 428, y: 258, label: { zh: '查景点', en: 'Attractions API' }, sub: '3s' },
      { id: 'join', kind: 'agent',  x: 600, y: 158, label: { zh: '汇总', en: 'Synthesise' } },
      { id: 'out',  kind: 'output', x: 600, y: 268, label: { zh: '行程方案', en: 'Itinerary' } }
    ],
    edges: [
      { from: 'task', to: 'fan' },
      { from: 'fan', to: 'w1' }, { from: 'fan', to: 'w2' }, { from: 'fan', to: 'w3' },
      { from: 'w1', to: 'join' }, { from: 'w2', to: 'join' }, { from: 'w3', to: 'join' },
      { from: 'join', to: 'out' }
    ],
    steps: [
      { edge: 'task->fan', say: { zh: '「规划三天旅行」这个任务里，查天气、查酒店、查景点三件事谁也不依赖谁——这是能并行的前提。', en: 'Inside "plan a 3-day trip", weather, hotels and attractions depend on none of each other — the precondition for going parallel.' } },
      { edges: ['fan->w1', 'fan->w2', 'fan->w3'], say: { zh: '三个请求同一瞬间发出去，而不是排队。注意三个小球是一起动的——这就是并行和串行的全部区别。', en: 'All three requests leave at the same instant instead of queueing. The three tokens move together — that is the whole difference.' } },
      { edges: ['w1->join', 'w2->join', 'w3->join'], say: { zh: '分别耗时 2、4、3 秒，但因为同时进行，总共只等了 4 秒（最慢的那个），而不是 9 秒。', en: 'They take 2, 4 and 3 seconds — but running together the wait is 4 seconds, the slowest one, not 9.' } },
      { edge: 'join->out', say: { zh: '全部返回后，模型才把三份结果合成一个完整行程。汇总这一步必须等——所以它留在了串行位置。', en: 'Only once everything is back does the model merge the three results. That join genuinely must wait, so it stays sequential.' } }
    ]
  },
  code: [
    'import asyncio',
    '',
    '# 三个查询互不依赖，用 gather 同时发出去',
    'weather, hotels, spots = await asyncio.gather(',
    '    get_weather(city),      # 2 秒',
    '    get_hotels(city),       # 4 秒',
    '    get_attractions(city),  # 3 秒',
    ')   # 总共只等 4 秒，不是 9 秒',
    '',
    'return llm("根据这些信息规划行程：" + str([weather, hotels, spots]))'
  ],
  useCases: [
    { zh: '**多源信息聚合**：同时查天气、新闻、股价、内部数据库，再统一汇总成简报。', en: '**Multi-source briefings**: query weather, news, prices and internal data at once, then merge.' },
    { zh: '**多角度审阅**：让三个 Agent 分别从法务、技术、市场角度同时评审同一份方案。', en: '**Parallel review**: three agents assess one proposal from legal, technical and market angles simultaneously.' },
    { zh: '**批量处理**：一次给几百份简历打分，彼此独立，并发跑完再排序。', en: '**Batch scoring**: rate hundreds of CVs concurrently, then rank.' }
  ],
  quiz: [
    {
      q: { zh: '三个子任务分别耗时 2、4、3 秒。并行执行后总耗时大约是？', en: 'Three sub-tasks take 2, 4 and 3 seconds. Run in parallel, roughly how long?' },
      options: [
        { zh: '9 秒，时间是加起来的', en: '9 seconds — they add up' },
        { zh: '4 秒，等于最慢的那一个', en: '4 seconds — the slowest one' },
        { zh: '3 秒，等于平均值', en: '3 seconds — the average' },
        { zh: '2 秒，等于最快的那一个', en: '2 seconds — the fastest one' }
      ],
      answer: 1,
      why: {
        zh: '并行的收益就是把「求和」变成「求最大值」。这也意味着优化的重点应该放在最慢的那一支上——其他支再快也改变不了总时间。',
        en: 'Parallelism turns a sum into a maximum. It also means optimisation should target the slowest branch — speeding up the others changes nothing.'
      }
    },
    {
      q: { zh: '判断能否并行的唯一标准是什么？', en: 'What is the one test for whether tasks can run in parallel?' },
      options: [
        { zh: '任务数量是否超过三个', en: 'Whether there are more than three of them' },
        { zh: '任务之间是否互相需要对方的输出', en: 'Whether any task needs another\'s output' },
        { zh: '是否使用了同一个模型', en: 'Whether they use the same model' },
        { zh: '任务耗时是否接近', en: 'Whether they take similar amounts of time' }
      ],
      answer: 1,
      why: {
        zh: '只看依赖关系。B 需要 A 的结果，就必须等；不需要，就可以同时跑。任务多少、快慢、用不用同一个模型都不影响这个判断。',
        en: 'Only dependency matters. If B needs A\'s result it must wait; if not, they can go together. Count, speed and model choice are irrelevant.'
      }
    },
    {
      q: { zh: '书里特别提醒并行化有什么代价？', en: 'What cost does the book flag for parallelisation?' },
      options: [
        { zh: '会让模型输出质量下降', en: 'It lowers output quality' },
        { zh: '会显著增加设计、调试和日志的复杂度', en: 'It substantially complicates design, debugging and logging' },
        { zh: '只能在特定框架里使用', en: 'It only works in certain frameworks' },
        { zh: '会导致模型忘记上下文', en: 'It makes the model forget context' }
      ],
      answer: 1,
      why: {
        zh: '并发架构的复杂度是实打实的成本：出错时执行顺序不再可复现，日志会交错，竞态问题很难查。所以只在收益明显时才用。',
        en: 'Concurrency has a real engineering cost: execution order stops being reproducible, logs interleave, and race conditions are painful. Use it where the payoff is clear.'
      }
    }
  ],
  terms: [
    { en: 'Parallelization', zh: { zh: '并行化', en: 'Parallelization' }, d: { zh: '并发执行多个组件——LLM 调用、工具使用、甚至整个子 Agent——而不是等一个完成再开始下一个。', en: 'Executing several components concurrently — LLM calls, tool uses, even whole sub-agents — instead of waiting for each to finish.' } },
    { en: 'RunnableParallel', zh: { zh: 'LCEL 的并行构件', en: 'RunnableParallel' }, d: { zh: 'LangChain Expression Language 里用来把多个 runnable 并排执行的核心构件，返回一个字典。', en: 'LCEL\'s core construct for running several runnables side by side, returning a dict.' } },
    { en: 'ParallelAgent', zh: { zh: 'ADK 的并行 Agent', en: 'ParallelAgent' }, d: { zh: 'ADK 里直接表达并发执行的 Agent 类型；ADK 也可通过 LLM 驱动委派让协调者识别独立子任务并分派。', en: 'ADK\'s agent type for concurrent execution; ADK can also reach parallelism via LLM-driven delegation from a coordinator.' } },
    { en: 'I/O-bound Latency', zh: { zh: 'I/O 密集型延迟', en: 'I/O-bound latency' }, d: { zh: '原书指出并行化收益最大的场景：瓶颈不在模型思考，而在等待外部 API 或数据库返回。', en: 'Where the book says parallelism pays most: the bottleneck is not the model thinking but waiting on external APIs or databases.' } }
  ],
  refs: [
    { kind: 'docs', title: 'LangChain — LCEL 并行执行', url: 'https://python.langchain.com/docs/concepts/lcel/' },
    { kind: 'docs', title: 'Google ADK — Multi-Agent Systems', url: 'https://google.github.io/adk-docs/agents/multi-agents/' },
    { kind: 'docs', title: 'Python asyncio 官方文档', url: 'https://docs.python.org/3/library/asyncio.html', note: { zh: 'gather 的 return_exceptions 参数值得细看', en: 'the return_exceptions flag on gather is worth reading closely' } }
  ],
  related: ['prompt-chaining', 'multi-agent', 'resource-aware']
},

/* ---------------------------------------------------------- 4 */
{
  id: 'reflection', num: 4, part: 1, core: true, icon: '🪞',
  pages: '65–77',
  name: { zh: '反思', en: 'Reflection' },
  alias: { zh: '生产者—评审者 Producer–Critic', en: 'Producer–Critic' },
  keywords: 'reflection critic self-correction review 自我批评 迭代 打磨',
  oneLiner: {
    zh: '让模型（或另一个模型）审视自己的初稿，挑出毛病再改一遍，而不是把第一版当终稿。',
    en: 'Have the model — or a second one — critique its own first draft and revise, instead of shipping draft one.'
  },
  analogy: {
    icon: '✍️',
    title: { zh: '作者与编辑', en: 'A writer and an editor' },
    body: {
      zh: '好文章不是一遍写成的。作者写初稿，编辑拿着标准挑毛病：这段论据不足、那句话有歧义。作者据此改，编辑再看。反思模式就是把这个循环搬进 Agent 里——而且让「编辑」由另一个独立的 Agent 来当，会比作者自己改更客观。',
      en: 'Good writing is never one pass. The writer drafts; the editor holds it against a standard — this claim is unsupported, that line is ambiguous. The writer revises, the editor re-reads. Reflection puts that loop inside the agent, and making the editor a separate agent beats self-editing on objectivity.'
    }
  },
  problem: {
    zh: '模型的第一版输出经常「看起来不错但经不起细看」：论证有漏洞、要求漏了一条、代码跑不通。普通流程里没有任何环节去发现这些问题——第一版直接就是最终版，好坏全靠运气。',
    en: 'A model\'s first output is often plausible but thin: a gap in the argument, one requirement quietly dropped, code that does not run. A plain flow has nothing that would ever notice — draft one ships, quality is luck.'
  },
  solution: {
    zh: '建立「生成 → 评估 → 改进」的反馈循环。一个**生产者**负责产出，一个**评审者**拿着明确标准去批评，批评意见再喂回生产者产出改进版。可以自己评自己，但书里强调：另起一个独立的评审 Agent 客观性明显更好，因为它不需要为初稿辩护。',
    en: 'Build a generate → evaluate → refine loop. A **producer** writes; a **critic** judges it against explicit criteria; the critique feeds back into a better version. Self-critique works, but the book stresses a separate critic agent is markedly more objective — it has no draft to defend.'
  },
  without: {
    zh: '你拿到一篇读着顺、细看全是问题的报告，只能自己一条条挑，然后再回去手动让模型改。',
    en: 'You get a report that reads smoothly and falls apart on inspection, then hand-list the problems yourself and go back for another round.'
  },
  with: {
    zh: '交付前系统已经自己挑过两三轮毛病了。质量提升是实打实的，但代价也很明确：**Latency** 和费用翻几倍，对话历史也越滚越长。',
    en: 'The system has already caught its own problems two or three times before you see it. The quality gain is real — and so is the cost: several times the **Latency** and spend, with a history that keeps growing.'
  },
  whenToUse: [
    { zh: '输出质量比速度和成本更重要（长文、方案、报告）', en: 'Quality matters more than speed or cost — long-form writing, plans, reports' },
    { zh: '写代码和调试：评审者可以真的把代码跑一遍，用报错当反馈', en: 'Code: the critic can actually run it and use the error output as feedback' },
    { zh: '有明确的验收标准可以拿来对照检查', en: 'There are explicit criteria to check against' },
    { zh: '任务需要多个维度都达标（既要准确、又要合规、还要好读）', en: 'Several dimensions must all hold — accurate, compliant and readable' }
  ],
  whenNotToUse: [
    { zh: '实时对话场景：用户不会为了更好的措辞多等 10 秒', en: 'Real-time chat: nobody waits 10 extra seconds for better phrasing' },
    { zh: '简单事实问答——多轮反思改不出更对的答案，只是烧钱', en: 'Simple factual lookups — extra rounds do not make a fact more true, they just cost money' },
    { zh: '没有客观评判标准的任务，评审者只会给出空泛意见，甚至越改越差', en: 'No objective standard: the critic produces vague notes and revisions can drift worse' },
    { zh: '**注意 Context Window**：每轮都把初稿、批评、修订累加进历史，很容易撑爆上限', en: '**Watch the Context Window**: every round stacks draft, critique and revision — it fills fast' }
  ],
  deepDive: [
    { t: { zh: '迭代收益递减：为什么通常只跑 2–3 轮', en: 'Diminishing returns: why two or three rounds is usual' },
      d: { zh: '第一轮反思带来的质量提升最大，第二轮明显变小，第三轮之后往往只是在同义改写。更麻烦的是**过度反思会让输出退化**——评审者为了「找出点什么」开始提出边际甚至有害的意见，生产者照改反而越改越差。所以除了轮数上限，还应该有**质量不再提升就提前退出**的判断。',
        en: 'The first round of reflection delivers most of the gain, the second noticeably less, and beyond the third it is usually synonym-shuffling. Worse, **over-reflection degrades output**: the critic, obliged to find something, raises marginal or harmful points and the producer dutifully makes it worse. So alongside a round cap, add an **early exit when quality stops improving**.' } },
    { t: { zh: '评审标准必须具体到可判定', en: 'Criteria must be specific enough to adjudicate' },
      d: { zh: '让评审者「看看写得好不好」，你会得到「可以更详细一些」这类无法执行的意见。有效的做法是给它一份**可逐条判定的 rubric**：每个论点是否有数据支撑？是否覆盖了需求里列出的全部 5 项？有没有超出资料范围的断言？**评审的质量上限由 rubric 决定**，不是由模型能力决定。',
        en: 'Ask a critic whether the writing is good and you get "could be more detailed" — unactionable. What works is a **rubric it can adjudicate item by item**: is each claim backed by data? Are all five stated requirements covered? Are there assertions beyond the source material? **The rubric caps critique quality**, not the model.' } },
    { t: { zh: '客观信号 > 模型意见', en: 'Objective signals beat model opinions' },
      d: { zh: '反思模式的效果强弱几乎完全取决于反馈信号的客观程度。**编译器报错、单元测试结果、schema 校验失败、代码执行异常**——这些是外部世界给的事实，反思循环在这类场景下效果极好。而「这段文案够不够吸引人」这种没有客观标准的判断，多轮反思往往只是让两个模型互相说服，并不真的提升质量。',
        en: 'The pattern\'s effectiveness tracks the objectivity of its feedback signal almost exactly. **Compiler errors, test results, schema validation failures, runtime exceptions** are facts from outside, and reflection loops excel there. For judgements with no objective standard — "is this copy compelling" — extra rounds mostly have two models persuade each other without improving anything.' } },
    { t: { zh: '成本的真实量级', en: 'What it actually costs' },
      d: { zh: '一轮反思 = 1 次生成 + 1 次评审 + 1 次修订，即 3 次调用。跑 3 轮就是 7 次调用起步，而且每次的输入都比上一次长（历史在累积）。实际账单往往是单次生成的 **8–10 倍**，延迟也是数倍。这决定了它只适合「质量优先于速度和成本」的场景——这也正是书里 Rule of thumb 的原话。',
        en: 'One round is generate + critique + revise, three calls. Three rounds start at seven calls, each with a longer input as history accumulates. The real bill typically lands at **eight to ten times** a single generation, with latency multiplied similarly. Hence its fit only where quality outranks speed and cost — precisely the book\'s rule of thumb.' } },
    { t: { zh: '框架里的对应物', en: 'What this maps to in frameworks' },
      d: { zh: '完整的迭代反思需要**有状态的循环**，这正是 **LangGraph** 擅长的：定义 generate 和 critique 两个节点，用条件边决定是回到 generate 还是结束。**ADK** 提供 LoopAgent 直接表达循环，也可以用 SequentialAgent 把生产者和评审者串成一个单轮反思。**LangChain** 的 LCEL 是线性的，只适合做单次反思。',
        en: 'Full iterative reflection needs a **stateful loop**, which is **LangGraph**\'s strength: a generate node, a critique node, and a conditional edge deciding whether to loop or finish. **ADK** offers LoopAgent for the loop directly, or SequentialAgent to wire producer and critic into a single-pass reflection. **LangChain**\'s LCEL is linear and suits only one-shot reflection.' } }
  ],
  diagram: {
    w: 760, h: 300,
    nodes: [
      { id: 'task',   kind: 'actor',  x: 80,  y: 80,  label: { zh: '任务', en: 'Task' }, sub: { zh: '写一篇分析', en: 'write an analysis' } },
      { id: 'gen',    kind: 'agent',  x: 255, y: 80,  label: { zh: '生产者', en: 'Producer' }, sub: { zh: '负责写', en: 'writes' } },
      { id: 'draft',  kind: 'output', x: 445, y: 80,  label: { zh: '初稿', en: 'Draft' } },
      { id: 'critic', kind: 'check',  x: 445, y: 218, label: { zh: '评审者', en: 'Critic' }, sub: { zh: '对照标准挑错', en: 'checks criteria' } },
      { id: 'final',  kind: 'output', x: 655, y: 80,  label: { zh: '定稿', en: 'Final' } }
    ],
    edges: [
      { from: 'task', to: 'gen' },
      { from: 'gen', to: 'draft' },
      { from: 'draft', to: 'critic' },
      { from: 'critic', to: 'gen', label: { zh: '修改意见', en: 'critique' }, bend: -55 },
      { from: 'draft', to: 'final', label: { zh: '达标放行', en: 'passes' } }
    ],
    steps: [
      { edge: 'task->gen', say: { zh: '任务交给生产者 Agent，它的职责只有一个：先写出来。', en: 'The task goes to the producer agent, whose only job is to write something.' } },
      { edge: 'gen->draft', say: { zh: '初稿出炉。它通常「读着还行」，但论据、完整性、格式往往都有欠缺。', en: 'A draft appears. It usually reads fine while being thin on evidence, completeness or format.' } },
      { edge: 'draft->critic', say: { zh: '评审者拿着事先定好的标准逐条检查。关键在于它是**独立的角色**——不需要为这份初稿辩护，所以下手更狠。', en: 'The critic checks it against pre-agreed criteria. Crucially it is a **separate role** with no draft to defend, so it judges harder.' } },
      { edge: 'critic->gen', say: { zh: '批评意见回传给生产者，它据此重写。这个循环可以跑好几轮——但每一轮都要多花一次调用的钱和时间。', en: 'The critique returns to the producer, which rewrites. The loop can run several times — each costing another call in money and time.' } },
      { edge: 'draft->final', say: { zh: '直到评审通过，或者达到预设的轮数上限，才输出定稿。一定要设上限，否则可能无限打磨下去。', en: 'Only when the critic passes it — or a round limit is hit — does the final version ship. Always set that limit, or it polishes forever.' } }
    ]
  },
  code: [
    'draft = llm("写一篇关于 X 的分析：" + topic)',
    '',
    'for i in range(3):                      # 一定要设上限，否则会无限循环',
    '    critique = critic_llm(              # 独立的评审角色，标准要写具体',
    '        "按【论据充分/结构清晰/无事实错误】逐条检查，指出问题：" + draft)',
    '',
    '    if "通过" in critique:',
    '        break                           # 达标就提前退出，别浪费调用',
    '',
    '    draft = llm("根据这些意见改写：" + critique + "\\n原文：" + draft)',
    '',
    'return draft'
  ],
  useCases: [
    { zh: '**代码生成**：写完让评审 Agent 真的执行一遍，把报错信息当作最客观的批评意见喂回去。', en: '**Code generation**: actually run the result and feed the stack trace back as the most objective critique possible.' },
    { zh: '**长文写作**：初稿 → 检查论据和逻辑 → 重写，产出质量远高于一次成文。', en: '**Long-form writing**: draft, check evidence and logic, rewrite — far better than one pass.' },
    { zh: '**方案审查**：让评审者专门检查「有没有漏掉需求里的某一条」。', en: '**Plan review**: a critic whose only job is spotting requirements the draft quietly dropped.' }
  ],
  quiz: [
    {
      q: { zh: '为什么书里推荐用**独立的评审 Agent**，而不是让模型自己评自己？', en: 'Why does the book prefer a **separate critic agent** over self-critique?' },
      options: [
        { zh: '因为两个 Agent 速度更快', en: 'Two agents are faster' },
        { zh: '因为职责分离带来更好的客观性和更专业的反馈', en: 'Separating the roles gives better objectivity and more specialised feedback' },
        { zh: '因为一个模型无法读自己的输出', en: 'A model cannot read its own output' },
        { zh: '因为这样更省钱', en: 'It is cheaper' }
      ],
      answer: 1,
      why: {
        zh: '自己评自己天然有「护短」倾向——模型倾向于认为刚写的东西是对的。换一个角色、给它专门的评判标准，批评会更严格也更具体。',
        en: 'Self-review is biased toward defending what was just written. A separate role with its own explicit criteria criticises harder and more specifically.'
      }
    },
    {
      q: { zh: '反思模式最主要的代价是什么？', en: 'What is reflection\'s main cost?' },
      options: [
        { zh: '需要更大的模型才能运行', en: 'It needs a bigger model' },
        { zh: '延迟和费用成倍增加，上下文也越滚越长', en: 'Multiplied latency and spend, plus an ever-growing context' },
        { zh: '会让输出变得更短', en: 'Outputs get shorter' },
        { zh: '只能用在写作任务上', en: 'It only works for writing' }
      ],
      answer: 1,
      why: {
        zh: '每一轮反思都是一次或多次额外的模型调用。三轮下来成本可能是原来的六七倍，而且初稿、批评、修订全都堆在对话历史里，很容易触到上下文上限。',
        en: 'Every round is one or more extra calls. Three rounds can cost six or seven times the original, and draft plus critique plus revision all pile into the context window.'
      }
    },
    {
      q: { zh: '在代码生成场景里，最客观的「批评意见」来自哪里？', en: 'For code generation, where does the most objective critique come from?' },
      options: [
        { zh: '让另一个模型读代码并给出主观评价', en: 'A second model reading the code and giving opinions' },
        { zh: '实际运行代码，拿测试结果和报错信息当反馈', en: 'Actually running the code and using test results and errors' },
        { zh: '统计代码行数是否合理', en: 'Checking whether the line count looks reasonable' },
        { zh: '让模型自己确认「我写对了」', en: 'Asking the model to confirm it got it right' }
      ],
      answer: 1,
      why: {
        zh: '这是反思模式最漂亮的用法：报错信息是外部世界给的**事实**，不是模型的猜测。能拿到这种客观信号的场景，反思的效果最好。',
        en: 'This is reflection at its best: a stack trace is a **fact** from the outside world, not the model\'s guess. Reflection works best wherever such objective signals exist.'
      }
    }
  ],
  terms: [
    { en: 'Producer–Critic model', zh: { zh: '生产者—评审者模型', en: 'Producer–critic model' }, d: { zh: '原书对反思模式最强实现的命名：由一个独立的 Agent 担任评审，而非让生产者自评，以获得客观性和更专业的结构化反馈。', en: 'The book\'s name for the pattern\'s strongest form: a separate agent acts as critic rather than the producer self-reviewing, giving objectivity and more specialised structured feedback.' } },
    { en: 'Self-Correction', zh: { zh: '自我修正', en: 'Self-correction' }, d: { zh: '模型评估自己的输出并据此产出改进版本的机制，是反思循环的核心动作。', en: 'A model evaluating its own output and producing an improved version — the core action of the reflection loop.' } },
    { en: 'Iterative Refinement', zh: { zh: '迭代精炼', en: 'Iterative refinement' }, d: { zh: '生成→评估→改进的反馈回路反复执行，逐步提升最终结果质量。原书强调必须设轮数上限。', en: 'Repeating the generate-evaluate-refine loop to progressively raise quality. The book stresses capping the number of rounds.' } },
    { en: 'LoopAgent', zh: { zh: 'ADK 的循环 Agent', en: 'LoopAgent' }, d: { zh: 'ADK 中直接表达迭代循环的 Agent 类型；原书也给出用 SequentialAgent 实现单轮反思的替代写法。', en: 'ADK\'s agent type for iterative loops; the book also shows a SequentialAgent variant for single-pass reflection.' } }
  ],
  refs: [
    { kind: 'paper', title: 'Training Language Models to Self-Correct via Reinforcement Learning', url: 'https://arxiv.org/abs/2409.12917', note: { zh: '自我修正方向的代表性研究', en: 'representative research on self-correction' } },
    { kind: 'docs', title: 'LangGraph — 有状态循环', url: 'https://www.langchain.com/langgraph', note: { zh: '完整的迭代反思需要它', en: 'full iterative reflection needs this' } },
    { kind: 'docs', title: 'Google ADK — Multi-Agent Systems', url: 'https://google.github.io/adk-docs/agents/multi-agents/' }
  ],
  related: ['tool-use', 'multi-agent', 'evaluation']
},

/* ---------------------------------------------------------- 5 */
{
  id: 'tool-use', num: 5, part: 1, core: true, icon: '🔧',
  pages: '79–99',
  name: { zh: '工具使用', en: 'Tool Use' },
  alias: { zh: '函数调用 Function Calling', en: 'Function Calling' },
  keywords: 'tool function calling api 函数调用 外部世界 插件',
  oneLiner: {
    zh: '模型自己不查天气也不发邮件，它只是输出「我要调用哪个函数、参数是什么」，剩下的交给你的代码。',
    en: 'The model never checks the weather or sends the email — it emits "call this function with these arguments", and your code does the rest.'
  },
  analogy: {
    icon: '📞',
    title: { zh: '会打电话的顾问', en: 'A consultant with a phone' },
    body: {
      zh: '一位顾问知识渊博，但他的知识停在读完书那天，而且他坐在办公室里哪也去不了。给他一部电话和一本通讯录，情况就变了：他可以打给气象台问天气、打给银行查账。他自己仍然不做这些事，他只是知道**该打给谁、该问什么**。工具使用就是给模型这本通讯录。',
      en: 'A consultant is well-read, but their knowledge stops the day they finished reading, and they cannot leave the office. Give them a phone and a directory and everything changes: they ring the weather service, they ring the bank. They still do none of it themselves — they just know **who to call and what to ask**. Tool use is that directory.'
    }
  },
  problem: {
    zh: '**LLM** 本质上是个封闭的文字预测器。它的知识停在训练截止日，不知道今天的股价，查不了你公司的数据库，算不准复杂数学，更不能真的发出一封邮件。没有对外的桥梁，它解决真实问题的能力被卡得很死。',
    en: 'An **LLM** is a closed text predictor. Its knowledge stops at the training cutoff; it cannot see today\'s prices, query your database, do exact arithmetic, or actually send an email. Without a bridge outward, its usefulness on real problems is sharply capped.'
  },
  solution: {
    zh: '把可用的函数用模型能读懂的方式描述给它——名字、干什么用、需要哪些参数。模型判断需要用工具时，不会自己执行，而是输出一段结构化的 **JSON** 说明「调用 get_weather，参数 city=东京」。外层的编排代码接住这个请求、真正执行、把结果塞回去，模型再据此作答。这就是 **Function Calling**。',
    en: 'Describe the available functions in terms the model understands — name, purpose, parameters. When it decides a tool is needed it does not execute anything; it emits structured **JSON** saying "call get_weather with city=Tokyo". Your orchestration layer catches that, really runs it, feeds the result back, and the model answers from it. That is **Function Calling**.'
  },
  without: {
    zh: '你问「东京现在几度」，模型给你一个语气笃定的数字——那是它编的。它没有任何途径知道真实答案。',
    en: 'You ask the temperature in Tokyo and get a confident number. It is invented. The model had no way to know.'
  },
  with: {
    zh: '模型识别出这需要实时数据，调用天气 API 拿到真实的 22°C，再基于这个事实回答。从「像是知道」变成「真的知道」。',
    en: 'The model recognises it needs live data, calls the weather API, gets a real 22°C, and answers from that fact. From sounding informed to being informed.'
  },
  whenToUse: [
    { zh: '需要实时或时效性数据（天气、股价、库存、订单状态）', en: 'You need live data — weather, prices, stock levels, order status' },
    { zh: '需要访问私有数据（公司数据库、内部文档、用户资料）', en: 'You need private data — company databases, internal docs, user records' },
    { zh: '需要精确计算或执行代码——模型算数学本来就不可靠', en: 'You need exact computation or code execution — models are bad at arithmetic' },
    { zh: '需要真的产生动作（发邮件、建工单、调用下单接口）', en: 'You need real side effects — send mail, open a ticket, place an order' }
  ],
  whenNotToUse: [
    { zh: '答案就在模型的常识范围内，加工具只是徒增一次往返', en: 'The answer is ordinary knowledge — a tool call is a pointless round trip' },
    { zh: '一次性给模型挂了几十个工具：选择太多它反而容易挑错，先分组或配合**路由**', en: 'Dozens of tools at once: too much choice and it picks wrong — group them or put routing in front' },
    { zh: '工具描述写得含糊——模型是靠描述来判断该不该用的，描述烂了它就乱用', en: 'Vague tool descriptions — the description is all the model has to go on, so a bad one causes misuse' },
    { zh: '有副作用的危险操作（转账、删数据）没有加确认环节', en: 'Dangerous side effects (payments, deletions) with no confirmation step in front' }
  ],
  deepDive: [
    { t: { zh: '工具描述就是提示工程，而且是最高杠杆的那部分', en: 'The tool description is prompt engineering — and the highest-leverage part' },
      d: { zh: '模型看不到函数体，它决定「用不用、用哪个、传什么」的**全部依据**就是函数名、docstring 和参数 schema。所以描述里要写清楚**什么时候该用它、什么时候不该用**（「仅用于查询实时天气，历史天气请用 get_history」），参数要有类型和取值说明。工具选错时，先改描述，别急着改系统提示。',
        en: 'The model never sees the function body. Its **entire basis** for whether to call, which to call and with what arguments is the name, docstring and parameter schema. So the description must state **when to use it and when not to** ("live weather only; use get_history for past dates"), with typed, documented parameters. When tool selection goes wrong, fix the description before touching the system prompt.' } },
    { t: { zh: '工具数量与选择准确率的关系', en: 'Tool count versus selection accuracy' },
      d: { zh: '挂载的工具越多，模型选错的概率越高，同时每次请求都要把全部工具定义塞进上下文，输入 token 也线性增长。经验做法有三条：**按会话/角色只挂载当前需要的子集**、**用路由先缩小范围再交给带少量工具的 Agent**、**把功能相近的工具合并成一个带枚举参数的工具**。超过十几个工具时这些手段几乎是必需的。',
        en: 'More mounted tools means a higher misselection rate, and every request carries all definitions in context so input tokens grow linearly too. Three practical moves: **mount only the subset this session or role needs**, **route first and hand off to an agent with few tools**, and **merge near-duplicate tools into one with an enum parameter**. Past a dozen or so tools these stop being optional.' } },
    { t: { zh: '工具报错要回灌给模型，而不是直接抛出', en: 'Feed tool errors back to the model rather than raising them' },
      d: { zh: '这是 Agent 循环里非常实用的一招：工具调用失败时（参数格式错、找不到记录），把**错误信息本身作为 observation 返回给模型**，让它据此修正参数重试。模型通常一两轮就能自己纠正。直接抛异常终止，等于放弃了这个免费的自愈机会。当然要设重试上限，避免无限循环。',
        en: 'A genuinely useful move inside the agent loop: when a tool call fails — bad argument format, record not found — return **the error text itself as an observation** so the model can correct its arguments and retry. It usually self-corrects within a round or two. Raising and terminating throws away that free recovery. Cap the retries, obviously.' } },
    { t: { zh: '并行工具调用', en: 'Parallel tool calls' },
      d: { zh: '现代模型 API 大多支持在**一次响应里返回多个工具调用**。如果这些调用彼此独立（查天气、查汇率、查库存），编排层应该并发执行而不是逐个串行——这正是**并行化**模式在工具层的直接应用。很多实现默认串行执行，白白浪费了模型已经识别出的并行机会。',
        en: 'Most modern model APIs can return **several tool calls in one response**. When those calls are independent — weather, exchange rate, stock level — the orchestration layer should execute them concurrently rather than in series, which is the parallelisation pattern applied at the tool layer. Many implementations run them sequentially by default and waste the parallelism the model already identified.' } },
    { t: { zh: '安全边界在执行层，不在模型层', en: 'The safety boundary is the executor, not the model' },
      d: { zh: '因为真正执行的是你的代码，所有权限控制都应该落在那里：参数白名单、额度上限、危险操作前置确认、按角色挂载工具集。**指望在提示词里写「不要删除数据」来保证安全是无效的**——那只是一句可以被绕过的建议，而执行层的检查是确定性的。这一点在**护栏与安全**里会展开。',
        en: 'Because your code does the executing, every permission check belongs there: argument whitelists, quota caps, confirmation before destructive actions, role-scoped tool sets. **Writing "never delete data" in the prompt does not make it safe** — that is a suggestion that can be argued around, while an executor check is deterministic. The guardrails pattern develops this.' } }
  ],
  diagram: {
    w: 770, h: 290,
    nodes: [
      { id: 'user', kind: 'actor',  x: 78,  y: 80,  label: { zh: '用户提问', en: 'User asks' }, sub: { zh: '东京几度？', en: 'temp in Tokyo?' } },
      { id: 'llm',  kind: 'llm',    x: 258, y: 80,  label: { zh: '模型', en: 'Model' }, sub: { zh: '要用工具吗？', en: 'need a tool?' } },
      { id: 'call', kind: 'prompt', x: 448, y: 80,  label: { zh: '结构化调用', en: 'Structured call' }, sub: 'JSON' },
      { id: 'api',  kind: 'tool',   x: 648, y: 80,  label: { zh: '天气 API', en: 'Weather API' } },
      { id: 'ans',  kind: 'output', x: 448, y: 232, label: { zh: '基于事实作答', en: 'Grounded answer' } }
    ],
    edges: [
      { from: 'user', to: 'llm' },
      { from: 'llm', to: 'call' },
      { from: 'call', to: 'api' },
      { from: 'api', to: 'llm', label: { zh: '真实数据 22°C', en: 'real data 22°C' }, bend: 68 },
      { from: 'llm', to: 'ans' }
    ],
    steps: [
      { edge: 'user->llm', say: { zh: '用户问了一个模型自己绝对答不了的问题——它的训练数据里不可能有今天的气温。', en: 'A question the model cannot possibly answer alone — today\'s temperature was never in its training data.' } },
      { edge: 'llm->call', say: { zh: '关键一步：模型**不执行任何代码**，它只是输出一段 JSON：「请调用 get_weather，参数 city=东京」。它做的是判断，不是执行。', en: 'The key move: the model **runs nothing**. It emits JSON — "call get_weather with city=Tokyo". It decides; it does not execute.' } },
      { edge: 'call->api', say: { zh: '外层的编排代码接住这个请求，真正去调用天气 API。执行权始终在你的代码手里，这也是安全边界所在。', en: 'Your orchestration layer catches the request and actually calls the API. Execution stays in your code — which is also where the safety boundary lives.' } },
      { edge: 'api->llm', say: { zh: '真实结果 22°C 被塞回模型的上下文里。现在它手上有的是事实，不是猜测。', en: 'The real 22°C goes back into the model\'s context. Now it holds a fact rather than a guess.' } },
      { edge: 'llm->ans', say: { zh: '模型基于这个事实组织语言作答。同一个循环可以反复进行——这就是 ReAct「边想边做」的基础。', en: 'The model answers from that fact. The same loop can repeat — which is the basis of the ReAct think-act-observe cycle.' } }
    ]
  },
  code: [
    '@tool                                  # 把普通函数注册成模型可见的工具',
    'def get_weather(city: str) -> str:',
    '    """查询指定城市的当前天气。"""      # 这段描述就是模型的判断依据，要写清楚',
    '    return weather_api.query(city)',
    '',
    'agent = create_agent(llm, tools=[get_weather])',
    '',
    '# 模型自己决定要不要调、调哪个、传什么参数；框架负责真正执行',
    'agent.run("东京现在几度？")'
  ],
  useCases: [
    { zh: '**实时查询助手**：股价、航班、天气、订单状态，凡是会变的数据都得靠工具。', en: '**Live lookups**: prices, flights, weather, order status — anything that changes needs a tool.' },
    { zh: '**数据分析**：让模型生成并执行代码来做统计，比让它心算靠谱得多。', en: '**Analysis**: have the model write and execute code rather than doing arithmetic in its head.' },
    { zh: '**办公自动化**：建日程、发通知、开工单——让 Agent 真的产生动作而不只是给建议。', en: '**Workflow automation**: create events, send notices, open tickets — real actions, not suggestions.' }
  ],
  quiz: [
    {
      q: { zh: '当模型「使用工具」时，实际执行函数的是谁？', en: 'When a model "uses a tool", who actually executes the function?' },
      options: [
        { zh: '模型自己在内部运行代码', en: 'The model runs the code internally' },
        { zh: '模型输出结构化调用请求，由外层编排代码真正执行', en: 'The model emits a structured call; the orchestration layer executes it' },
        { zh: 'API 提供商代替模型执行', en: 'The API provider runs it on the model\'s behalf' },
        { zh: '需要用户手动复制粘贴去执行', en: 'The user copies and pastes it manually' }
      ],
      answer: 1,
      why: {
        zh: '这是最容易误解的一点。模型永远只产出文本——包括「我想调用什么」这个意图的文本。真正的执行发生在你的代码里，这既是工程事实，也是安全边界所在。',
        en: 'This is the most commonly misunderstood part. The model only ever produces text — including the text expressing what it wants called. Execution happens in your code, which is both an engineering fact and the safety boundary.'
      }
    },
    {
      q: { zh: '模型靠什么判断该不该用某个工具、以及用哪个？', en: 'What does the model use to decide whether and which tool to call?' },
      options: [
        { zh: '工具的函数名和描述文字', en: 'The tool\'s name and description' },
        { zh: '工具被调用的历史次数', en: 'How often the tool has been called before' },
        { zh: '工具代码的实现细节', en: 'The tool\'s implementation details' },
        { zh: '随机选择', en: 'Random choice' }
      ],
      answer: 0,
      why: {
        zh: '模型看不到函数体，它只看得到你写的名字、说明和参数定义。所以工具描述写得含糊，模型就会该用的时候不用、不该用的时候乱用——描述本身就是提示工程。',
        en: 'The model never sees the function body — only the name, docstring and parameter schema you wrote. Vague descriptions cause both missed and spurious calls. The description is prompt engineering.'
      }
    },
    {
      q: { zh: '下面哪种情况**最需要**工具使用？', en: 'Which case **most** needs tool use?' },
      options: [
        { zh: '把一段话改写得更正式', en: 'Rewrite a paragraph more formally' },
        { zh: '解释什么是光合作用', en: 'Explain photosynthesis' },
        { zh: '查询用户当前订单的物流状态', en: 'Check the shipping status of a user\'s current order' },
        { zh: '给一篇文章起三个标题', en: 'Suggest three headlines for an article' }
      ],
      answer: 2,
      why: {
        zh: '前三个选项里只有物流状态是模型**不可能知道**的：它既是实时数据，又存在你的私有系统里。改写、解释、起标题都在模型的能力范围内，加工具纯属多余。',
        en: 'Only the shipping status is something the model **cannot** know: it is both live and private to your systems. Rewriting, explaining and headline-writing are all within the model itself.'
      }
    }
  ],
  terms: [
    { en: 'Function Calling', zh: { zh: '函数调用', en: 'Function calling' }, d: { zh: '工具使用最常见的实现方式：模型输出一个指明「调哪个函数、传什么参数」的结构化对象（通常是 JSON），由编排层实际执行。', en: 'The usual implementation of tool use: the model emits a structured object — normally JSON — naming the function and arguments, and the orchestration layer executes it.' } },
    { en: 'Orchestration Layer', zh: { zh: '编排层', en: 'Orchestration layer' }, d: { zh: '接住模型的调用请求、真正执行函数、并把结果送回模型上下文的那层代码。**执行权和安全边界都在这里**。', en: 'The code that catches the model\'s call request, actually executes the function and returns the result to context. **Execution and the safety boundary both live here.**' } },
    { en: 'Tool Definition / Schema', zh: { zh: '工具定义与参数模式', en: 'Tool definition / schema' }, d: { zh: '暴露给模型的函数名、用途描述和参数结构。模型判断该不该用、怎么用，**全部依据这份定义**，看不到函数体。', en: 'The name, purpose and parameter structure exposed to the model. It decides whether and how to call **entirely from this**, never seeing the body.' } },
    { en: '@tool decorator', zh: { zh: 'LangChain 的工具装饰器', en: '@tool decorator' }, d: { zh: 'LangChain 中把普通 Python 函数注册成模型可见工具的写法；ADK 则内置了 Google Search、Code Execution 等预置工具。', en: 'LangChain\'s way of registering a plain Python function as a model-visible tool; ADK ships prebuilt tools such as Google Search and Code Execution.' } }
  ],
  refs: [
    { kind: 'docs', title: 'OpenAI — Function Calling 指南', url: 'https://platform.openai.com/docs/guides/function-calling', note: { zh: '机制讲得最清楚的一份', en: 'the clearest explanation of the mechanism' } },
    { kind: 'docs', title: 'LangChain — Tools', url: 'https://python.langchain.com/docs/integrations/tools/' },
    { kind: 'docs', title: 'Google ADK — Tools', url: 'https://google.github.io/adk-docs/tools/', note: { zh: '含 Google Search、Code Execution 等预置工具', en: 'includes prebuilt Search and Code Execution tools' } },
    { kind: 'docs', title: 'CrewAI — Tools', url: 'https://docs.crewai.com/concepts/tools' }
  ],
  related: ['reflection', 'mcp', 'planning', 'knowledge-retrieval']
},

/* ---------------------------------------------------------- 6 */
{
  id: 'planning', num: 6, part: 1, core: true, icon: '🗺️',
  pages: '100–112',
  name: { zh: '规划', en: 'Planning' },
  keywords: 'planning plan decompose goal deep research 计划 拆解 目标',
  oneLiner: {
    zh: '你只说要什么，Agent 自己想出该做哪几步、按什么顺序做，而且中途能改。',
    en: 'You state the goal; the agent works out which steps in what order — and revises them as it learns.'
  },
  analogy: {
    icon: '🧳',
    title: { zh: '交给旅行社', en: 'Handing it to a travel agent' },
    body: {
      zh: '你说「帮我组织一次三十人的团建，预算十万，十月份」。你没说要先订场地还是先订车，那是他们的事。他们会自己排出步骤，而且发现原定酒店满房时会当场改方案。规划模式的关键不只是「能拆步骤」，更是**计划出来之后还能根据新情况调整**。',
      en: 'You say "organise an offsite for thirty people, £10k, October". You did not say whether the venue or the coach gets booked first — that is their job. They sequence it, and when the hotel turns out to be full they re-plan on the spot. The point is not just decomposition; it is that **the plan adapts as reality arrives**.'
    }
  },
  problem: {
    zh: '**路由**能选路，但路是你事先铺好的。碰上「写一份竞品分析报告」这种任务，需要哪些步骤、要查几家公司、按什么顺序展开，都没法提前写死——不同的目标需要完全不同的步骤序列。',
    en: 'Routing picks a path, but you laid the paths in advance. For "write a competitive analysis" nobody can hard-code which steps, how many companies, in what order — different goals need genuinely different sequences.'
  },
  solution: {
    zh: '让 Agent 自己先**生成计划**：把高层目标拆成一串有先后依赖的可执行子任务，然后逐个执行。**LLM** 恰好很擅长这件事，因为它见过海量「怎么做某事」的文本。更重要的是计划不是死的——执行中拿到新信息，Agent 可以回头修改剩下的步骤。',
    en: 'Let the agent **produce the plan**: decompose the high-level goal into ordered, executable sub-tasks with their dependencies, then work through them. **LLM**s are good at this, having read enormous amounts of how-to text. Crucially the plan is not fixed — new information mid-run lets the agent rewrite what remains.'
  },
  without: {
    zh: '你得自己把「做竞品分析」拆成十个步骤，一步步喂给模型。Agent 只是个执行工具，思考负担全在你身上。',
    en: 'You break "do a competitive analysis" into ten steps yourself and feed them in one at a time. The agent is a tool; the thinking is still your job.'
  },
  with: {
    zh: '你说一句目标，Agent 列出步骤、逐条执行、发现某家公司没有公开财报就自动改用新闻检索。Google 的 Deep Research 就是这么工作的。',
    en: 'You state the goal once; the agent lists the steps, works through them, and when one company files nothing public it switches to news search on its own. Google\'s Deep Research works exactly this way.'
  },
  whenToUse: [
    { zh: '目标复杂到无法用单个动作或单个工具完成', en: 'The goal is beyond any single action or tool' },
    { zh: '需要的步骤**取决于目标本身**，没法提前写死', en: 'Which steps are needed **depends on the goal** and cannot be hard-coded' },
    { zh: '执行过程中会不断出现新信息，需要据此调整后续动作', en: 'New information arrives mid-run and should change what happens next' },
    { zh: '深度研究、报告生成、多阶段流程自动化', en: 'Deep research, report generation, multi-stage automation' }
  ],
  whenNotToUse: [
    { zh: '流程本身是固定的——那直接写成**提示链**，又快又可控，不必让模型每次重新想一遍', en: 'The flow is genuinely fixed — write it as a chain: faster, cheaper and more predictable' },
    { zh: '容错要求极高的场景：自动生成的计划可能有你没预料到的步骤', en: 'Low tolerance for surprises: a generated plan may contain steps you never anticipated' },
    { zh: '任务一两步就能完成，规划开销比执行还大', en: 'The task is one or two steps and planning costs more than doing' }
  ],
  deepDive: [
    { t: { zh: 'Plan-and-Execute 与 ReAct 是两种不同的哲学', en: 'Plan-and-Execute versus ReAct: two philosophies' },
      d: { zh: '**Plan-and-Execute** 先一次性生成完整计划再逐步执行：全局视角好、token 效率高（不用每步都重新推理全局）、执行路径可审查，但对中途变化反应慢。**ReAct** 每一步都重新决定下一步：适应性极强，但没有全局视角，容易在局部打转、也更费 token。实践中常用**混合**：先出粗粒度计划，每个步骤内部用 ReAct 循环处理细节。',
        en: '**Plan-and-Execute** produces a full plan up front then works through it: good global view, token-efficient (no re-deriving the whole picture each step), auditable path — but slow to react mid-run. **ReAct** re-decides at every step: highly adaptive, but with no global view it can loop locally and costs more tokens. In practice a **hybrid** is common: a coarse plan up front, with a ReAct loop handling detail inside each step.' } },
    { t: { zh: '计划必须是可解析的数据结构', en: 'A plan must be a parseable data structure' },
      d: { zh: '让模型输出一段散文式的计划，你就没法程序化地跟踪进度、检测依赖或判断某一步是否完成。生产做法是要求它输出**带 id、描述、依赖关系和成功标准的结构化步骤列表**。有了这个结构，才能做进度跟踪、失败重试、以及在重规划时精确替换某几步而不是整个重来。',
        en: 'A prose plan cannot be tracked, dependency-checked or marked complete programmatically. In production require a **structured list of steps with ids, descriptions, dependencies and success criteria**. Only with that structure can you track progress, retry individual steps, and on re-planning replace specific steps rather than starting over.' } },
    { t: { zh: '重规划的触发条件要显式定义', en: 'Define explicit re-planning triggers' },
      d: { zh: '「遇到变化就改计划」听起来自然，但什么算变化？每步都问模型「要不要重规划」既贵又容易反复横跳。实用做法是定义**明确的触发条件**：某步执行失败、某步的成功标准未达成、发现了计划制定时不知道的新约束、或已执行步数超过预算。没有触发条件的重规划机制，往往要么永不触发，要么无限重规划。',
        en: '"Re-plan when things change" sounds natural, but what counts as change? Asking the model at every step is expensive and invites oscillation. Define **explicit triggers**: a step failed, a step\'s success criterion was not met, a constraint unknown at planning time emerged, or the step budget was exceeded. Without triggers, re-planning either never fires or never stops.' } },
    { t: { zh: '自动生成的计划是可预测性的代价', en: 'Generated plans cost you predictability' },
      d: { zh: '这是选型时最该权衡的一点。写死的**提示链**每次执行路径完全一样，可测试、可复现、出错好查。规划模式每次可能生成不同的步骤序列——灵活性的代价是你**无法提前知道它会做什么**。所以高风险场景要么别用规划，要么在执行前加一道人工或规则审查（这就接到了**人在回路**）。',
        en: 'This is the trade-off to weigh when choosing. A hard-coded chain runs the same path every time: testable, reproducible, debuggable. Planning may produce a different sequence each run, and the price of that flexibility is that **you cannot know in advance what it will do**. So high-stakes settings either avoid planning or gate the plan behind human or rule-based review — which is where human-in-the-loop comes in.' } },
    { t: { zh: 'Deep Research 是这个模式的完整范例', en: 'Deep Research is the pattern in full' },
      d: { zh: '书里反复用 Google Deep Research 举例，因为它把规划的每个要素都用上了：先生成研究提纲（计划），逐项搜索（执行），根据搜到的内容发现原提纲的盲区（监控），然后**修改剩余的研究方向**（重规划），最后综合成文。想直观理解这个模式，去用一次 Deep Research 并观察它展示的执行过程，比读十页文字管用。',
        en: 'The book returns to Google Deep Research because it exercises every element: draft a research outline (plan), search item by item (execute), notice gaps the outline missed (monitor), **revise the remaining directions** (re-plan), and synthesise. To grasp the pattern viscerally, run one Deep Research query and watch the trace it exposes — worth more than ten pages of prose.' } }
  ],
  diagram: {
    w: 760, h: 300,
    nodes: [
      { id: 'goal',    kind: 'actor', x: 80,  y: 78,  label: { zh: '高层目标', en: 'High-level goal' }, sub: { zh: '组织团建', en: 'plan an offsite' } },
      { id: 'planner', kind: 'plan',  x: 262, y: 78,  label: { zh: '规划器', en: 'Planner' }, sub: { zh: '拆解目标', en: 'decompose' } },
      { id: 'plan',    kind: 'prompt', x: 460, y: 78, label: { zh: '步骤清单', en: 'Step list' }, sub: { zh: '1定预算 2选址…', en: '1 budget 2 venue…' } },
      { id: 'exec',    kind: 'agent', x: 460, y: 218, label: { zh: '逐步执行', en: 'Execute in order' } },
      { id: 'adapt',   kind: 'check', x: 655, y: 218, label: { zh: '情况有变', en: 'Reality intrudes' }, sub: { zh: '酒店满房', en: 'hotel full' } }
    ],
    edges: [
      { from: 'goal', to: 'planner' },
      { from: 'planner', to: 'plan' },
      { from: 'plan', to: 'exec' },
      { from: 'exec', to: 'adapt' },
      { from: 'adapt', to: 'planner', label: { zh: '重新规划', en: 're-plan' }, bend: 70 }
    ],
    steps: [
      { edge: 'goal->planner', say: { zh: '你只给出「想要什么」——目标和约束，不给「怎么做」。这正是规划模式的分工。', en: 'You supply only the what — goal and constraints — never the how. That division of labour is the pattern.' } },
      { edge: 'planner->plan', say: { zh: '规划器把目标拆成一串有先后依赖的子任务。LLM 擅长这个，因为训练数据里有海量「如何做某事」的文本。', en: 'The planner decomposes the goal into ordered sub-tasks with dependencies — something LLMs do well, having read vast amounts of how-to text.' } },
      { edge: 'plan->exec', say: { zh: 'Agent 按计划逐条执行，每一步可能会用到工具、检索或子 Agent。', en: 'The agent works through the list, each step possibly using tools, retrieval or sub-agents.' } },
      { edge: 'exec->adapt', say: { zh: '执行到一半，现实来了：原定酒店满房了。固定流程到这里就卡住了。', en: 'Halfway through, reality arrives: the hotel is full. A fixed pipeline would simply stall here.' } },
      { edge: 'adapt->planner', say: { zh: '关键在这一步——Agent 带着新信息回去修改剩下的计划，而不是硬着头皮往下走。计划是起点，不是剧本。', en: 'Here is the crux: the agent takes the new information back and revises the remaining plan rather than ploughing on. A plan is a starting point, not a script.' } }
    ]
  },
  code: [
    '# 第一步：让模型先产出计划，而不是直接动手',
    'plan = llm("为了完成【" + goal + "】，列出需要的步骤，用编号列表返回")',
    '',
    'results = []',
    'for step in parse_steps(plan):',
    '    r = agent.run(step, context=results)   # 带着已完成步骤的结果往下走',
    '    results.append(r)',
    '',
    '    if needs_replan(r):                    # 情况有变就回去改剩下的计划',
    '        plan = llm("原计划遇到：" + r + "，请修改剩余步骤：" + plan)',
    '',
    'return synthesize(results)'
  ],
  useCases: [
    { zh: '**深度研究**：Google Deep Research 先列出研究提纲，再逐项搜索、边搜边调整方向。', en: '**Deep research**: Google Deep Research drafts an outline, then searches item by item, adjusting as it goes.' },
    { zh: '**员工入职自动化**：开账号 → 配权限 → 排培训 → 约见面，步骤随岗位不同而不同。', en: '**Onboarding**: accounts, permissions, training, intro meetings — the steps differ by role.' },
    { zh: '**竞品分析报告**：确定对手名单 → 分别调研 → 对比维度 → 汇总成文。', en: '**Competitive analysis**: pick the competitors, research each, choose comparison axes, write it up.' }
  ],
  quiz: [
    {
      q: { zh: '规划模式与提示链最关键的区别在于？', en: 'What most distinguishes planning from prompt chaining?' },
      options: [
        { zh: '规划一定要用更贵的模型', en: 'Planning requires a more expensive model' },
        { zh: '提示链的步骤由开发者事先写死；规划的步骤由 Agent 当场生成，还能中途改', en: 'A chain\'s steps are fixed by the developer; a plan is generated at run time and can be revised' },
        { zh: '规划不需要调用工具', en: 'Planning needs no tools' },
        { zh: '提示链不能处理复杂任务', en: 'Chains cannot handle complex tasks' }
      ],
      answer: 1,
      why: {
        zh: '「谁来决定步骤」是分水岭。提示链是你铺好的轨道，Agent 只管跑；规划则是 Agent 自己画地图。也正因为如此，规划更灵活但也更不可预测。',
        en: 'Who decides the steps is the dividing line. A chain is track you laid; the agent just runs it. Planning has the agent draw the map — more flexible, and correspondingly less predictable.'
      }
    },
    {
      q: { zh: '书里说「初始计划只是起点，不是死板的剧本」，强调的是什么能力？', en: 'The book calls an initial plan "a starting point, not a rigid script". Which capability does that stress?' },
      options: [
        { zh: '生成计划的速度', en: 'How fast the plan is generated' },
        { zh: '计划的详细程度', en: 'How detailed the plan is' },
        { zh: '根据执行中的新信息调整后续步骤的适应能力', en: 'Adapting later steps to information found while executing' },
        { zh: '同时执行多个计划的能力', en: 'Running several plans at once' }
      ],
      answer: 2,
      why: {
        zh: '适应性才是规划模式的灵魂。只会一次性拆步骤、然后闷头执行的系统，碰到意外就崩了。真正有用的规划 Agent 会拿着新信息回头改计划。',
        en: 'Adaptability is the soul of the pattern. A system that decomposes once and then ploughs ahead breaks on the first surprise. A useful planner takes new information back and rewrites what is left.'
      }
    },
    {
      q: { zh: '什么时候**不该**用规划模式？', en: 'When should you **not** reach for planning?' },
      options: [
        { zh: '流程完全固定、每次都一样的场景', en: 'The flow is completely fixed and identical every time' },
        { zh: '需要写一份深度研究报告', en: 'You need a deep research report' },
        { zh: '任务涉及多个相互依赖的阶段', en: 'The task spans several interdependent stages' },
        { zh: '执行中经常出现意外情况', en: 'Surprises come up mid-run' }
      ],
      answer: 0,
      why: {
        zh: '流程固定就直接写成提示链：更快、更便宜、更可预测，出错也好查。让模型每次重新想一遍已经确定的流程，是花钱买不确定性。',
        en: 'If the flow is fixed, write a chain: faster, cheaper, predictable and easier to debug. Having the model re-derive a known sequence every run is paying money for uncertainty.'
      }
    }
  ],
  terms: [
    { en: 'Task Decomposition', zh: { zh: '任务分解', en: 'Task decomposition' }, d: { zh: '把高层目标拆成一串更小的、可执行的子任务或子目标——规划模式的核心动作。', en: 'Breaking a high-level objective into smaller executable sub-tasks or sub-goals — the pattern\'s core action.' } },
    { en: 'Initial State / Goal State', zh: { zh: '初始状态 / 目标状态', en: 'Initial and goal state' }, d: { zh: '原书描述规划的框架：Agent 先理解当前状态（预算、人数、日期）和目标状态，再找出连接两者的动作序列。', en: 'The book\'s framing: the agent first understands the current state (budget, headcount, dates) and the goal state, then finds a sequence of actions connecting them.' } },
    { en: 'Adaptability / Re-planning', zh: { zh: '适应性与重规划', en: 'Adaptability / re-planning' }, d: { zh: '原书强调的核心特质：初始计划只是起点而非死板剧本，Agent 应能吸收新信息并修改剩余步骤。', en: 'The trait the book stresses: an initial plan is a starting point, not a rigid script, and the agent should absorb new information and revise what remains.' } },
    { en: 'Plan-and-Execute', zh: { zh: '先规划后执行', en: 'Plan-and-execute' }, d: { zh: '与 ReAct 相对的一种 Agent 架构：先生成完整计划再逐步执行，全局视角更好、token 更省，但对中途变化反应更慢。', en: 'An architecture contrasting with ReAct: produce a full plan then work through it — better global view and fewer tokens, slower to react mid-run.' } }
  ],
  refs: [
    { kind: 'docs', title: 'Google Deep Research (Gemini)', url: 'https://gemini.google.com', note: { zh: '书中反复引用的完整范例，建议实际跑一次看它的执行过程', en: 'the book\'s recurring example — worth running once to watch its trace' } },
    { kind: 'docs', title: 'OpenAI — Introducing deep research', url: 'https://openai.com/index/introducing-deep-research/' },
    { kind: 'docs', title: 'Perplexity — Introducing Perplexity Deep Research', url: 'https://www.perplexity.ai/hub/blog/introducing-perplexity-deep-research' }
  ],
  related: ['prompt-chaining', 'multi-agent', 'goal-setting', 'tool-use']
},

/* ---------------------------------------------------------- 7 */
{
  id: 'multi-agent', num: 7, part: 1, core: true, icon: '👥',
  pages: '113–131',
  name: { zh: '多智能体协作', en: 'Multi-Agent Collaboration' },
  keywords: 'multi agent crew team collaboration 协作 分工 团队',
  oneLiner: {
    zh: '与其把一个 Agent 训练成全才，不如组一支各有专长的小队，让它们分工协作。',
    en: 'Rather than making one agent do everything, assemble a small team of specialists and let them collaborate.'
  },
  analogy: {
    icon: '🎬',
    title: { zh: '一个剧组', en: 'A film crew' },
    body: {
      zh: '拍电影不会找一个人身兼编剧、摄影、剪辑、配乐。导演统筹，各工种各司其职，前一环的成果交给下一环。多 Agent 协作就是给 AI 组一个剧组：每个 Agent 有自己的角色设定、自己的工具、自己那一段职责，靠明确的交接协作。',
      en: 'Nobody films a movie with one person writing, shooting, editing and scoring. A director coordinates; each craft does its own job and hands the result onward. Multi-agent collaboration is that crew for AI: each agent has a role, its own tools, its own slice, and defined handoffs.'
    }
  },
  problem: {
    zh: '把研究、分析、写作、审校全塞进一个 Agent，它的系统提示会变成一份又长又矛盾的说明书。要它同时是严谨的分析师和文采飞扬的写手，结果往往是两头都不出彩。单个 Agent 也很难同时挂载几十个不同领域的工具。',
    en: 'Cram research, analysis, writing and review into one agent and its system prompt becomes a long, self-contradicting manual. Asking it to be both a rigorous analyst and a lively writer usually yields neither. One agent also struggles to carry dozens of tools from unrelated domains.'
  },
  solution: {
    zh: '把复杂问题拆给多个**专门化**的 Agent，每个只负责一块、只带自己需要的工具、只遵守自己那份简短清晰的角色设定。它们通过约定的协作方式配合：顺序交接、并行分工、层级委派，或者互相辩论。整体能力超过任何单个 Agent。',
    en: 'Split the problem across **specialised** agents: each owns one slice, carries only its own tools, and follows one short, coherent role prompt. They cooperate through defined models — sequential handoff, parallel workstreams, hierarchical delegation, or debate. The group achieves what none of them could alone.'
  },
  without: {
    zh: '一个 Agent 挂着 30 个工具、一份 2000 字的系统提示，什么都想干，结果经常挑错工具、忘记某条要求。',
    en: 'One agent with 30 tools and a 2,000-word system prompt, trying to do everything, regularly picking the wrong tool and forgetting requirements.'
  },
  with: {
    zh: '研究员只管查资料（只有搜索工具），分析师只管算数（只有数据工具），写手只管成文。每个 Agent 的提示都短而清晰，各自表现都更好。',
    en: 'The researcher only searches (search tools only), the analyst only computes (data tools only), the writer only writes. Every prompt is short and coherent, and each agent performs better for it.'
  },
  whenToUse: [
    { zh: '任务需要**明显不同的专长**（研究 vs 写作 vs 审校）', en: 'The task needs **genuinely different expertise** — research vs writing vs review' },
    { zh: '需要的工具太多太杂，一个 Agent 挂不下也挑不准', en: 'The tool set is too large and varied for one agent to choose well from' },
    { zh: '流程有清晰的多个阶段，每阶段产出可以交接给下一阶段', en: 'There are clear stages whose outputs hand off cleanly' },
    { zh: '想让不同视角互相制衡（比如一个提方案、一个专门找漏洞）', en: 'You want perspectives to check each other — one proposes, one hunts for holes' }
  ],
  whenNotToUse: [
    { zh: '一个 Agent 配几个工具就能干完——多 Agent 的协调开销远比想象的大', en: 'One agent with a few tools would do — coordination overhead is larger than it looks' },
    { zh: '任务拆不出清晰边界，Agent 之间会反复来回扯皮，token 烧得飞快', en: 'The boundaries are not clean, so agents ping-pong and burn tokens' },
    { zh: '对延迟敏感：每次交接都是一次完整的模型调用', en: 'Latency-sensitive work: every handoff is another full model call' },
    { zh: '调试困难：出了问题要在多个 Agent 的对话记录里找根因', en: 'Debugging pain: root-causing means reading several agents\' transcripts' }
  ],
  deepDive: [
    { t: { zh: '上下文隔离既是最大优势也是最大成本', en: 'Context isolation is both the biggest win and the biggest cost' },
      d: { zh: '每个 Agent 只看自己那部分上下文，所以提示短、注意力集中、工具选择准——这是多 Agent 有效的根本原因。但代价是**信息在交接处必然丢失**：研究员知道某个数据来源不太可靠，这个判断如果没写进交接内容，分析师就无从得知。实践中大量的多 Agent 失败都源于交接信息不足，而不是单个 Agent 能力不够。',
        en: 'Each agent sees only its slice, so prompts stay short, attention stays focused and tool choice stays accurate — the root reason the pattern works. The cost is that **information is necessarily lost at handoffs**: the researcher knows one source is shaky, and unless that judgement is written into the handoff the analyst never learns it. A large share of multi-agent failures trace to thin handoffs rather than weak agents.' } },
    { t: { zh: '四种协作拓扑各自适合什么', en: 'What each of the four topologies is for' },
      d: { zh: '**顺序交接**：阶段界限清晰、上游产出即下游输入（研究→分析→写作），最好理解也最好调试。**并行分工**：子任务独立，最后汇总，省时间。**层级委派**：协调者动态分派并可以递归下去，适合任务分解程度未知的情况。**辩论**：多个 Agent 对同一问题给出对立观点，第三方裁决——用于减少单一视角偏见，但成本最高。选拓扑要看**任务的依赖结构**，不是看哪个听起来先进。',
        en: '**Sequential handoff**: clean stage boundaries where each output feeds the next (research → analysis → writing) — easiest to reason about and debug. **Parallel workstreams**: independent sub-tasks joined at the end, saving time. **Hierarchical delegation**: a coordinator dispatches and can recurse, suiting tasks whose decomposition is not known up front. **Debate**: agents argue opposing positions and a third adjudicates, reducing single-perspective bias at the highest cost. Pick by the **task\'s dependency structure**, not by which sounds most advanced.' } },
    { t: { zh: '终止条件是必须显式设计的', en: 'Termination conditions must be designed in' },
      d: { zh: '层级委派和辩论都可能不收敛：Agent A 委派给 B，B 觉得需要更多信息又委派回 A；两个辩论者可以无限来回。必须显式设置**最大委派深度、最大轮数、总 token 预算**三道闸，任何一道触发就强制收敛或上报。这是多 Agent 系统最常见的线上事故来源之一。',
        en: 'Hierarchical delegation and debate can both fail to converge: A delegates to B, B wants more information and delegates back; two debaters can trade turns indefinitely. Set three explicit ceilings — **maximum delegation depth, maximum rounds, total token budget** — and force convergence or escalation when any trips. This is among the most common production incidents in multi-agent systems.' } },
    { t: { zh: '先问「一个 Agent 加几个工具行不行」', en: 'Always ask whether one agent with a few tools would do' },
      d: { zh: '多 Agent 的协调开销是实打实的：每次交接一次完整调用，延迟和费用线性叠加，调试要跨多份对话记录找根因。**很多被写成多 Agent 的系统，本质上一个带三四个工具的 Agent 就能干完**。判断依据是：这些「角色」是否真的需要**不同的系统提示和不同的工具集**？如果它们的提示写出来大同小异，那就不该拆。',
        en: 'Coordination overhead is real: every handoff is a full call, latency and cost stack linearly, and debugging spans several transcripts. **Plenty of systems written as multi-agent would be handled by one agent with three or four tools.** The test: do these roles genuinely need **different system prompts and different tool sets**? If the prompts come out nearly identical, do not split them.' } },
    { t: { zh: '框架里的对应物', en: 'What this maps to in frameworks' },
      d: { zh: '**CrewAI** 用 role/goal/backstory 定义 Agent，用 Process（sequential / hierarchical）定义协作方式，抽象最贴近「团队」的心智模型。**ADK** 用 SequentialAgent、ParallelAgent、LoopAgent 组合，并支持 LLM 驱动的 sub-agent 委派。**LangGraph** 把每个 Agent 当成图上的节点、共享一份 **State**，最灵活但也要你自己设计交接协议。',
        en: '**CrewAI** defines agents by role/goal/backstory and collaboration by Process (sequential or hierarchical), the abstraction closest to a team mental model. **ADK** composes SequentialAgent, ParallelAgent and LoopAgent, and supports LLM-driven sub-agent delegation. **LangGraph** treats each agent as a node over a shared **State** — the most flexible, and the one where you design the handoff protocol yourself.' } }
  ],
  diagram: {
    w: 760, h: 320,
    nodes: [
      { id: 'user', kind: 'actor',  x: 78,  y: 160, label: { zh: '复杂目标', en: 'Complex goal' }, sub: { zh: '写行业报告', en: 'industry report' } },
      { id: 'lead', kind: 'agent',  x: 245, y: 160, label: { zh: '协调者', en: 'Coordinator' }, sub: { zh: '拆分与分派', en: 'splits & assigns' } },
      { id: 'a1',   kind: 'agent',  x: 448, y: 52,  label: { zh: '研究员', en: 'Researcher' }, sub: { zh: '只带搜索工具', en: 'search tools' } },
      { id: 'a2',   kind: 'agent',  x: 448, y: 160, label: { zh: '分析师', en: 'Analyst' }, sub: { zh: '只带数据工具', en: 'data tools' } },
      { id: 'a3',   kind: 'agent',  x: 448, y: 268, label: { zh: '写手', en: 'Writer' }, sub: { zh: '只管成文', en: 'drafts prose' } },
      { id: 'out',  kind: 'output', x: 655, y: 268, label: { zh: '最终报告', en: 'Final report' } }
    ],
    edges: [
      { from: 'user', to: 'lead' },
      { from: 'lead', to: 'a1' }, { from: 'lead', to: 'a2' }, { from: 'lead', to: 'a3' },
      { from: 'a1', to: 'a2', label: { zh: '交接资料', en: 'hands over' }, dash: true },
      { from: 'a2', to: 'a3', label: { zh: '交接结论', en: 'hands over' }, dash: true },
      { from: 'a3', to: 'out' }
    ],
    steps: [
      { edge: 'user->lead', say: { zh: '一个需要多种专长的目标：既要查资料，又要算数据，还要写得好看。单个 Agent 三样都做，样样都平庸。', en: 'A goal needing several kinds of expertise — research, computation and good prose. One agent doing all three does all three adequately at best.' } },
      { edges: ['lead->a1', 'lead->a2', 'lead->a3'], say: { zh: '协调者把目标拆开，分派给三个专门的 Agent。注意每个 Agent 的 sub 标注——它们各自只带自己需要的工具，提示词因此又短又清晰。', en: 'The coordinator splits the goal across three specialists. Note each one\'s tools: they carry only what they need, which keeps every prompt short and coherent.' } },
      { edges: ['a1->a2', 'a2->a3'], say: { zh: '它们之间还会**互相交接**：研究员查到的资料交给分析师，分析结论再交给写手。这就是「顺序交接」式协作。', en: 'They also **hand off to each other**: research goes to the analyst, conclusions go to the writer. This is the sequential-handoff model of collaboration.' } },
      { edge: 'a3->out', say: { zh: '最后由写手产出成品。除了顺序交接，书里还提到并行分工、层级委派和互相辩论几种协作方式。', en: 'The writer produces the deliverable. Besides sequential handoff, the book also covers parallel workstreams, hierarchical delegation and debate.' } }
    ]
  },
  code: [
    '# 每个 Agent 只有一个角色、一套工具——提示才写得短而清晰',
    'researcher = Agent(role="行业研究员", tools=[search])',
    'analyst    = Agent(role="数据分析师", tools=[calculator, sql])',
    'writer     = Agent(role="报告撰稿人", tools=[])',
    '',
    '# 顺序交接：上一个 Agent 的产出是下一个的输入',
    'crew = Crew(',
    '    agents=[researcher, analyst, writer],',
    '    process="sequential",',
    ')',
    'crew.kickoff("写一份 2026 年电动车市场报告")'
  ],
  useCases: [
    { zh: '**软件开发流水线**：产品经理写需求 → 工程师写代码 → 测试 Agent 跑用例 → 审查 Agent 提意见。', en: '**Software pipelines**: a PM agent writes requirements, an engineer codes, a tester runs cases, a reviewer comments.' },
    { zh: '**研究报告**：研究员搜集、分析师建模、写手成文、审校把关。', en: '**Research reports**: researcher gathers, analyst models, writer drafts, reviewer checks.' },
    { zh: '**辩论式决策**：让两个 Agent 分别为正反方论证，第三个 Agent 综合判断，减少一边倒的偏见。', en: '**Debate**: two agents argue opposing sides and a third judges, reducing one-sided bias.' }
  ],
  quiz: [
    {
      q: { zh: '多 Agent 协作最主要的好处是什么？', en: 'What is the main benefit of multi-agent collaboration?' },
      options: [
        { zh: '总是比单 Agent 更快', en: 'It is always faster than one agent' },
        { zh: '每个 Agent 可以专注一个窄领域，带自己的工具和简短清晰的角色提示', en: 'Each agent focuses on one narrow area with its own tools and a short, coherent role prompt' },
        { zh: '可以完全避免出错', en: 'It eliminates mistakes' },
        { zh: '不再需要人类参与', en: 'It removes the need for humans' }
      ],
      answer: 1,
      why: {
        zh: '好处来自**专门化**，不是数量。角色窄了，提示就能写得具体，工具集也小，模型选错工具、漏掉要求的概率都下降。至于速度，多 Agent 往往更慢，因为每次交接都是一次调用。',
        en: 'The gain comes from **specialisation**, not headcount. Narrow roles allow specific prompts and small tool sets, so wrong-tool and dropped-requirement errors fall. Speed usually gets worse — every handoff is another call.'
      }
    },
    {
      q: { zh: '书里提到的协作方式**不包括**下面哪一种？', en: 'Which collaboration model does the book **not** list?' },
      options: [
        { zh: '顺序交接（一个做完交给下一个）', en: 'Sequential handoff' },
        { zh: '并行分工（同时做不同部分）', en: 'Parallel workstreams' },
        { zh: '层级委派（主 Agent 分派给子 Agent）', en: 'Hierarchical delegation' },
        { zh: '随机指派（每次随机挑一个 Agent 干活）', en: 'Random assignment' }
      ],
      answer: 3,
      why: {
        zh: '顺序、并行、层级、辩论都是书里讲的成熟协作模型，它们的共同点是**结构化**。随机指派恰恰丢掉了多 Agent 的全部价值——专门化。',
        en: 'Sequential, parallel, hierarchical and debate are all covered, and all are **structured**. Random assignment throws away the entire point of the pattern: specialisation.'
      }
    },
    {
      q: { zh: '什么时候用多 Agent 反而是过度设计？', en: 'When is multi-agent over-engineering?' },
      options: [
        { zh: '任务需要法务、技术、市场三种完全不同的专业判断', en: 'The task needs legal, technical and market judgement' },
        { zh: '一个 Agent 配上两三个工具就能利落完成', en: 'One agent with two or three tools would handle it cleanly' },
        { zh: '流程有清晰的四个阶段，每阶段产出可以交接', en: 'There are four clean stages with clean handoffs' },
        { zh: '需要一个 Agent 专门挑另一个 Agent 的毛病', en: 'You want one agent to critique another' }
      ],
      answer: 1,
      why: {
        zh: '多 Agent 的协调开销是真金白银：每次交接一次调用，一次调用一份延迟和费用，还多一处可能出错的接缝。能一个 Agent 干完的事，就别开会。',
        en: 'Coordination is not free: each handoff is a call, each call is latency and money, and each seam is somewhere to fail. If one agent can do it, do not convene a committee.'
      }
    }
  ],
  terms: [
    { en: 'Sequential Handoff', zh: { zh: '顺序交接', en: 'Sequential handoff' }, d: { zh: '原书列出的协作模型之一：上一个 Agent 的产出直接作为下一个的输入，阶段界限清晰，最好调试。', en: 'One of the book\'s collaboration models: each agent\'s output feeds the next, with clean stage boundaries and the easiest debugging.' } },
    { en: 'Hierarchical Delegation', zh: { zh: '层级委派', en: 'Hierarchical delegation' }, d: { zh: '协调者 Agent 动态把子任务分派给专门 Agent，并可递归下去。适合分解程度事先未知的任务。', en: 'A coordinator dynamically dispatches sub-tasks to specialists and can recurse — for tasks whose decomposition is not known up front.' } },
    { en: 'Specialized Roles', zh: { zh: '专门化角色', en: 'Specialised roles' }, d: { zh: '多 Agent 收益的真正来源：每个 Agent 只带自己需要的工具、只遵守一份简短清晰的角色提示，而不是数量本身。', en: 'The actual source of the pattern\'s gain — each agent carries only its own tools and one short coherent role prompt. Not headcount.' } },
    { en: 'Crew / Process', zh: { zh: 'CrewAI 的团队与流程', en: 'Crew / Process' }, d: { zh: 'CrewAI 的两个核心抽象：Crew 是一组按 role/goal/backstory 定义的 Agent，Process 定义它们顺序执行还是层级委派。', en: 'CrewAI\'s two core abstractions: a Crew of agents defined by role, goal and backstory, and a Process saying whether they run sequentially or delegate hierarchically.' } }
  ],
  refs: [
    { kind: 'paper', title: 'Multi-Agent Collaboration Mechanisms: A Survey of LLMs', url: 'https://arxiv.org/abs/2501.06322', note: { zh: '想系统了解协作机制先读这篇综述', en: 'the survey to start from for collaboration mechanisms' } },
    { kind: 'docs', title: 'CrewAI — 官方文档', url: 'https://docs.crewai.com/', note: { zh: '抽象最贴近「团队」心智模型', en: 'the abstraction closest to a team mental model' } },
    { kind: 'docs', title: 'Google ADK — Multi-Agent Systems', url: 'https://google.github.io/adk-docs/agents/multi-agents/' }
  ],
  related: ['routing', 'parallelization', 'planning', 'inter-agent-communication']
}

);
