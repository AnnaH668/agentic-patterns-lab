/* ============================================================
   Part Five — 附录 A / Advanced Prompting Techniques
   原书 Appendix A，全书术语密度最高的一块。
   ============================================================ */
window.PATTERNS.push(

{
  id: 'advanced-prompting', num: 22, part: 5, kind: 'appendix', core: false, icon: '✍️',
  pages: '365–392', chapter: 'Appendix A — Advanced Prompting Techniques',
  label: { zh: '附录 A · 所有模式的地基', en: 'Appendix A · the base layer' },
  name: { zh: '进阶提示技术', en: 'Advanced Prompting Techniques' },
  keywords: 'prompting zero shot few shot system role step-back self-consistency cot 提示 少样本 角色',
  oneLiner: {
    zh: '前面 21 个模式决定 Agent 的**架构**，提示技术决定每一次模型调用的**质量**——架构再好，单次调用不行，整体照样不行。',
    en: 'The 21 patterns decide an agent\'s **architecture**; prompting decides the **quality of each call**. A good architecture on bad calls is still bad.'
  },
  analogy: {
    icon: '🎼',
    title: { zh: '编曲与演奏', en: 'Arrangement and performance' },
    body: {
      zh: '设计模式像编曲——决定几个声部、谁先谁后、怎么呼应。提示技术像演奏——同一份谱子，演奏水平决定它听起来是什么样。**两者不可互相替代**：编曲再精妙，演奏走音照样难听；演奏再好，编排混乱也撑不起一首曲子。这也是为什么这一章虽然放在附录，实际上是前面所有模式的地基。',
      en: 'Design patterns are arrangement — how many parts, in what order, answering each other. Prompting is performance — the same score sounds entirely different depending on who plays it. **Neither substitutes for the other**: a brilliant arrangement played out of tune still sounds bad, and flawless playing cannot rescue a shapeless piece. Which is why this appendix is really the base layer under every pattern.'
    }
  },
  problem: {
    zh: '很多人把提示词当成「随便怎么写，模型都能懂」。实际上写得含糊的提示会直接导致歧义、跑题和错误输出，而这些问题在 Agent 系统里会被**逐级放大**——一条链上每一步都是一次提示，第一步的模糊会一路传下去。',
    en: 'People treat prompts as if any phrasing will do. In practice a vague prompt produces ambiguity, drift and outright errors — and in an agent system those get **amplified stage by stage**, since every link in a chain is another prompt and early vagueness propagates.'
  },
  solution: {
    zh: '把提示当成一门有具体技术的工程学科。原书系统列出了一整套方法：从最基本的 **Zero-Shot / One-Shot / Few-Shot**，到用 **System / Role / Contextual Prompting** 设定行为边界，再到 **Chain-of-Thought**、**Self-Consistency**、**Step-Back Prompting** 这类专门提升推理质量的技术。它们可以组合使用，而且大多数**只需要改提示词，不需要改架构**——这是性价比最高的一类优化。',
    en: 'Treat prompting as an engineering discipline with concrete techniques. The book lays out a full set: from basic **zero-shot / one-shot / few-shot**, through **system / role / contextual prompting** for setting behavioural boundaries, up to **chain-of-thought**, **self-consistency** and **step-back prompting** for reasoning quality. They compose, and most of them **change only the prompt, not the architecture** — the best return on effort available.'
  },
  without: {
    zh: '「帮我分析这份数据」——模型不知道你要什么粒度、给谁看、输出成什么格式，于是给你一段四平八稳、什么都说了又什么都没说的文字。',
    en: '"Analyse this data" — the model has no idea at what depth, for whom, or in what format, so it returns something even-handed that says everything and nothing.'
  },
  with: {
    zh: '给它角色（资深财务分析师）、受众（董事会）、格式（三条结论各配一个数据点）、外加两个示例，输出立刻变得可用。**同一个模型，差别全在提示。**',
    en: 'Give it a role (senior financial analyst), an audience (the board), a format (three conclusions each with one supporting figure) and two examples, and the output becomes usable immediately. **Same model — the difference is entirely the prompt.**'
  },
  whenToUse: [
    { zh: '**任何时候**——这是所有模式的地基，不是可选项', en: '**Always** — this is the base layer, not an option' },
    { zh: '输出不稳定、时好时坏时，先查提示，别急着换模型', en: 'When output is inconsistent, look at the prompt before switching models' },
    { zh: '需要固定输出格式给下游程序解析时', en: 'When a downstream program must parse a fixed output shape' },
    { zh: '任务需要多步推理时，用 CoT 类技术', en: 'When the task needs multi-step reasoning — reach for the CoT family' }
  ],
  whenNotToUse: [
    { zh: '**提示解决不了知识缺失**：模型不知道你公司的政策，写再好的提示也没用，那是 RAG 的活', en: '**Prompting cannot supply missing knowledge**: no phrasing tells the model your company policy — that is RAG\'s job' },
    { zh: '**提示解决不了安全问题**：「请不要越权」是可以被绕过的建议，硬约束必须在代码层', en: '**Prompting cannot provide security**: "do not exceed your authority" is a suggestion that can be argued around; hard limits belong in code' },
    { zh: '需要稳定改变模型语气和领域习惯时，微调可能比越写越长的提示更划算', en: 'When you need a durable change in tone or domain idiom, fine-tuning can beat an ever-growing prompt' }
  ],
  deepDive: [
    { t: { zh: 'Zero-Shot / One-Shot / Few-Shot：给几个例子的差别', en: 'Zero-, one- and few-shot: how many examples' },
      d: { zh: '在提示里给模型 0 个、1 个、或几个任务示例。**给的示例越多，模型越能领会你到底想要什么**，尤其是格式和风格这类难以用语言描述清楚的要求。实践要点：Few-Shot 的示例要**覆盖边界情况**而不只是典型情况，否则模型只学会了处理简单输入；示例的格式必须**完全一致**，任何不一致模型都会当成有意义的信号去模仿。',
        en: 'Zero, one or several worked examples inside the prompt. **More examples convey intent better**, especially for format and style, which are hard to describe in words. In practice: few-shot examples should **cover edge cases**, not just typical ones, or the model only learns the easy path — and their formatting must be **perfectly consistent**, since any variation reads as a meaningful signal to imitate.' } },
    { t: { zh: 'System / Role / Contextual Prompting：三种设定边界的方式', en: 'System, role and contextual prompting' },
      d: { zh: '这三者常被混用，但作用不同。**System Prompting** 设定整体任务和输出要求（「你只返回 JSON」）；**Role Prompting** 给模型一个身份，从而改变它的语气、用词和关注点（「你是一位资深审计师」）；**Contextual Prompting** 提供当前任务特有的背景信息。在 Agent 里三者往往同时用：system 定规则、role 定风格、context 由检索或上一步动态填入。',
        en: 'Often conflated, but distinct. **System prompting** sets the overall task and output requirements ("return only JSON"). **Role prompting** assigns an identity, shifting tone, vocabulary and what the model attends to ("you are a senior auditor"). **Contextual prompting** supplies background specific to this task. Agents typically use all three: system for rules, role for voice, context filled dynamically by retrieval or the previous step.' } },
    { t: { zh: 'Self-Consistency：多跑几次然后投票', en: 'Self-consistency: sample several times and vote' },
      d: { zh: '**Chain-of-Thought** 的加强版。同一个问题用较高温度跑多次，得到多条不同的推理路径，然后**对最终答案做多数投票**。原理是：错误的推理往往错得各不相同，而正确的推理会殊途同归。对有唯一正确答案的问题（数学、逻辑、分类）效果明显，代价是调用次数翻几倍——所以它和**资源感知优化**是直接冲突的，要按任务价值决定用不用。',
        en: 'A strengthened **chain-of-thought**. Run the same question several times at higher temperature to get diverging reasoning paths, then **majority-vote on the final answer**. The intuition: wrong reasoning goes wrong in many different ways while correct reasoning converges. It clearly helps where there is one right answer — maths, logic, classification — at several times the calls, which puts it in direct tension with resource-aware optimisation. Spend it by task value.' } },
    { t: { zh: 'Step-Back Prompting：先退一步问原理', en: 'Step-back prompting: ask the principle first' },
      d: { zh: '不直接回答具体问题，而是先让模型**退一步**思考背后的一般性原理或概念，再用这个原理去解具体题。比如不直接问「这道题选什么」，先问「这类题涉及哪条物理定律」，拿到定律后再代入。它有效是因为**抽象层面的知识比具体细节更容易被正确回忆**，先锚定原理能显著减少细节上的瞎编。',
        en: 'Rather than answering the specific question, have the model **step back** to the general principle or concept behind it, then solve the specific case using that principle. Instead of "which answer is right", ask "which law governs this class of problem", then apply it. It works because **knowledge at the abstract level is recalled more reliably than specific detail**, and anchoring on the principle first sharply reduces invention in the details.' } },
    { t: { zh: 'Code Prompting 与 Multimodal Prompting', en: 'Code and multimodal prompting' },
      d: { zh: '**Code Prompting** 指用提示让模型写、解释、翻译或调试代码，关键是把**需求、约束、期望的输入输出**说清楚，并给出运行环境信息。**Multimodal Prompting** 则是在提示里同时使用文字、图像、音频等多种输入——这直接关系到 Agent 能不能处理截图、表单、录音这类真实世界的输入，而不只是纯文本。',
        en: '**Code prompting** is using prompts to write, explain, translate or debug code; what matters is stating **requirements, constraints and expected input/output** clearly, plus the runtime environment. **Multimodal prompting** combines text, images and audio in one prompt — which is what decides whether your agent can handle screenshots, forms and recordings rather than plain text alone.' } },
    { t: { zh: '一条贯穿全部技术的原则', en: 'The principle running through all of them' },
      d: { zh: '原书把提示工程的目标定义为「**稳定地**从模型获得高质量回答」——重点是稳定。判断一个提示好不好，不是看它某一次输出多惊艳，而是看它在各种输入下**方差有多大**。这也解释了为什么这些技术大多在做同一件事：**减少歧义**。示例减少格式歧义，角色减少语气歧义，CoT 减少推理路径歧义。',
        en: 'The book defines the goal as **consistently** eliciting high-quality responses — consistency being the operative word. A prompt is judged not by how impressive one output was but by **how much variance it shows** across inputs. Which explains why these techniques all do the same thing: **remove ambiguity**. Examples remove format ambiguity, roles remove tonal ambiguity, CoT removes reasoning-path ambiguity.' } }
  ],
  diagram: {
    w: 780, h: 320,
    nodes: [
      { id: 'base',  kind: 'prompt', x: 100, y: 88,  label: { zh: '裸提示', en: 'Bare prompt' }, sub: { zh: '「分析这份数据」', en: '"analyse this"' } },
      { id: 'shot',  kind: 'prompt', x: 288, y: 88,  label: { zh: '+ Few-Shot', en: '+ few-shot' }, sub: { zh: '给几个示例', en: 'worked examples' } },
      { id: 'role',  kind: 'agent',  x: 470, y: 88,  label: { zh: '+ System / Role', en: '+ system / role' }, sub: { zh: '定规则与身份', en: 'rules & identity' }, w: 132 },
      { id: 'cot',   kind: 'llm',    x: 660, y: 88,  label: { zh: '+ CoT', en: '+ chain-of-thought' }, sub: { zh: '写出推理步骤', en: 'show the steps' }, w: 128 },
      { id: 'sc',    kind: 'check',  x: 470, y: 238, label: { zh: '+ Self-Consistency', en: '+ self-consistency' }, sub: { zh: '多跑几次投票', en: 'sample & vote' }, w: 150 },
      { id: 'out',   kind: 'output', x: 200, y: 238, label: { zh: '稳定可用的输出', en: 'Consistent output' }, w: 140 }
    ],
    edges: [
      { from: 'base', to: 'shot' },
      { from: 'shot', to: 'role' },
      { from: 'role', to: 'cot' },
      { from: 'cot', to: 'sc' },
      { from: 'sc', to: 'out' }
    ],
    steps: [
      { edge: 'base->shot', say: { zh: '起点是一句含糊的指令。加几个示例（Few-Shot）先解决**格式和风格**的歧义——这类要求用语言描述很费劲，给两个例子就清楚了。', en: 'We start from a vague instruction. A few worked examples first remove **format and style** ambiguity — requirements that are laborious to describe and obvious to demonstrate.' } },
      { edge: 'shot->role', say: { zh: '再加 System（整体规则、输出格式）和 Role（身份，决定语气、用词和它关注什么）。注意这两者作用不同，常被混为一谈。', en: 'Add system (overall rules and output shape) and role (identity, which shifts tone, vocabulary and what it attends to). These two do different jobs and are frequently conflated.' } },
      { edge: 'role->cot', say: { zh: '任务需要多步推理时，加 Chain-of-Thought 让它把中间步骤写出来。机制上讲，这是给了模型更多的**计算预算**，同时让后续步骤能站在已生成的正确中间结果上。', en: 'For multi-step reasoning add chain-of-thought so intermediate steps get written out. Mechanically this grants more **compute budget** and lets later steps stand on correct intermediates already produced.' } },
      { edge: 'cot->sc', say: { zh: '要求更高时用 Self-Consistency：同一个问题跑多次拿到多条推理路径，对最终答案投票。**错误的推理各错各的，正确的推理殊途同归。**代价是调用次数翻几倍。', en: 'When accuracy matters more, use self-consistency: sample several reasoning paths and vote on the answer. **Wrong reasoning goes wrong in many ways; correct reasoning converges.** The cost is several times the calls.' } },
      { edge: 'sc->out', say: { zh: '注意这些技术的共同目标是**减少方差**，不是追求某一次输出的惊艳。判断提示好不好，要看它在各种输入下稳不稳定。', en: 'Note the shared goal is **reducing variance**, not producing one dazzling output. Judge a prompt by how stable it is across inputs.' } }
    ]
  },
  code: [
    '# System：定规则和输出格式；Role：定身份和语气',
    'system = "你是一位资深财务分析师，只输出 JSON，不要解释。"',
    '',
    '# Few-Shot：示例要覆盖边界情况，且格式完全一致',
    'examples = [',
    '    {"in": "营收增长 12%", "out": {"trend": "增长", "value": 0.12}},',
    '    {"in": "数据缺失",     "out": {"trend": null,  "value": null}},   # 边界',
    ']',
    '',
    '# Chain-of-Thought：要求写出中间步骤再给结论',
    'user = f"{data}\\n请先逐步分析，再给出最终 JSON。"'
  ],
  useCases: [
    { zh: '**输出格式老是不稳**：加 Few-Shot 示例 + 用 API 的结构化输出强制 schema。', en: '**Unstable output format**: add few-shot examples and enforce a schema with structured output.' },
    { zh: '**多步推理老出错**：先上 CoT；还不够就用 Self-Consistency 投票。', en: '**Multi-step reasoning errors**: start with CoT; if that is not enough, vote with self-consistency.' },
    { zh: '**回答太泛**：用 Role Prompting 指定身份和受众，模型的关注点会立刻收窄。', en: '**Answers too generic**: role prompting with an identity and audience narrows what it attends to immediately.' }
  ],
  terms: [
    { en: 'Zero-Shot / One-Shot / Few-Shot Prompting', zh: { zh: '零样本 / 单样本 / 少样本提示', en: 'Zero-, one-, few-shot' }, d: { zh: '在提示里给 0 个、1 个或几个任务示例来引导模型。示例越多，模型越能领会意图，尤其在格式和风格上。', en: 'Giving zero, one or several worked examples in the prompt. More examples convey intent better, especially format and style.' } },
    { en: 'In-Context Learning', zh: { zh: '上下文学习', en: 'In-context learning' }, d: { zh: '模型仅凭提示里给的示例就学会一个新任务、无需重新训练的能力。这正是 Few-Shot 之所以有效的底层机制。', en: 'A model learning a new task purely from examples in the prompt, with no retraining — the mechanism that makes few-shot work.' } },
    { en: 'System Prompting', zh: { zh: '系统提示', en: 'System prompting' }, d: { zh: '设定整体任务、规则和输出要求的提示层，作用于整个会话而非单轮。', en: 'The layer setting overall task, rules and output requirements — session-wide rather than per turn.' } },
    { en: 'Role Prompting', zh: { zh: '角色提示', en: 'Role prompting' }, d: { zh: '给模型一个身份（如「资深审计师」），从而改变它的语气、用词和关注重点。', en: 'Assigning an identity ("senior auditor") to shift tone, vocabulary and focus.' } },
    { en: 'Chain-of-Thought (CoT)', zh: { zh: '思维链', en: 'Chain-of-thought' }, d: { zh: '让模型写出中间推理步骤再给结论，显著提升复杂任务准确率，同时让错误可定位。', en: 'Having the model write intermediate reasoning before concluding — better accuracy on hard tasks and locatable errors.' } },
    { en: 'Self-Consistency', zh: { zh: '自洽性', en: 'Self-consistency' }, d: { zh: '同一问题采样多条推理路径，对最终答案多数投票。适合有唯一正确答案的任务，代价是调用翻倍。', en: 'Sampling several reasoning paths and majority-voting the answer. Suits single-answer tasks; costs several times the calls.' } },
    { en: 'Step-Back Prompting', zh: { zh: '退一步提示', en: 'Step-back prompting' }, d: { zh: '先让模型思考问题背后的一般性原理，再用该原理解具体问题。抽象知识比细节更容易被正确回忆。', en: 'Have the model derive the general principle first, then apply it to the specific case. Abstract knowledge is recalled more reliably than detail.' } },
    { en: 'Tree of Thoughts (ToT)', zh: { zh: '思维树', en: 'Tree of thoughts' }, d: { zh: 'CoT 的扩展：在每个决策点展开多条候选路径并剪枝，适合解法空间大、单条路径容易走死的问题。', en: 'A CoT extension branching several candidate paths at each decision point and pruning — for large solution spaces where single paths dead-end.' } },
    { en: 'Multimodal Prompting', zh: { zh: '多模态提示', en: 'Multimodal prompting' }, d: { zh: '在同一个提示里混用文字、图像、音频等多种输入，让 Agent 能处理截图、表单、录音等真实输入。', en: 'Mixing text, image and audio in one prompt so an agent can handle screenshots, forms and recordings.' } }
  ],
  refs: [
    { kind: 'paper', title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (Wei et al., 2022)', url: 'https://arxiv.org/abs/2201.11903', note: { zh: 'CoT 的原始论文', en: 'the original CoT paper' } },
    { kind: 'paper', title: 'Self-Consistency Improves Chain of Thought Reasoning in Language Models', url: 'https://arxiv.org/pdf/2203.11171' },
    { kind: 'paper', title: 'Tree of Thoughts: Deliberate Problem Solving with LLMs (Yao et al., 2023)', url: 'https://arxiv.org/pdf/2305.10601' },
    { kind: 'paper', title: 'Take a Step Back: Evoking Reasoning via Abstraction in LLMs', url: 'https://arxiv.org/abs/2310.06117', note: { zh: 'Step-Back Prompting', en: 'step-back prompting' } },
    { kind: 'docs', title: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/', note: { zh: '各种技术的实操速查', en: 'a practical reference for the techniques' } }
  ],
  quiz: [
    {
      q: { zh: 'Few-Shot 提示里，示例最重要的要求是什么？', en: 'What matters most about few-shot examples?' },
      options: [
        { zh: '数量越多越好，至少给十个', en: 'The more the better — at least ten' },
        { zh: '要覆盖边界情况，且所有示例格式完全一致', en: 'They must cover edge cases, and their formatting must be perfectly consistent' },
        { zh: '示例越长越好', en: 'Longer examples are better' },
        { zh: '示例必须来自真实数据', en: 'They must come from real data' }
      ],
      answer: 1,
      why: {
        zh: '只给典型情况，模型就只学会处理简单输入，遇到空值、异常、歧义输入就崩。另外格式一致性极其重要——任何不一致（多一个空格、少一个引号）模型都会当成有意义的信号去模仿。',
        en: 'Typical-only examples teach only the easy path, and the model breaks on nulls, anomalies and ambiguity. Formatting consistency matters just as much: any variation — an extra space, a missing quote — reads as a meaningful signal to imitate.'
      }
    },
    {
      q: { zh: 'Self-Consistency 的工作原理是？', en: 'How does self-consistency work?' },
      options: [
        { zh: '让模型自己检查答案对不对', en: 'The model checks its own answer' },
        { zh: '同一问题采样多条推理路径，对最终答案多数投票', en: 'Sample several reasoning paths for the same question and majority-vote the answer' },
        { zh: '把提示词重复三遍', en: 'Repeat the prompt three times' },
        { zh: '用三个不同的模型分别回答', en: 'Ask three different models' }
      ],
      answer: 1,
      why: {
        zh: '背后的直觉是：错误的推理往往错得各不相同，而正确的推理会殊途同归，所以出现次数最多的答案更可能对。它适合有唯一正确答案的任务，代价是调用次数翻几倍——和资源感知优化直接冲突，要按任务价值决定用不用。',
        en: 'The intuition: wrong reasoning goes wrong in many different ways while correct reasoning converges, so the most frequent answer is likelier right. It suits single-answer tasks and costs several times the calls — in direct tension with resource-aware optimisation, so spend it by task value.'
      }
    },
    {
      q: { zh: '下面哪个问题**不是**提示技术能解决的？', en: 'Which problem can prompting **not** solve?' },
      options: [
        { zh: '输出格式不稳定', en: 'Unstable output format' },
        { zh: '回答太笼统、不够具体', en: 'Answers too generic' },
        { zh: '模型不知道你公司的内部政策', en: 'The model does not know your company\'s internal policy' },
        { zh: '多步推理容易出错', en: 'Errors in multi-step reasoning' }
      ],
      answer: 2,
      why: {
        zh: '这是很关键的边界：提示解决的是**表达和引导**问题，解决不了**知识缺失**。模型没见过你公司的政策文档，提示写得再精妙它也变不出来——那是 RAG 的活。同理，安全约束也不能靠提示，必须在代码层做硬限制。',
        en: 'An important boundary: prompting fixes problems of **expression and steering**, not **missing knowledge**. No phrasing conjures a policy document the model never saw — that is RAG\'s job. By the same logic, security cannot live in the prompt either; hard limits belong in code.'
      }
    }
  ],
  related: ['reasoning', 'prompt-chaining', 'knowledge-retrieval', 'what-is-an-agent']
}

);
