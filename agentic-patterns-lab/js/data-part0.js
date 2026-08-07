/* ============================================================
   Part Zero — 基础 / Foundations
   原书开篇「What makes an AI system an Agent?」与 Appendix C 框架速览
   ============================================================ */
window.PATTERNS.push(

/* ---------------------------------------------------------- 基础 1 */
{
  id: 'what-is-an-agent', num: -2, part: 0, kind: 'basics', core: false, icon: '🤖',
  pages: '14–22', chapter: '开篇 What makes an AI system an Agent?',
  label: { zh: '基础 · 从这里开始', en: 'Foundations · start here' },
  name: { zh: 'Agent 到底是什么', en: 'What Is an Agent' },
  keywords: 'agent definition level loop perceive act 定义 循环 层级 基础',
  oneLiner: {
    zh: 'LLM 只会回答，Agent 会**感知环境、规划、调用工具、执行、再从结果里学**——多出来的这四件事才是 Agent。',
    en: 'An LLM answers. An agent **perceives, plans, calls tools, acts and learns from the result** — those four additions are what make it an agent.'
  },
  analogy: {
    icon: '🧑‍🍳',
    title: { zh: '菜谱 vs 厨师', en: 'A recipe versus a cook' },
    body: {
      zh: '**LLM** 像一本无所不知的菜谱：你问它红烧肉怎么做，它答得头头是道，但它不会去冰箱看有没有肉，不会发现酱油用完了，也不会尝一口咸淡再调整。厨师会。Agent 就是把菜谱接上了手、眼睛和冰箱——它能**看现场、动手、并根据结果调整**。'
      , en: 'An **LLM** is an omniscient cookbook: ask how to braise pork and it answers beautifully, but it will not check the fridge, notice the soy sauce ran out, or taste and adjust. A cook does. An agent is that cookbook wired to hands, eyes and a fridge — it can **observe, act, and adjust from what happened**.'
    }
  },
  problem: {
    zh: '很多人以为「Agent = 更强的 **LLM**」，于是花力气去挑模型，却发现做出来的东西还是只会聊天。根本区别不在模型强弱，而在**系统结构**：模型有没有被接上外部世界、有没有循环、有没有状态。',
    en: 'People assume an agent is just a stronger **LLM** and spend their effort picking a model, then find the result still only chats. The difference is not model strength but **system structure**: is the model wired to the outside world, does it loop, does it hold state.'
  },
  solution: {
    zh: '原书给出一个五步循环：**接到目标 → 观察环境 → 规划 → 执行 → 从结果中学习**。你之后要学的 21 个模式，全都是在给这五步里的某一步补强——规划有规划的模式，执行有工具使用，学习有记忆和适应。先记住这个循环，后面所有模式都有位置可挂。',
    en: 'The book gives a five-step loop: **get the goal → observe the environment → plan → act → learn from the outcome**. All 21 patterns ahead strengthen one of those five steps — planning has its patterns, acting has tool use, learning has memory and adaptation. Fix this loop in mind and every pattern has somewhere to hang.'
  },
  without: {
    zh: '你问「帮我安排下周日程」，它回你一段关于「如何安排日程」的建议文字。它不知道你的日历里有什么，也没法真的建一个会议。',
    en: 'Ask it to organise next week and it returns advice about how to organise a week. It cannot see your calendar and cannot create a single meeting.'
  },
  with: {
    zh: '它去读你的邮件和日历（观察）、排出冲突最少的方案（规划）、真的发出会议邀请（执行），并在会议被改期时记住你的偏好（学习）。',
    en: 'It reads your mail and calendar (observe), works out the least-conflicting arrangement (plan), actually sends the invitations (act), and remembers your preference when a meeting gets moved (learn).'
  },
  deepDive: [
    { t: { zh: 'Level 0：只有推理内核，还不算 Agent', en: 'Level 0: a reasoning core, not yet an agent' },
      d: { zh: '**LLM** 本身不是 Agent。Level 0 配置下它没有工具、没有记忆、不与环境交互，只靠预训练知识回答。它的强项是解释既有概念，代价是**完全不知道当下发生了什么**——比如它答不出训练截止之后的奥斯卡最佳影片。认清这一层，你才知道后面每加一样东西是在补什么。',
        en: 'An **LLM** alone is not an agent. At level 0 it has no tools, no memory and no environment interaction, answering purely from pretraining. Its strength is explaining established concepts; the cost is **no awareness of the present** — it cannot name a Best Picture winner from after its cutoff. Recognising this layer tells you what each later addition is actually fixing.' } },
    { t: { zh: 'Level 1：接上工具，才第一次成为 Agent', en: 'Level 1: tools make it an agent for the first time' },
      d: { zh: '一旦 **LLM** 能调用外部工具，它的解题范围就不再受训练数据限制：能搜网页、能查数据库（**RAG**）、能调金融 API 拿实时股价。原书把「能跨多步与外部世界交互」定为 Level 1 的核心能力。**这是从「会说」到「会做」的分界线**，对应你后面要学的第 5 章工具使用。',
        en: 'Once an **LLM** can call external tools its reach stops being bounded by training data: it can search, query a database (**RAG**), or hit a financial API for a live price. The book defines multi-step interaction with the outside world as level 1\'s core capability. **This is the line between talking and doing**, and it maps to the tool-use pattern.' } },
    { t: { zh: 'Level 2：策略性解题，核心技能是 Context Engineering', en: 'Level 2: strategy, powered by context engineering' },
      d: { zh: '这一层的关键概念是原书反复强调的 **Context Engineering（上下文工程）**：策略性地挑选、打包、管理每一步真正需要的信息。举例——要找两地之间的咖啡馆，Agent 先调地图工具，然后**只把街道名这一小段结果**喂给下一个搜索工具，而不是把地图返回的全部内容倒进去。目的是避免认知过载，让模型有限的注意力用在刀刃上。这比「写好提示词」是更进一步的技能。',
        en: 'The key idea here is one the book stresses repeatedly: **context engineering** — strategically selecting, packaging and managing exactly what each step needs. Finding a café between two places, the agent calls a mapping tool then feeds **only the street names** into the next search, not the entire map response. The point is preventing cognitive overload so the model\'s limited attention lands where it matters. It is a step beyond prompt writing.' } },
    { t: { zh: 'Level 3：多个专才协作，而不是一个全才', en: 'Level 3: a team of specialists, not one generalist' },
      d: { zh: '最高一层是范式转变：不再追求单个全能超级 Agent，而是让一组各有专长的 Agent 协作，结构上对应人类组织的分工。原书同时诚实指出当前瓶颈——**多 Agent 系统的效果仍受限于底层 LLM 的推理能力，而且它们互相学习、作为整体改进的能力还很初步**。这一层对应第 7 章多智能体协作。',
        en: 'The top layer is a paradigm shift: not one all-powerful agent but a group of specialists collaborating, structurally mirroring a human organisation. The book is candid about the current ceiling — **multi-agent effectiveness is still bounded by the reasoning limits of the underlying LLMs, and their ability to learn from each other as a unit is early**. This maps to the multi-agent pattern.' } },
    { t: { zh: '这两年的演进路线', en: 'How the last two years went' },
      d: { zh: '原书画出的路径是：**基础提示与触发器 → RAG（用事实为模型接地）→ 单个会用工具的 Agent → Agentic AI（一组专门 Agent 协同）**。理解这条线的意义在于：它同时也是**你自己该按什么顺序去搭**的顺序。先别想多 Agent，先把工具和 RAG 跑通。',
        en: 'The book traces: **basic prompts and triggers → RAG grounding the model in fact → a single tool-using agent → agentic AI, a team of specialists**. That line matters because it is also **the order in which you should build**. Do not start with multi-agent; get tools and RAG working first.' } }
  ],
  diagram: {
    w: 780, h: 315,
    nodes: [
      { id: 'goal',  kind: 'actor',  x: 92,  y: 82,  label: { zh: '① 接到目标', en: '1 Get the goal' }, sub: { zh: '「安排我的日程」', en: '"organise my week"' }, w: 132 },
      { id: 'see',   kind: 'world',  x: 290, y: 82,  label: { zh: '② 观察环境', en: '2 Scan the scene' }, sub: { zh: '读邮件 · 查日历', en: 'mail · calendar' }, w: 132 },
      { id: 'plan',  kind: 'plan',   x: 490, y: 82,  label: { zh: '③ 规划', en: '3 Think it through' }, sub: { zh: '排出方案', en: 'devise a plan' }, w: 128 },
      { id: 'act',   kind: 'tool',   x: 672, y: 82,  label: { zh: '④ 执行', en: '4 Take action' }, sub: { zh: '真的发出邀请', en: 'really sends it' } },
      { id: 'learn', kind: 'memory', x: 380, y: 240, label: { zh: '⑤ 从结果中学习', en: '5 Learn and improve' }, sub: { zh: '下次做得更好', en: 'better next time' }, w: 150 }
    ],
    edges: [
      { from: 'goal', to: 'see' },
      { from: 'see', to: 'plan' },
      { from: 'plan', to: 'act' },
      { from: 'act', to: 'learn' },
      { from: 'learn', to: 'see', label: { zh: '带着经验重新观察', en: 'observe again, wiser' } }
    ],
    steps: [
      { edge: 'goal->see', say: { zh: '你给的是**目标**，不是步骤。这是 Agent 和普通程序的第一个区别——你说「要什么」，不说「怎么做」。', en: 'You supply a **goal**, not steps. That is the first difference from ordinary software: you say what, not how.' } },
      { edge: 'see->plan', say: { zh: '它先去环境里取信息：读邮件、查日历、访问联系人。**LLM 自己做不到这一步**，必须靠工具接出去——这正是 Level 0 和 Level 1 的分界。', en: 'It gathers information from the environment: mail, calendar, contacts. **An LLM cannot do this alone**; tools take it outward — exactly the line between level 0 and level 1.' } },
      { edge: 'plan->act', say: { zh: '有了信息才谈得上规划：怎么排冲突最少。这一步对应第 6 章「规划」模式。', en: 'Only with information can it plan: which arrangement conflicts least. This maps to the planning pattern.' } },
      { edge: 'act->learn', say: { zh: '执行是真的产生副作用——发出邀请、改动日历。到这一步为止，它已经是个能用的 Agent 了。', en: 'Acting produces real side effects: invitations sent, calendars changed. Up to here you already have a usable agent.' } },
      { edge: 'learn->see', say: { zh: '最后一步最容易被省略，也最能拉开差距：会议被改期时，它记住你的偏好，下次排得更好。对应第 8 章记忆和第 9 章学习与适应。', en: 'The last step is the one most often skipped and the one that compounds: when a meeting moves, it remembers your preference and does better next time. This maps to memory and to learning and adaptation.' } }
    ]
  },
  code: [
    '# Level 0：只是一次问答，不是 Agent',
    'answer = llm("帮我安排下周日程")        # 它只能给「建议」',
    '',
    '# Level 1 起：接上工具 + 循环，才叫 Agent',
    'while not done:',
    '    obs     = read_calendar() + read_mail()   # ② 观察',
    '    plan    = llm(goal, obs)                  # ③ 规划',
    '    result  = run_tool(plan.action)           # ④ 执行（真的有副作用）',
    '    memory.save(result)                       # ⑤ 学习',
    '    done    = plan.finished'
  ],
  useCases: [
    { zh: '**判断一个产品是不是真 Agent**：看它有没有工具调用和循环。只有一次问答的，都还是 Level 0。', en: '**Telling a real agent from a chatbot**: look for tool calls and a loop. One-shot Q&A is still level 0.' },
    { zh: '**规划自己的学习顺序**：按 Level 0→3 走，先工具、再规划、最后多 Agent，别一上来就搭团队。', en: '**Sequencing your own learning**: follow levels 0→3 — tools, then planning, then multi-agent. Do not start with a team.' },
    { zh: '**排查 Agent 不好用**：先定位是五步循环里的哪一步断了，通常是「观察」信息不够或「学习」根本没接。', en: '**Debugging a weak agent**: find which of the five steps broke — usually observation is starved, or learning was never wired at all.' }
  ],
  terms: [
    { en: 'Agent', zh: { zh: '智能体', en: 'Agent' }, d: { zh: '能感知环境并采取行动以达成目标的系统。相对 LLM 多出的是规划、工具使用和与环境交互的能力。', en: 'A system that perceives its environment and acts to achieve a goal — an LLM plus planning, tool use and environment interaction.' } },
    { en: 'Context Engineering', zh: { zh: '上下文工程', en: 'Context engineering' }, d: { zh: '策略性地挑选、打包、管理喂给模型每一步的信息，避免认知过载。原书把它列为 Level 2 的核心技能，比「提示工程」更进一步。', en: 'Strategically selecting, packaging and managing what goes into each step\'s context to prevent overload. The book calls it the core level-2 skill, a step beyond prompt engineering.' } },
    { en: 'Agentic AI', zh: { zh: '智能体式 AI', en: 'Agentic AI' }, d: { zh: '指一组专门 Agent 协同完成复杂目标的形态，区别于单个 Agent。原书演进路线的终点。', en: 'A team of specialised agents working in concert on complex goals, as distinct from one agent. The end of the book\'s progression.' } },
    { en: 'Grounding', zh: { zh: '接地 / 事实锚定', en: 'Grounding' }, d: { zh: '把模型输出锚定到可验证的真实信息源上，以保证事实准确、减少幻觉。RAG 是最常见的实现手段。', en: 'Connecting model output to verifiable real-world sources for factual accuracy and less hallucination. RAG is the usual implementation.' } }
  ],
  refs: [
    { kind: 'docs', title: 'LangChain — 官方文档', url: 'https://python.langchain.com/docs/introduction/', note: { zh: '书中示例主要用的三个框架之一', en: 'one of the book\'s three example frameworks' } },
    { kind: 'docs', title: 'Google Agent Development Kit (ADK)', url: 'https://google.github.io/adk-docs/', note: { zh: '书中大量代码示例基于它', en: 'the basis of many code examples in the book' } },
    { kind: 'docs', title: 'CrewAI — 官方文档', url: 'https://docs.crewai.com/', note: { zh: '多 Agent 协作方向', en: 'the multi-agent flavour' } }
  ],
  quiz: [
    {
      q: { zh: '按原书的分层，一个「没有工具、只靠预训练知识回答」的 LLM 属于？', en: 'In the book\'s levels, an LLM with no tools answering purely from pretraining is:' },
      options: [
        { zh: 'Level 1，已经算 Agent 了', en: 'Level 1 — already an agent' },
        { zh: 'Level 0，是推理内核但还不算 Agent', en: 'Level 0 — a reasoning core, not yet an agent' },
        { zh: 'Level 2，因为它会推理', en: 'Level 2, because it reasons' },
        { zh: 'Level 3', en: 'Level 3' }
      ],
      answer: 1,
      why: {
        zh: '原书说得很直接：LLM 本身不是 Agent，它可以充当 Agent 的推理内核。Level 0 没有工具、没有记忆、不与环境交互，所以完全不知道当下发生了什么。接上工具能跨多步与外部世界交互，才进入 Level 1。',
        en: 'The book is explicit: an LLM is not itself an agent, though it can serve as one\'s reasoning core. Level 0 has no tools, no memory and no environment interaction, so it knows nothing of the present. Multi-step interaction with the outside world via tools is what makes it level 1.'
      }
    },
    {
      q: { zh: '「Context Engineering（上下文工程）」指的是？', en: 'What is context engineering?' },
      options: [
        { zh: '把上下文窗口调得更大', en: 'Increasing the context window size' },
        { zh: '策略性挑选、打包、管理每一步真正需要的信息，避免模型认知过载', en: 'Strategically selecting, packaging and managing exactly what each step needs, to prevent overload' },
        { zh: '把所有可能有用的信息都塞进提示里', en: 'Putting everything potentially useful into the prompt' },
        { zh: '给模型更多示例', en: 'Giving the model more examples' }
      ],
      answer: 1,
      why: {
        zh: '注意它和「塞更多信息」恰恰相反。原书举的例子是：调完地图工具后，只把街道名这一小段结果传给下一个搜索工具，而不是把地图的全部返回倒进去——目的是让模型有限的注意力用在刀刃上。',
        en: 'Note it is the opposite of adding more. The book\'s example: after the mapping tool returns, pass only the street names to the next search rather than the whole response — so the model\'s limited attention lands where it matters.'
      }
    },
    {
      q: { zh: '五步循环里，最容易被省略、但最能拉开长期差距的是哪一步？', en: 'Which of the five steps is most often skipped yet compounds the most?' },
      options: [
        { zh: '接到目标', en: 'Getting the goal' },
        { zh: '观察环境', en: 'Scanning the scene' },
        { zh: '执行', en: 'Taking action' },
        { zh: '从结果中学习', en: 'Learning from the outcome' }
      ],
      answer: 3,
      why: {
        zh: '前四步不做系统根本跑不起来，所以不会被省；第五步不做系统照样能用，于是常被跳过。但没有它，同一个错误会重复一百次，永远要靠人去改提示词——这正是第 9 章「学习与适应」要解决的问题。',
        en: 'The first four are load-bearing so they never get skipped; the fifth still leaves a working system, so it usually does. Without it the same failure repeats a hundred times and a human keeps rewriting prompts — exactly what the learning-and-adaptation pattern addresses.'
      }
    }
  ],
  related: ['pick-a-framework', 'tool-use', 'planning', 'memory']
},

/* ---------------------------------------------------------- 基础 2 */
{
  id: 'pick-a-framework', num: -1, part: 0, kind: 'basics', core: false, icon: '🧰',
  pages: '385–392', chapter: 'Appendix C — Quick overview of Agentic Frameworks',
  label: { zh: '基础 · 动手前先选型', en: 'Foundations · pick your tools' },
  name: { zh: '框架怎么选', en: 'Picking a Framework' },
  keywords: 'langchain langgraph crewai adk framework dag cyclic 框架 选型 对比',
  oneLiner: {
    zh: '流程是**一条直线**就用 LangChain，需要**循环和状态**就用 LangGraph，是**一支团队**就用 CrewAI。',
    en: 'A straight line → LangChain. Loops and state → LangGraph. A team of roles → CrewAI.'
  },
  analogy: {
    icon: '🛠️',
    title: { zh: '别用锤子拧螺丝', en: 'Do not hammer a screw' },
    body: {
      zh: '这些框架不是「谁更强」的关系，而是**形状不同**。LangChain 是一条传送带——东西从这头进那头出，不回头。LangGraph 是一张带回路的地图——可以绕回去重试。CrewAI 是一张组织架构图——一群角色各司其职。选错了不是做不出来，是每一步都在跟工具较劲。',
      en: 'These are not ranked by power, they are **different shapes**. LangChain is a conveyor belt: in one end, out the other, no going back. LangGraph is a map with loops: you can circle back and retry. CrewAI is an org chart: roles with jobs. Choosing wrong does not make the task impossible, it makes every step a fight with your tools.'
    }
  },
  problem: {
    zh: '新手最常见的卡点不是不会写代码，而是**一开始就选错了框架**：用只能走直线的工具去实现需要循环的反思，于是每一步都要绕过框架的设计意图，写出一堆难以维护的胶水代码。',
    en: 'The usual beginner block is not coding ability but **picking the wrong framework up front**: using a strictly linear tool to build reflection, which needs a loop. Every step then works against the framework\'s intent and produces glue code nobody can maintain.'
  },
  solution: {
    zh: '按**流程形状**选，而不是按流行度选。原书给的判据很干脆：能从 A 到 B 到 C 一路走完、不需要绕回去的，用 **LangChain** 的 **LCEL**；需要 Agent 推理、规划、循环重试的，用 **LangGraph**；要编排多个角色协作的，用 **CrewAI**；想要 Google 生态里评估和部署一体的，用 **ADK**。',
    en: 'Choose by the **shape of your flow**, not by popularity. The book\'s test is blunt: if the process runs A to B to C without looping back, use **LangChain** with **LCEL**; if the agent must reason, plan or retry in a loop, use **LangGraph**; to orchestrate several roles, use **CrewAI**; for evaluation and deployment inside Google\'s stack, **ADK**.'
  },
  without: {
    zh: '你想做「写初稿 → 评审 → 改写 → 再评审」的反思循环，却选了只支持单向流动的 LCEL，最后只能用一堆 while 循环手动拼状态。',
    en: 'You want draft → critique → revise → critique again, but picked LCEL which only flows one way, and end up hand-rolling state through while loops.'
  },
  with: {
    zh: '同样的需求在 LangGraph 里就是两个节点加一条条件边，状态由框架管，循环是它的原生能力。',
    en: 'The same thing in LangGraph is two nodes and a conditional edge, with state managed for you and looping as a native capability.'
  },
  deepDive: [
    { t: { zh: 'DAG 还是有环图，这是唯一要先想清楚的问题', en: 'DAG or cyclic — the one question to settle first' },
      d: { zh: '原书用一个精确的术语区分了 LangChain 和 LangGraph：**LangChain 面向 DAG（有向无环图）**，流程单向流动、不能回头；**LangGraph 支持环（cycles）**，可以循环、重试、按任意顺序调工具直到任务完成。判断方法很简单——问自己「这个流程需不需要根据结果绕回上一步？」需要就是有环图，别用 LCEL 硬撑。',
        en: 'The book separates them with a precise term: **LangChain targets DAGs** — directed acyclic graphs, flowing one way with no return; **LangGraph supports cycles**, so it can loop, retry and call tools in any order until done. The test is simply: does this flow need to circle back based on a result? If yes it is cyclic, and LCEL is the wrong shape.' } },
    { t: { zh: '状态管理方式的根本差别', en: 'The fundamental difference in state' },
      d: { zh: '**LangChain 每次运行基本是无状态的**——值沿着管道传递，一步的输出就是下一步的输入。**LangGraph 有一个显式且持久的状态对象**，在节点之间传递并被不断更新（通常用 `TypedDict` 定义）。这个差别决定了：需要跨多步累积信息、需要中断后恢复、需要人在回路暂停的，都只能选 LangGraph。',
        en: '**LangChain runs are essentially stateless**: values flow down the pipe, each output feeding the next input. **LangGraph carries an explicit, persistent state object** passed between nodes and updated throughout, typically declared with a `TypedDict`. This decides things: accumulating information across steps, resuming after interruption, pausing for a human — all require LangGraph.' } },
    { t: { zh: '各自的典型用途（原书给的清单）', en: 'What each is actually for (the book\'s own list)' },
      d: { zh: '**LangChain**：简单 RAG（检索→组提示→拿答案）、摘要、从文本里抽结构化数据。**LangGraph**：多 Agent 系统（supervisor 路由给 worker 并循环）、Plan-and-Execute（执行一步后回头改计划）、人在回路（图可以停下来等人输入再决定走哪个节点）。对照这两张清单，你手上的需求属于哪边通常一眼就能看出来。',
        en: '**LangChain**: simple RAG (retrieve → prompt → answer), summarisation, extracting structured data from text. **LangGraph**: multi-agent systems (a supervisor routing to workers, looping until done), plan-and-execute (act, then revise the plan), human-in-the-loop (the graph waits for input before choosing the next node). Held against these two lists, most requirements sort themselves immediately.' } },
    { t: { zh: '别一上来就选最复杂的', en: 'Do not start with the most powerful one' },
      d: { zh: 'LangGraph 能力最强，但它要求你自己定义状态结构、节点、边和终止条件——概念负担明显更重。如果你的第一个 Agent 只是「检索资料然后回答」，用 LCEL 三行就能写完，上 LangGraph 是给自己找麻烦。**先用最简单能满足需求的那个，撞到墙了再换**，这是比任何选型表都实用的原则。',
        en: 'LangGraph is the most capable and also asks you to define state, nodes, edges and termination yourself — a real conceptual load. If your first agent just retrieves and answers, LCEL does it in three lines and LangGraph is self-inflicted work. **Use the simplest thing that meets the need and switch when you hit a wall** — more useful than any comparison table.' } }
  ],
  diagram: {
    w: 780, h: 320,
    nodes: [
      { id: 'q',    kind: 'decision', x: 120, y: 90,  label: { zh: '流程需要绕回去吗？', en: 'Does it loop back?' }, w: 168 },
      { id: 'lc',   kind: 'agent',    x: 380, y: 45,  label: { zh: 'LangChain (LCEL)', en: 'LangChain (LCEL)' }, sub: { zh: 'DAG · 单向 · 无状态', en: 'DAG · one-way' }, w: 168 },
      { id: 'lg',   kind: 'agent',    x: 380, y: 158, label: { zh: 'LangGraph', en: 'LangGraph' }, sub: { zh: '有环 · 显式状态', en: 'cycles · state' }, w: 168 },
      { id: 'crew', kind: 'agent',    x: 380, y: 262, label: { zh: 'CrewAI', en: 'CrewAI' }, sub: { zh: '角色 · 任务 · 团队', en: 'roles · tasks' }, w: 168 },
      { id: 'use1', kind: 'output',   x: 646, y: 45,  label: { zh: 'RAG · 摘要 · 抽取', en: 'RAG · summarise' }, w: 150 },
      { id: 'use2', kind: 'output',   x: 646, y: 158, label: { zh: '反思 · 规划 · HITL', en: 'reflect · plan · HITL' }, w: 150 },
      { id: 'use3', kind: 'output',   x: 646, y: 262, label: { zh: '多角色协作', en: 'role collaboration' }, w: 150 }
    ],
    edges: [
      { from: 'q', to: 'lc', label: { zh: '不需要', en: 'no' } },
      { from: 'q', to: 'lg', label: { zh: '需要', en: 'yes' } },
      { from: 'q', to: 'crew', label: { zh: '是一支团队', en: 'it is a team' } },
      { from: 'lc', to: 'use1' }, { from: 'lg', to: 'use2' }, { from: 'crew', to: 'use3' }
    ],
    steps: [
      { edge: 'q->lc', say: { zh: '先问这一个问题就够了：流程会不会根据结果绕回上一步？不会的话，它就是一个 **DAG（有向无环图）**——LCEL 用管道符把组件串起来，三行写完。', en: 'One question settles it: does the flow ever circle back based on a result? If not it is a **DAG**, and LCEL pipes the components together in about three lines.' } },
      { edge: 'lc->use1', say: { zh: '典型场景：简单 RAG（检索→组提示→拿答案）、摘要、从文本抽 JSON。共同点是**一路向前，不回头**。', en: 'Typical: simple RAG (retrieve → prompt → answer), summarisation, extracting JSON from text. All strictly forward, never back.' } },
      { edge: 'q->lg', say: { zh: '需要绕回去就得选 LangGraph。它支持**环（cycles）**，还有一个显式且持久的状态对象在节点之间传递——这是它和 LangChain 最根本的差别。', en: 'Anything that circles back needs LangGraph. It supports **cycles** and carries an explicit, persistent state object between nodes — its most fundamental difference from LangChain.' } },
      { edge: 'lg->use2', say: { zh: '反思循环、Plan-and-Execute、人在回路（图可以停下来等人输入）——这些全都需要「回头」的能力，LCEL 做不了。', en: 'Reflection loops, plan-and-execute, human-in-the-loop where the graph pauses for input — all need the ability to go back, which LCEL lacks.' } },
      { edge: 'q->crew', say: { zh: '如果你的心智模型是「一支团队，每人一个角色」，那 CrewAI 的抽象最贴合：用 role / goal / backstory 定义 Agent，用 Process 定义协作方式。', en: 'If your mental model is a team with roles, CrewAI\'s abstraction fits best: agents defined by role, goal and backstory, collaboration defined by Process.' } },
      { edge: 'crew->use3', say: { zh: '最后一句最实用：**先用最简单能满足需求的那个，撞到墙了再换**。第一个 Agent 就上 LangGraph，多半是在给自己找麻烦。', en: 'The most useful rule: **start with the simplest thing that meets the need and switch when you hit a wall**. Reaching for LangGraph on your first agent is usually self-inflicted work.' } }
    ]
  },
  code: [
    '# LangChain / LCEL：一条直线，用管道符串起来',
    'chain = prompt | model | output_parser        # 单向，不能回头',
    '',
    '# LangGraph：节点 + 边 + 显式状态，可以循环',
    'class State(TypedDict):',
    '    draft: str',
    '    critique: str',
    '',
    'g = StateGraph(State)',
    'g.add_node("write", write_fn)',
    'g.add_node("review", review_fn)',
    'g.add_conditional_edges("review", lambda s: "write" if s["critique"] else END)'
  ],
  useCases: [
    { zh: '**第一个 Agent**：检索文档然后回答 → LangChain / LCEL 足够。', en: '**Your first agent**: retrieve documents and answer → LangChain / LCEL is enough.' },
    { zh: '**需要自我修正的写作助手**：写→评→改的循环 → 必须 LangGraph。', en: '**A self-correcting writer**: draft → critique → revise → LangGraph is required.' },
    { zh: '**模拟一个团队**：研究员 + 分析师 + 写手 → CrewAI 的角色抽象最省心。', en: '**Simulating a team**: researcher + analyst + writer → CrewAI\'s role abstraction fits best.' }
  ],
  terms: [
    { en: 'LCEL (LangChain Expression Language)', zh: { zh: 'LangChain 表达式语言', en: 'LangChain Expression Language' }, d: { zh: '用管道符 `|` 把组件串成链的写法，LangChain 的核心抽象。适合单向流程。', en: 'LangChain\'s core abstraction: piping components into a chain with `|`. Suits one-way flows.' } },
    { en: 'DAG (Directed Acyclic Graph)', zh: { zh: '有向无环图', en: 'Directed acyclic graph' }, d: { zh: '单向流动、不存在回路的流程结构。LangChain 面向的就是这类流程。', en: 'A flow that moves one way with no cycles — the shape LangChain targets.' } },
    { en: 'StateGraph', zh: { zh: '状态图', en: 'StateGraph' }, d: { zh: 'LangGraph 的核心结构：节点是函数或链，边是条件逻辑，中间有一个显式的状态对象被不断更新。', en: 'LangGraph\'s core structure: nodes are functions or chains, edges are conditional logic, and an explicit state object is updated throughout.' } },
    { en: 'Process (sequential / hierarchical)', zh: { zh: '协作流程', en: 'Process' }, d: { zh: 'CrewAI 里定义一支 Agent 团队怎么协作的参数：顺序执行还是层级委派。', en: 'CrewAI\'s parameter for how a crew collaborates: run in sequence, or delegate hierarchically.' } }
  ],
  refs: [
    { kind: 'docs', title: 'LangChain Expression Language (LCEL)', url: 'https://python.langchain.com/docs/concepts/lcel/' },
    { kind: 'docs', title: 'LangGraph — 官方文档', url: 'https://langchain-ai.github.io/langgraph/', note: { zh: '状态、节点、条件边的完整说明', en: 'state, nodes and conditional edges in full' } },
    { kind: 'docs', title: 'CrewAI — Tasks and Processes', url: 'https://docs.crewai.com/' },
    { kind: 'docs', title: 'Google ADK — Multi-Agent Systems', url: 'https://google.github.io/adk-docs/agents/multi-agents/' }
  ],
  quiz: [
    {
      q: { zh: '区分 LangChain 和 LangGraph 最根本的技术差别是？', en: 'What most fundamentally separates LangChain from LangGraph?' },
      options: [
        { zh: 'LangGraph 支持的模型更多', en: 'LangGraph supports more models' },
        { zh: 'LangChain 面向 DAG（单向无环），LangGraph 支持环和显式持久状态', en: 'LangChain targets DAGs (one-way, acyclic); LangGraph supports cycles and explicit persistent state' },
        { zh: 'LangGraph 更快', en: 'LangGraph is faster' },
        { zh: 'LangChain 只能用于 RAG', en: 'LangChain only does RAG' }
      ],
      answer: 1,
      why: {
        zh: '判断方法很简单：问自己「这个流程需不需要根据结果绕回上一步？」需要回头（反思、重试、Plan-and-Execute、人在回路）就得用 LangGraph；一路向前的（RAG、摘要、抽取）用 LCEL 更省事。',
        en: 'The test: does the flow ever circle back based on a result? Anything that goes back — reflection, retries, plan-and-execute, human-in-the-loop — needs LangGraph. Strictly forward flows (RAG, summarisation, extraction) are simpler in LCEL.'
      }
    },
    {
      q: { zh: '你要做一个「写初稿 → 评审 → 根据意见改写 → 再评审」的助手，该选？', en: 'You need draft → critique → revise → critique again. Which do you pick?' },
      options: [
        { zh: 'LangChain / LCEL，因为它更简单', en: 'LangChain / LCEL — it is simpler' },
        { zh: 'LangGraph，因为这是个需要循环和状态的流程', en: 'LangGraph — this flow needs cycles and state' },
        { zh: '什么框架都行，没区别', en: 'Any of them; it makes no difference' },
        { zh: '不需要框架，直接调 API', en: 'No framework — just call the API' }
      ],
      answer: 1,
      why: {
        zh: '这是典型的反思循环：评审结果决定要不要回到「写」这一步，而且初稿和批评意见要在轮次之间保留下来。前者需要环，后者需要显式状态——两个都是 LangGraph 的原生能力，用 LCEL 只能自己拼 while 循环手动管状态。',
        en: 'A textbook reflection loop: the critique decides whether to return to writing, and draft plus critique must survive between rounds. The first needs cycles, the second needs explicit state — both native to LangGraph. In LCEL you would hand-roll a while loop and manage state yourself.'
      }
    },
    {
      q: { zh: '关于框架选型，最实用的原则是？', en: 'What is the most practical rule for choosing?' },
      options: [
        { zh: '一开始就选最强大的，免得以后要换', en: 'Start with the most powerful so you never have to switch' },
        { zh: '先用最简单能满足需求的那个，撞到墙了再换', en: 'Use the simplest thing that meets the need and switch when you hit a wall' },
        { zh: '选社区最大的那个', en: 'Pick whichever has the biggest community' },
        { zh: '全都学一遍再决定', en: 'Learn all of them first, then decide' }
      ],
      answer: 1,
      why: {
        zh: 'LangGraph 要求你自己定义状态结构、节点、边和终止条件，概念负担明显更重。如果第一个 Agent 只是「检索然后回答」，LCEL 三行写完，上 LangGraph 纯属给自己找麻烦。等真的需要循环时再换，成本远比一开始就背上复杂度低。',
        en: 'LangGraph asks you to define state, nodes, edges and termination yourself — a real load. If your first agent just retrieves and answers, LCEL does it in three lines. Switching later, when you genuinely need cycles, costs far less than carrying that complexity from day one.'
      }
    }
  ],
  related: ['what-is-an-agent', 'prompt-chaining', 'reflection', 'multi-agent']
}

);
