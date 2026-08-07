/* ============================================================
   Part Two — 记忆与外部世界 / Memory & the Outside World (8–11)
   ============================================================ */
window.PATTERNS.push(

/* ---------------------------------------------------------- 8 */
{
  id: 'memory', num: 8, part: 2, core: true, icon: '📚',
  pages: '132–153',
  name: { zh: '记忆管理', en: 'Memory Management' },
  keywords: 'memory session state short long term 记忆 会话 状态 个性化',
  oneLiner: {
    zh: '短期记忆撑住这一次对话，长期记忆跨会话记住你是谁——两套机制缺一不可。',
    en: 'Short-term memory holds this conversation together; long-term memory remembers you across them.'
  },
  analogy: {
    icon: '🧠',
    title: { zh: '手边的便签 vs 书架上的档案', en: 'The sticky note vs the filing cabinet' },
    body: {
      zh: '你和同事开会时，手边便签记着刚才聊到哪儿——会开完就扔了，这是短期记忆。而「这位客户偏好邮件沟通、上次投诉过物流」这类信息，你会归档进客户档案，几个月后还能翻出来，这是长期记忆。Agent 需要的是同一套结构：便签放进上下文，档案存进数据库。',
      en: 'In a meeting you keep a sticky note of where the conversation is — binned afterwards. That is short-term memory. But "this client prefers email and complained about delivery last time" goes into their file, still there months later. That is long-term. An agent needs exactly this split: the note goes in the context, the file goes in a database.'
    }
  },
  problem: {
    zh: '没有记忆的 Agent 是**无状态**的：每一句话都像第一次见面。你说「就用刚才那个方案」，它完全不知道你指什么。多步骤任务没法推进，个性化更无从谈起。核心难题在于要同时管好两种性质完全不同的信息——这一轮对话里的临时上下文，和跨越几个月积累的持久知识。',
    en: 'A memory-less agent is **stateless**: every turn is a first meeting. Say "use the option we just discussed" and it has no idea. Multi-step work stalls and personalisation is impossible. The hard part is that two very different kinds of information must both be handled — the temporary context of this conversation, and knowledge accumulated over months.'
  },
  solution: {
    zh: '做成**双层**结构。短期记忆就是塞进 **Context Window** 的最近对话，保证这一轮连贯——但它受窗口大小限制，太长就得裁剪或摘要。长期记忆存到外部数据库（通常是 **Vector Database**），用语义检索按需捞回相关片段再拼进上下文。**ADK** 里对应 Session 管对话线程、**State** 管临时数据、MemoryService 管长期知识库。',
    en: 'Build it in **two layers**. Short-term memory is the recent conversation inside the **Context Window**, keeping this session coherent — but it is bounded, so long histories must be trimmed or summarised. Long-term memory lives in an external store, usually a **Vector Database**, and relevant fragments are fetched semantically and spliced back into context. In **ADK** that maps to Session for the thread, **State** for temporary data, and a MemoryService for the durable store.'
  },
  without: {
    zh: '「帮我订上次那家酒店」——Agent 反问「请问是哪一家？」。用户每次都要把背景重讲一遍，体验像在跟一个失忆症患者对话。',
    en: '"Book the hotel from last time" — "Which hotel?" The user re-explains their context every session, as though talking to someone with amnesia.'
  },
  with: {
    zh: 'Agent 从长期记忆里捞出「该用户上季度住的是海淀希尔顿、偏好高楼层」，直接确认下单。对话短了，体验却好了。',
    en: 'The agent pulls "stayed at the Hilton last quarter, prefers a high floor" from long-term memory and simply confirms. Shorter conversation, better experience.'
  },
  whenToUse: [
    { zh: '多轮对话产品——不记住上文的助手基本没法用', en: 'Multi-turn conversation — an assistant that forgets is barely usable' },
    { zh: '需要个性化：记住用户偏好、历史选择、常用设置', en: 'Personalisation: remembering preferences, past choices, usual settings' },
    { zh: '跨越多次会话的长任务（一个项目分几天推进）', en: 'Long tasks spanning sessions — a project advanced over several days' },
    { zh: '希望 Agent 从过去的成功和失败里积累经验', en: 'You want the agent to accumulate experience from what worked and what did not' }
  ],
  whenNotToUse: [
    { zh: '一次性的单轮任务（翻译、改写），加记忆纯属负担', en: 'One-shot single-turn tasks — memory is pure overhead' },
    { zh: '**隐私敏感场景**要格外谨慎：长期记忆意味着你在持久化存储用户数据，得想清楚存什么、存多久、怎么删', en: '**Privacy-sensitive** settings need care: long-term memory means persisting user data — decide what, for how long, and how it gets deleted' },
    { zh: '什么都往记忆里塞会适得其反：无关信息捞回来只会干扰模型判断', en: 'Storing everything backfires — irrelevant recall just distracts the model' }
  ],
  deepDive: [
    { t: { zh: '短期记忆的三种裁剪策略', en: 'Three strategies for trimming short-term memory' },
      d: { zh: '对话超出上下文窗口时必须裁，怎么裁有讲究。**滑动窗口**只保留最近 N 轮：实现最简单，但会丢掉开头交代的关键约束（「我对花生过敏」）。**滚动摘要**把旧对话压缩成一段摘要放在前面：保住了信息但摘要本身会失真、且每次压缩要一次调用。**混合策略**——保留系统提示 + 关键事实 + 最近 N 轮——是生产里最常用的做法。',
        en: 'Once a conversation exceeds the window you must trim, and how matters. A **sliding window** keeps the last N turns: simplest, but drops constraints stated early ("I am allergic to peanuts"). **Rolling summarisation** compresses older turns into a prefix: information survives but the summary distorts, and each compression costs a call. The **hybrid** — system prompt plus pinned facts plus the last N turns — is what production usually runs.' } },
    { t: { zh: '写入策略比读取策略更难做对', en: 'Deciding what to write is harder than deciding what to read' },
      d: { zh: '检索有相似度打分兜底，写入却没有天然的判断标准。全存则库里堆满噪音、检索质量下降；存太少又等于没有记忆。实用做法是**只存有长期价值的结构化事实**（偏好、身份属性、明确的决定），而不是原始对话流；写入前先做一次抽取和去重，避免同一条偏好存二十份不同措辞的副本。',
        en: 'Retrieval has similarity scores to fall back on; writing has no natural criterion. Store everything and the base fills with noise that degrades recall; store too little and there is no memory. The practical rule is to persist **structured facts with durable value** — preferences, attributes, explicit decisions — rather than raw dialogue, running extraction and deduplication first so one preference does not end up as twenty differently-worded copies.' } },
    { t: { zh: '检索污染：捞回错东西比没捞到更糟', en: 'Recall pollution: the wrong memory is worse than none' },
      d: { zh: '语义检索一定会有假阳性。捞回一条无关或**过期**的记忆（用户三个月前说过喜欢辣，后来改了），模型会理直气壮地按它作答。缓解手段：给记忆加时间戳并在检索时降权旧记录、设置相似度阈值宁缺毋滥、以及为可变事实设计**覆盖而非追加**的写入语义。',
        en: 'Semantic search will produce false positives. Recall something irrelevant or **stale** — a preference stated three months ago and since changed — and the model will act on it confidently. Mitigations: timestamp memories and down-weight old ones at retrieval, set a similarity floor and prefer returning nothing, and give mutable facts **overwrite rather than append** semantics.' } },
    { t: { zh: '框架里的对应物', en: 'What this maps to in frameworks' },
      d: { zh: '**ADK** 的三件套分工很清晰：`Session` 是一次对话线程的容器，`State` 是这次会话里的临时键值数据（步骤之间靠读写它传信息），`MemoryService` 才是接长期知识库的接口。**LangGraph** 用 checkpointer 持久化图的 **State** 来实现跨会话记忆。理解「会话内状态」和「跨会话记忆」是两件事，是用好任何框架的前提。',
        en: '**ADK** splits the roles cleanly: `Session` holds one conversation thread, `State` holds this session\'s temporary key-value data (how steps pass information), and `MemoryService` is the interface to the durable store. **LangGraph** persists graph **State** through a checkpointer for cross-session memory. Grasping that in-session state and cross-session memory are different things is a prerequisite for any framework.' } },
    { t: { zh: '隐私是设计约束而非事后补丁', en: 'Privacy is a design constraint, not a later patch' },
      d: { zh: '长期记忆本质上是在持久化用户数据，所以**存什么、存多久、怎么删**必须在设计阶段就定下来。要能按用户维度整体删除（GDPR 式的删除权），敏感字段要脱敏或不入库，写入前最好过一道判断「这条信息该不该长期保留」。事后再往一个已经攒了半年数据的向量库上加这些能力，代价极高。',
        en: 'Long-term memory is by definition persisting user data, so **what, for how long, and how it is deleted** belong in the design. You need per-user bulk deletion (a GDPR-style right to erasure), sensitive fields redacted or never stored, and ideally a check before writing on whether this belongs in durable storage at all. Retrofitting that onto a vector store with six months of data is extremely expensive.' } }
  ],
  diagram: {
    w: 770, h: 320,
    nodes: [
      { id: 'user',  kind: 'actor',  x: 78,  y: 90,  label: { zh: '用户提问', en: 'User turn' } },
      { id: 'short', kind: 'memory', x: 262, y: 90,  label: { zh: '短期记忆', en: 'Short-term' }, sub: { zh: '本轮对话上下文', en: 'this conversation' } },
      { id: 'agent', kind: 'agent',  x: 468, y: 90,  label: { zh: 'Agent', en: 'Agent' } },
      { id: 'long',  kind: 'store',  x: 262, y: 245, label: { zh: '长期记忆', en: 'Long-term' }, sub: { zh: '向量数据库', en: 'vector store' } },
      { id: 'out',   kind: 'output', x: 662, y: 90,  label: { zh: '带上下文的回答', en: 'Contextual reply' } }
    ],
    edges: [
      { from: 'user', to: 'short' },
      { from: 'short', to: 'agent' },
      { from: 'long', to: 'agent', label: { zh: '按需检索', en: 'semantic recall' } },
      { from: 'agent', to: 'out' },
      { from: 'agent', to: 'long', label: { zh: '值得记的存进去', en: 'persist what matters' }, bend: -85, dash: true }
    ],
    steps: [
      { edge: 'user->short', say: { zh: '用户说「就订上次那家」。这句话本身信息量极少，全靠记忆才能理解。', en: '"Book the one from last time." The sentence alone carries almost no information — memory has to supply the rest.' } },
      { edge: 'short->agent', say: { zh: '短期记忆先把本轮对话的最近几句一起带上，保证连贯。它的容量受上下文窗口限制，太长就得裁剪或摘要。', en: 'Short-term memory brings the last few turns along for coherence. Its capacity is bounded by the context window, so long histories get trimmed or summarised.' } },
      { edge: 'long->agent', say: { zh: '关键一步：长期记忆按语义检索出「该用户上季度住过海淀希尔顿」。注意它是**按需捞回**的——不是把所有历史都塞进上下文，那样既装不下也会干扰判断。', en: 'The key move: long-term memory semantically retrieves "stayed at the Hilton last quarter". Note it is fetched **on demand** — dumping all history into context would neither fit nor help.' } },
      { edge: 'agent->out', say: { zh: 'Agent 拿着两种记忆一起作答，用户不需要重复任何背景。', en: 'The agent answers with both kinds of memory in hand, and the user repeats nothing.' } },
      { edge: 'agent->long', say: { zh: '这一轮里值得长期保留的新信息（比如「这次要求高楼层」）再写回长期记忆。写什么、写多久，需要你明确设计——尤其涉及隐私时。', en: 'Anything worth keeping from this turn ("wants a high floor") is written back. What gets stored and for how long is a design decision — especially where privacy is involved.' } }
    ]
  },
  code: [
    '# 短期：本轮对话直接进上下文',
    'history.append({"role": "user", "content": msg})',
    '',
    '# 长期：按当前问题去向量库里捞相关片段（不是全捞）',
    'recalled = vector_store.search(msg, top_k=3)',
    '',
    'reply = llm(system + str(recalled) + str(history[-10:]))   # 只带最近 10 轮',
    '',
    '# 值得长期记住的才写回去',
    'if worth_remembering(reply):',
    '    vector_store.add(summarize(msg, reply))'
  ],
  useCases: [
    { zh: '**个人助理**：记住你的日程习惯、常联系人、偏好的会议时长。', en: '**Personal assistants**: your scheduling habits, frequent contacts, preferred meeting length.' },
    { zh: '**客服系统**：调出用户历史工单，不用让人第五次复述同一个问题。', en: '**Support**: pull up past tickets so nobody explains the same issue a fifth time.' },
    { zh: '**长期项目协作**：跨越几周的任务里，记住已经做过的决策和被否掉的方案。', en: '**Long projects**: remember decisions already made and options already rejected.' }
  ],
  quiz: [
    {
      q: { zh: '短期记忆和长期记忆最本质的区别是什么？', en: 'What fundamentally separates short-term from long-term memory?' },
      options: [
        { zh: '短期记忆存文字，长期记忆存图片', en: 'One stores text, the other images' },
        { zh: '短期记忆在上下文窗口里、随会话结束消失；长期记忆存在外部数据库、跨会话持久', en: 'Short-term lives in the context window and ends with the session; long-term lives in an external store and persists' },
        { zh: '短期记忆更准确', en: 'Short-term memory is more accurate' },
        { zh: '长期记忆不需要检索', en: 'Long-term memory needs no retrieval' }
      ],
      answer: 1,
      why: {
        zh: '存放位置和生命周期是分水岭。短期记忆受上下文窗口大小限制、会话一结束就没了；长期记忆放在外部存储里，需要时通过语义检索捞回来。',
        en: 'Location and lifetime are the dividing line. Short-term is bounded by the context window and vanishes with the session; long-term sits in external storage and is recalled semantically when needed.'
      }
    },
    {
      q: { zh: '为什么长期记忆通常用向量数据库而不是普通数据库？', en: 'Why is long-term memory usually a vector database?' },
      options: [
        { zh: '向量数据库更便宜', en: 'Vector databases are cheaper' },
        { zh: '因为要按「意思相近」来找，而不是按关键词精确匹配', en: 'Because recall is by meaning, not exact keyword match' },
        { zh: '因为普通数据库存不下文字', en: 'Ordinary databases cannot store text' },
        { zh: '因为模型只能读向量', en: 'Models can only read vectors' }
      ],
      answer: 1,
      why: {
        zh: '用户问「上次那家酒店」，记忆里存的可能是「海淀希尔顿预订记录」——字面上没有任何一个词重合。Embedding 让「意思接近」变得可计算，这正是普通关键词检索做不到的。',
        en: 'The user says "that hotel from last time" while memory holds "Hilton booking record" — not one word overlaps. Embeddings make closeness of meaning computable, which keyword search cannot do.'
      }
    },
    {
      q: { zh: '关于长期记忆，下面哪个说法是对的？', en: 'Which statement about long-term memory is correct?' },
      options: [
        { zh: '应该把所有历史对话全部塞进上下文，信息越多越好', en: 'Put all past conversation into context — more information is always better' },
        { zh: '应该按当前问题只检索相关片段，无关信息反而会干扰判断', en: 'Retrieve only fragments relevant to the current question; irrelevant recall distracts the model' },
        { zh: '长期记忆不涉及隐私问题', en: 'Long-term memory raises no privacy questions' },
        { zh: '有了长期记忆就不需要短期记忆了', en: 'With long-term memory you no longer need short-term' }
      ],
      answer: 1,
      why: {
        zh: '「按需检索」是关键。上下文窗口装不下全部历史，而且塞太多无关信息会稀释模型的注意力，反而降低回答质量。另外长期存储用户数据必然涉及隐私，得想清楚存什么、怎么删。',
        en: 'On-demand retrieval is the point. The window cannot hold everything, and irrelevant material dilutes the model\'s attention and degrades answers. Persisting user data also unavoidably raises privacy questions about what is kept and how it is deleted.'
      }
    }
  ],
  terms: [
    { en: 'Short-term / Contextual Memory', zh: { zh: '短期记忆 / 上下文记忆', en: 'Short-term memory' }, d: { zh: '保存在 LLM 上下文窗口内的近期交互数据，维持单次对话的连贯性。受窗口大小硬约束。', en: 'Recent interaction data held inside the LLM\'s context window to keep one conversation coherent. Hard-bounded by window size.' } },
    { en: 'Long-term Memory', zh: { zh: '长期记忆', en: 'Long-term memory' }, d: { zh: '存放在外部数据库（通常是向量库）里的持久知识，通过语义检索按需取回。', en: 'Durable knowledge in an external store, usually a vector database, retrieved semantically on demand.' } },
    { en: 'Session / State', zh: { zh: '会话 / 状态', en: 'Session / State' }, d: { zh: 'ADK 的两个概念：Session 是一次对话线程的容器，State 是这次会话里的临时数据。**注意「会话内状态」与「跨会话记忆」是两回事。**', en: 'Two ADK concepts: Session is the container for one conversation thread, State the temporary data within it. **In-session state and cross-session memory are different things.**' } },
    { en: 'MemoryService', zh: { zh: '记忆服务', en: 'MemoryService' }, d: { zh: 'ADK 中对接长期知识库的组件，负责把过往相关信息取回并拼进当前上下文。', en: 'ADK\'s component interfacing with the long-term store, retrieving relevant past information into the current context.' } }
  ],
  refs: [
    { kind: 'docs', title: 'Google ADK — Sessions & Memory', url: 'https://google.github.io/adk-docs/sessions/memory/' },
    { kind: 'docs', title: 'LangGraph — Memory 概念', url: 'https://langchain-ai.github.io/langgraph/concepts/memory/', note: { zh: '含 checkpointer 持久化 State 的做法', en: 'covers persisting State via checkpointers' } },
    { kind: 'docs', title: 'Vertex AI Agent Engine Memory Bank', url: 'https://cloud.google.com/blog/products/ai-machine-learning/vertex-ai-memory-bank-in-public-preview' }
  ],
  related: ['knowledge-retrieval', 'learning-adaptation', 'multi-agent']
},

/* ---------------------------------------------------------- 9 */
{
  id: 'learning-adaptation', num: 9, part: 2, core: false, icon: '🌱',
  pages: '154–166',
  name: { zh: '学习与适应', en: 'Learning and Adaptation' },
  keywords: 'learning adaptation self-improve SICA AlphaEvolve 进化 自我改进',
  oneLiner: {
    zh: '让 Agent 从自己的成败里改进策略，而不是每次都靠人去改提示词。',
    en: 'Let the agent improve its own strategy from what worked and what failed, instead of a human rewriting prompts.'
  },
  analogy: {
    icon: '🎾',
    title: { zh: '会复盘的运动员', en: 'An athlete who reviews the tape' },
    body: {
      zh: '两个球员练同样的时长，一个练完就走，另一个每次看回放、记下哪种发球得分率高，下次调整。半年后差距巨大。**记忆管理**只是把回放存下来，学习与适应是真的**据此改变打法**——这一步才是关键。',
      en: 'Two players train the same hours. One goes home; the other watches the tape, notes which serve scores best, and adjusts. Six months on the gap is huge. Memory only stores the tape; learning and adaptation is actually **changing how you play** — and that step is the whole point.'
    }
  },
  problem: {
    zh: 'Agent 的行为通常被写死在提示词和代码里。碰上设计时没预料到的情况，它表现就会下滑，而且**永远不会自己变好**——只能等人发现问题、手动改提示、重新部署。在快速变化的环境里，这种僵硬会不断累积成失效。',
    en: 'An agent\'s behaviour is normally frozen in prompts and code. Faced with situations nobody anticipated, performance degrades and **it never improves on its own** — a human has to notice, rewrite the prompt and redeploy. In fast-moving environments that rigidity compounds into failure.'
  },
  solution: {
    zh: '给系统加入学习回路：把执行结果、用户反馈、成功失败的记录收集起来，用它们持续调整策略。手段有轻有重——轻的是把有效经验写进长期记忆、动态调整提示；重的是强化学习，甚至像书里举的 SICA（自我改进编码 Agent）那样修改自己的代码。Google 的 AlphaEvolve 则用 **LLM** 加进化算法去搜索全新解法。',
    en: 'Add a learning loop: collect outcomes, user feedback and records of success and failure, then use them to adjust strategy. The methods range from light to heavy — writing what worked into long-term memory and adapting prompts, through reinforcement learning, up to the book\'s SICA (Self-Improving Coding Agent) which rewrites its own code. Google\'s AlphaEvolve pairs an **LLM** with evolutionary search to discover genuinely new solutions.'
  },
  without: {
    zh: '同一个失败重复上演一百次。每次都得工程师去看日志、猜原因、改提示词、重新上线。',
    en: 'The same failure repeats a hundred times, and each round needs an engineer to read logs, guess, tweak the prompt and redeploy.'
  },
  with: {
    zh: 'Agent 记录下「这种问法用工具 A 成功率更高」，下次自动倾向于用 A。人只需要盯着大方向，不必逐条修补。',
    en: 'The agent records that "for this kind of question, tool A succeeds more often" and leans that way next time. Humans watch the direction rather than patching case by case.'
  },
  whenToUse: [
    { zh: '环境会变、用户口味会变，写死的策略很快过时', en: 'The environment and user tastes shift, so a fixed strategy dates quickly' },
    { zh: '需要长期个性化——用得越久越贴合这个用户', en: 'You want personalisation that deepens the longer someone uses it' },
    { zh: '有清晰的成功信号可以学（点击、采纳、任务完成率）', en: 'There is a clear success signal to learn from — clicks, acceptance, completion rate' },
    { zh: '问题空间太大，人工穷举规则不现实', en: 'The problem space is too large to enumerate rules by hand' }
  ],
  whenNotToUse: [
    { zh: '**高风险、强监管**领域：行为会自己变化意味着可审计性变差，医疗金融要慎之又慎', en: '**High-stakes, regulated** domains: self-changing behaviour undermines auditability — be very careful in medicine and finance' },
    { zh: '没有可靠的成功信号——学错方向比不学更糟', en: 'No reliable success signal — learning the wrong lesson is worse than not learning' },
    { zh: '任务简单稳定，写死规则又快又可预测', en: 'The task is simple and stable, and fixed rules are faster and predictable' },
    { zh: '这是全书**工程复杂度最高**的模式之一，先把前八个模式做扎实再说', en: 'This is among the book\'s **most complex** patterns to engineer — get the first eight solid first' }
  ],
  deepDive: [
    { t: { zh: '三档实现，成本和风险差一个数量级', en: 'Three tiers, differing by an order of magnitude in cost and risk' },
      d: { zh: '**最轻**：把成功经验写进长期记忆，下次检索出来放进提示——不改模型、不改代码，随时可回滚，绝大多数场景够用。**中等**：根据统计结果动态调整提示模板、工具优先级或路由阈值——需要评估体系支撑。**最重**：微调模型权重，或像书里的 SICA 那样让 Agent 改自己的代码——威力大但回滚困难、审计困难。**从最轻的一档开始，绝大多数人不需要走到第三档**。',
        en: '**Lightest**: write successful episodes into long-term memory and retrieve them into the prompt — no model change, no code change, instantly reversible, and enough for most cases. **Middle**: adjust prompt templates, tool priorities or routing thresholds from aggregate statistics — requires an evaluation framework underneath. **Heaviest**: fine-tune weights, or let the agent rewrite its own code as the book\'s SICA does — powerful but hard to roll back and hard to audit. **Start at tier one; most people never need tier three.**' } },
    { t: { zh: '反馈回路会自我强化偏见', en: 'Feedback loops amplify their own bias' },
      d: { zh: '这是最危险的失效模式：系统学到「推荐 A 类内容点击率高」，于是多推 A，于是 A 的曝光和点击进一步增加，于是更笃定——但这可能只是因为 B 类内容**从一开始就没被充分展示过**。这在推荐系统里叫**反馈回路偏差**。缓解手段是刻意保留一部分随机探索流量（这正是**探索与发现**里的 explore–exploit 权衡），并定期用未受策略影响的对照组校准。',
        en: 'The most dangerous failure mode: the system learns that category A gets clicks, shows more A, so A\'s impressions and clicks rise further, so it becomes more certain — when the real cause may be that B **was never adequately shown**. Recommenders call this feedback-loop bias. Mitigate by deliberately reserving traffic for random exploration (the explore–exploit trade-off from the exploration pattern) and calibrating periodically against a holdout unaffected by the policy.' } },
    { t: { zh: '在线更新 vs 离线更新', en: 'Online versus offline updating' },
      d: { zh: '**在线**：每次交互后立刻调整策略。反应快，但单条噪声数据就能带偏系统，且行为不可复现，出问题很难定位到是哪次更新造成的。**离线**：攒够一批数据后统一评估、更新、发布。慢但可控——每个版本都能在固定评测集上验证，有问题可以整体回滚。**生产系统绝大多数应该走离线路线**。',
        en: '**Online**: adjust after every interaction. Responsive, but one noisy example can skew the system, behaviour is not reproducible, and tracing a regression to a specific update is near impossible. **Offline**: accumulate a batch, evaluate, update, release. Slower but controllable — each version validates against a fixed eval set and rolls back as a unit. **Production systems should almost always be offline.**' } },
    { t: { zh: '先有评估，才谈得上学习', en: 'No evaluation, no learning' },
      d: { zh: '这是顺序问题，也是很多团队搞反的地方：**没有可靠的评估体系，你根本无法知道「学习」到底让系统变好了还是变坏了**。所以工程上的正确顺序是先建评估与监控（模式 19），有了稳定的指标基线之后再引入学习回路，否则你只是在盲目地改变一个自己看不见的系统。',
        en: 'This is an ordering problem teams routinely get backwards: **without a reliable evaluation framework you cannot tell whether learning improved the system or degraded it**. The correct engineering order is evaluation and monitoring (pattern 19) first, a stable metric baseline second, and only then a learning loop. Otherwise you are blindly perturbing a system you cannot observe.' } }
  ],
  diagram: {
    w: 760, h: 300,
    nodes: [
      { id: 'act',    kind: 'agent',  x: 130, y: 78,  label: { zh: 'Agent 执行', en: 'Agent acts' } },
      { id: 'result', kind: 'world',  x: 330, y: 78,  label: { zh: '真实结果', en: 'Real outcome' }, sub: { zh: '成功 / 失败', en: 'success / failure' } },
      { id: 'signal', kind: 'check',  x: 540, y: 78,  label: { zh: '评估信号', en: 'Signal' }, sub: { zh: '用户是否采纳', en: 'accepted?' } },
      { id: 'learn',  kind: 'memory', x: 540, y: 222, label: { zh: '更新策略', en: 'Update strategy' }, sub: { zh: '经验 / 权重 / 代码', en: 'memory · weights · code' } },
      { id: 'better', kind: 'output', x: 205, y: 222, label: { zh: '下次做得更好', en: 'Better next time' } }
    ],
    edges: [
      { from: 'act', to: 'result' },
      { from: 'result', to: 'signal' },
      { from: 'signal', to: 'learn' },
      { from: 'learn', to: 'better' },
      { from: 'better', to: 'act' }
    ],
    steps: [
      { edge: 'act->result', say: { zh: 'Agent 按当前策略做了一件事，产生了真实后果。', en: 'The agent acts on its current strategy and something really happens.' } },
      { edge: 'result->signal', say: { zh: '关键前提：必须有**可靠的成功信号**。用户采纳了？任务完成了？代码跑通了？没有这个信号，后面全是空谈。', en: 'The precondition: a **reliable success signal**. Did the user accept it? Did the task complete? Did the code run? Without that, everything downstream is guesswork.' } },
      { edge: 'signal->learn', say: { zh: '信号被转成策略更新。轻量做法是把经验写进长期记忆；重的可以是调整权重，甚至像 SICA 那样让 Agent 改自己的代码。', en: 'The signal becomes a strategy update — lightly, by writing the lesson into long-term memory; heavily, by adjusting weights or, as in SICA, letting the agent rewrite its own code.' } },
      { edge: 'learn->better', say: { zh: '更新后的策略改变了 Agent 下一次的行为。注意这是「适应」——学习的结果必须**看得见地改变行为**，否则只是存了一堆日志。', en: 'The updated strategy changes what the agent does next. This is the adaptation half: learning must **visibly change behaviour**, or it is just log storage.' } },
      { edge: 'better->act', say: { zh: '循环闭合，系统从静态变成会随时间变好的。代价是行为不再完全可预测——这正是高风险领域要慎用的原因。', en: 'The loop closes and a static system becomes one that improves over time. The price is behaviour that is no longer fully predictable — exactly why high-stakes domains should be cautious.' } }
    ]
  },
  code: [
    'result = agent.run(task)',
    '',
    '# 必须有客观的成功信号，否则学不到东西',
    'success = user_accepted(result)',
    '',
    'experience.log(task=task, strategy=agent.strategy, success=success)',
    '',
    '# 定期把经验总结成可用的策略调整',
    'if experience.count() % 50 == 0:',
    '    lessons = llm("从这些成败记录里总结规律：" + experience.recent())',
    '    agent.strategy = update(agent.strategy, lessons)'
  ],
  useCases: [
    { zh: '**推荐系统**：根据用户实际点了什么、跳过了什么，不断调整推荐策略。', en: '**Recommenders**: adjust from what users actually clicked and skipped.' },
    { zh: '**自我改进的编码 Agent**：书中的 SICA 会根据自己过往表现修改自己的工具和代码。', en: '**Self-improving coding agents**: the book\'s SICA modifies its own tools and code based on past performance.' },
    { zh: '**算法发现**：AlphaEvolve 用 LLM 加进化算法，搜索出人类没想到的更优解法。', en: '**Algorithm discovery**: AlphaEvolve combines an LLM with evolutionary search to find solutions people had not.' }
  ],
  quiz: [
    {
      q: { zh: '书里区分「学习」和「适应」，「适应」指的是什么？', en: 'The book distinguishes learning from adaptation. What is adaptation?' },
      options: [
        { zh: '收集数据的过程', en: 'The process of collecting data' },
        { zh: '学习之后，Agent 行为或知识上**看得见的改变**', en: 'The **visible change** in the agent\'s behaviour or knowledge that results from learning' },
        { zh: '换一个更大的模型', en: 'Swapping in a bigger model' },
        { zh: '把数据存进数据库', en: 'Writing data into a database' }
      ],
      answer: 1,
      why: {
        zh: '这个区分很实用：只存日志不改行为，等于什么都没发生。适应是学习的落地——策略、提示、工具选择必须真的因此变化，模式才算跑通。',
        en: 'A useful distinction: storing logs without changing behaviour accomplishes nothing. Adaptation is where learning lands — strategy, prompts or tool choice must actually change for the pattern to be working.'
      }
    },
    {
      q: { zh: '实施学习与适应的**前提条件**是什么？', en: 'What is the **precondition** for learning and adaptation?' },
      options: [
        { zh: '有足够大的上下文窗口', en: 'A large enough context window' },
        { zh: '有可靠的成功/失败信号可以学', en: 'A reliable success-or-failure signal to learn from' },
        { zh: '使用最新的模型', en: 'Using the newest model' },
        { zh: '有多个 Agent 协作', en: 'Having several agents collaborate' }
      ],
      answer: 1,
      why: {
        zh: '没有可靠信号，Agent 就不知道自己做得对不对，「学习」只会把噪音固化成偏见，越学越糟。这也是为什么代码生成场景特别适合——测试通过与否是极干净的信号。',
        en: 'Without a reliable signal the agent cannot tell right from wrong, and learning bakes noise into bias. It is also why code generation suits this pattern so well: tests passing is an exceptionally clean signal.'
      }
    },
    {
      q: { zh: '为什么高风险、强监管的领域要慎用这个模式？', en: 'Why be cautious with this pattern in high-stakes, regulated domains?' },
      options: [
        { zh: '因为学习需要太多算力', en: 'Learning needs too much compute' },
        { zh: '因为行为会自行变化，可预测性和可审计性都下降', en: 'Behaviour changes on its own, reducing predictability and auditability' },
        { zh: '因为这些领域没有数据', en: 'Those domains have no data' },
        { zh: '因为模型不支持', en: 'Models do not support it' }
      ],
      answer: 1,
      why: {
        zh: '会自我改变的系统，很难向监管者解释「上个月它为什么这么判断」。医疗、金融、司法这类场景往往要求行为可复现、可解释，这与自主学习天然存在张力。',
        en: 'A self-modifying system is hard to explain to a regulator asking why it decided that way last month. Medicine, finance and law tend to require reproducible, explainable behaviour, which sits in tension with autonomous learning.'
      }
    }
  ],
  terms: [
    { en: 'Adaptation', zh: { zh: '适应', en: 'Adaptation' }, d: { zh: '原书的精确定义：学习之后在 Agent 行为或知识上**可见的改变**。只存日志不改行为，不算适应。', en: 'The book\'s precise definition: the **visible change** in an agent\'s behaviour or knowledge resulting from learning. Logging without behavioural change does not count.' } },
    { en: 'SICA (Self-Improving Coding Agent)', zh: { zh: '自我改进编码 Agent', en: 'Self-improving coding agent' }, d: { zh: '书中重点举例的系统：根据自身过往表现修改自己的代码，由此产生了 Smart Editor、AST Symbol Locator 等工具。', en: 'The book\'s headline example: an agent that modifies its own code from past performance, which produced tools such as a Smart Editor and an AST Symbol Locator.' } },
    { en: 'AlphaEvolve', zh: { zh: 'AlphaEvolve', en: 'AlphaEvolve' }, d: { zh: 'Google 的系统，用 LLM 结合进化算法去发现全新且更高效的解法。奏效前提是评估函数客观且廉价。', en: 'Google\'s system pairing an LLM with evolutionary algorithms to discover genuinely new, more efficient solutions. It works because its evaluator is cheap and objective.' } },
    { en: 'Overseer', zh: { zh: '监督者', en: 'Overseer' }, d: { zh: '原书提到自我改进系统里的一个角色：与专门 sub-agent 配合，帮助系统管理大任务并保持不跑偏。', en: 'A role the book notes in self-improving systems: working with specialised sub-agents to keep large tasks managed and on track.' } }
  ],
  refs: [
    { kind: 'paper', title: 'A Self-Improving Coding Agent (Robeyns et al., 2025)', url: 'https://arxiv.org/pdf/2504.15228', note: { zh: 'SICA 原始论文', en: 'the SICA paper' } },
    { kind: 'code', title: 'SICA — GitHub 实现', url: 'https://github.com/MaximeRobeyns/self_improving_coding_agent' },
    { kind: 'docs', title: 'AlphaEvolve — DeepMind 博客', url: 'https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/' },
    { kind: 'code', title: 'OpenEvolve — 开源实现', url: 'https://github.com/codelion/openevolve' },
    { kind: 'paper', title: 'Proximal Policy Optimization (Schulman et al.)', url: 'https://arxiv.org/abs/1707.06347', note: { zh: '强化学习方向的经典', en: 'a reinforcement-learning classic' } }
  ],
  related: ['memory', 'evaluation', 'exploration']
},

/* ---------------------------------------------------------- 10 */
{
  id: 'mcp', num: 10, part: 2, core: false, icon: '🔌',
  pages: '167–182',
  name: { zh: '模型上下文协议', en: 'Model Context Protocol' },
  alias: { zh: 'MCP', en: 'MCP' },
  keywords: 'mcp protocol standard client server interoperability 协议 标准 接口',
  oneLiner: {
    zh: '给「Agent 怎么接工具」定一个通用标准，就像 USB-C 之于充电线。',
    en: 'A universal standard for how agents plug into tools — USB-C for AI capabilities.'
  },
  analogy: {
    icon: '🔌',
    title: { zh: 'USB-C 接口', en: 'The USB-C port' },
    body: {
      zh: '以前每个设备一种充电口，换个手机就得换一堆线。USB-C 统一之后，任何线配任何设备都能用。**MCP** 干的是同一件事：以前每接一个工具就要写一套专用胶水代码，换个模型还得重写；有了统一协议，工具方按标准暴露能力，任何符合标准的 Agent 都能直接用，而且能**在运行时发现**有哪些工具可用。',
      en: 'Every device used to have its own charger, so a new phone meant new cables. USB-C ended that. **MCP** does the same job: connecting each tool used to mean bespoke glue code, rewritten again for the next model. With one protocol, tool providers expose capabilities to the standard and any compliant agent can use them — and can **discover at run time** what is available.'
    }
  },
  problem: {
    zh: '**Function Calling** 解决了「Agent 能用工具」，但没解决「怎么接」。每接一个新工具都要写一套专用的对接代码，换个模型或框架又得重写一遍。工具一多，这些一次性的胶水代码就成了维护地狱，系统也没法规模化。',
    en: '**Function Calling** answers "can the agent use tools" but not "how do they connect". Each new tool needs bespoke integration code, rewritten again for a different model or framework. Past a certain count that one-off glue becomes a maintenance swamp, and the system stops scaling.'
  },
  solution: {
    zh: '用一个**开放标准**定义清楚：外部能力如何被描述、如何被发现、如何被调用。**MCP** 采用客户端—服务器架构，工具方作为 Server 暴露自己的工具、数据资源和提示模板；Agent 应用作为 Client，可以在运行时动态发现有哪些能力可用，不必重新部署就能接入新工具。生态因此从「一对一定制」变成「一对多复用」。',
    en: 'Define, in an **open standard**, how external capabilities are described, discovered and invoked. **MCP** uses a client–server architecture: tool providers run servers exposing tools, data resources and prompt templates; agent applications act as clients that can discover available capabilities at run time and pick up new tools without redeployment. The ecosystem shifts from bespoke one-to-one wiring to reusable one-to-many.'
  },
  without: {
    zh: '你为 GitHub、Slack、内部数据库各写了一套对接代码。换个框架，三套全部重写。同事想复用你的 Slack 集成？抄代码去吧。',
    en: 'You wrote separate integrations for GitHub, Slack and your database. Change framework and all three get rewritten. A colleague wanting your Slack integration copies your code.'
  },
  with: {
    zh: '这三个服务各自跑一个 MCP Server，任何支持 MCP 的 Agent 直接连上就能用。别人写好的 Server 你也能直接拿来用。',
    en: 'Each service runs an MCP server; any MCP-capable agent connects and uses it. Servers other people wrote work for you unchanged.'
  },
  whenToUse: [
    { zh: '工具数量多且**还在不断增加**', en: 'You have many tools and the list **keeps growing**' },
    { zh: '希望同一套工具能被不同模型、不同框架的 Agent 复用', en: 'You want one tool set reusable across different models and frameworks' },
    { zh: '需要 Agent 在运行时动态发现新能力，而不是每次都重新部署', en: 'Agents should discover new capabilities at run time rather than being redeployed' },
    { zh: '企业级场景：多个团队各自维护自己的工具服务', en: 'Enterprise settings where several teams maintain their own tool services' }
  ],
  whenNotToUse: [
    { zh: '**书里明说**：工具数量固定且少的简单应用，直接用函数调用就够了，上协议是过度工程', en: '**The book says so explicitly**: for simple apps with a few fixed tools, direct function calling is enough and a protocol is over-engineering' },
    { zh: '只有你自己一个人用、也不打算给别人复用的内部小工具', en: 'A private helper nobody else will ever reuse' },
    { zh: '对延迟极度敏感——多一层协议就多一层开销', en: 'Extremely latency-sensitive paths — a protocol layer is another hop' }
  ],
  deepDive: [
    { t: { zh: 'MCP 暴露的三类原语', en: 'The three primitives MCP exposes' },
      d: { zh: '很多人以为 MCP 只是「工具协议」，其实它定义了三类可暴露的东西：**Tools**（可调用的函数，会产生动作）、**Resources**（可读取的数据，如文件、数据库记录，类似 REST 的 GET）、**Prompts**（可复用的提示模板，由服务端定义、客户端调用）。区分 Tool 和 Resource 很重要——前者有副作用需要授权，后者是只读的，安全模型完全不同。',
        en: 'Many take MCP for a tool protocol, but it defines three exposable kinds: **Tools** (callable functions that act), **Resources** (readable data such as files or records, analogous to a REST GET), and **Prompts** (reusable templates defined server-side and invoked by clients). The Tool/Resource split matters: the first has side effects and needs authorisation, the second is read-only, and their security models differ entirely.' } },
    { t: { zh: 'MCP Server 是一道信任边界', en: 'An MCP server is a trust boundary' },
      d: { zh: '这是采用时最该想清楚的安全问题。接入一个第三方 MCP Server，等于允许它向你的模型上下文注入内容——**恶意或被攻陷的 Server 可以在返回的数据里夹带提示注入**，诱导你的 Agent 执行非预期操作。所以第三方 Server 应当按不可信输入对待：过滤返回内容、限制它能触发的下游能力、并记录完整调用日志。',
        en: 'The security question to settle before adopting. Connecting a third-party MCP server means letting it inject content into your model\'s context — **a malicious or compromised server can smuggle prompt injection inside returned data** and steer your agent into unintended actions. Treat third-party servers as untrusted input: filter what comes back, limit the downstream capabilities they can trigger, and log every call.' } },
    { t: { zh: '传输层：stdio 与 HTTP 的选择', en: 'Transport: stdio versus HTTP' },
      d: { zh: 'MCP 支持多种传输方式。**stdio** 用于本地进程——Server 作为子进程启动，通过标准输入输出通信，延迟最低且天然隔离在本机，适合访问本地文件和开发工具。**HTTP/SSE** 用于远程服务——可跨机器、可多客户端共享、但要处理认证和网络故障。选哪个主要看 Server 需要访问的资源在哪里。',
        en: 'MCP supports several transports. **stdio** suits local processes — the server runs as a child process communicating over standard streams, giving the lowest latency and natural machine-local isolation, which fits local files and dev tooling. **HTTP/SSE** suits remote services — cross-machine, shareable across clients, but you handle authentication and network failure. Choose by where the resources the server needs actually live.' } },
    { t: { zh: '什么时候「多此一举」', en: 'When it really is over-engineering' },
      d: { zh: '一个判断标准：如果你的工具**只被一个 Agent 使用、且不打算换模型或框架**，那 MCP 带来的解耦收益你一分也享受不到，只多了一层进程通信和序列化开销。收益出现在**复用维度大于 1** 的时候——多个 Agent 用同一个工具，或同一个 Agent 要换底层模型。先算清楚这个维度再决定。',
        en: 'A useful test: if your tools are **used by exactly one agent and you have no plan to change model or framework**, you capture none of MCP\'s decoupling benefit and pay a process-communication and serialisation hop for nothing. The benefit appears when the **reuse dimension exceeds one** — several agents sharing a tool, or one agent expecting to change models. Work that out before adopting.' } }
  ],
  diagram: {
    w: 760, h: 325,
    nodes: [
      { id: 'agent', kind: 'agent',  x: 120, y: 155, label: { zh: 'Agent 应用', en: 'Agent app' }, sub: 'MCP Client' },
      { id: 'proto', kind: 'gate',   x: 335, y: 155, label: { zh: 'MCP 统一协议', en: 'MCP protocol' }, sub: { zh: '发现 · 描述 · 调用', en: 'discover · call' }, w: 130 },
      { id: 's1',    kind: 'tool',   x: 578, y: 55,  label: { zh: 'GitHub Server', en: 'GitHub server' } },
      { id: 's2',    kind: 'store',  x: 578, y: 155, label: { zh: '数据库 Server', en: 'Database server' } },
      { id: 's3',    kind: 'tool',   x: 578, y: 255, label: { zh: 'Slack Server', en: 'Slack server' } }
    ],
    edges: [
      { from: 'agent', to: 'proto' },
      { from: 'proto', to: 's1' }, { from: 'proto', to: 's2' }, { from: 'proto', to: 's3' },
      { from: 's2', to: 'agent', label: { zh: '按标准格式返回', en: 'standard result' }, bend: -100 }
    ],
    steps: [
      { edge: 'agent->proto', say: { zh: 'Agent 作为 Client 连上协议层。它不需要知道每个工具的私有接口长什么样——这正是标准化的意义。', en: 'The agent connects as a client. It never needs to know each tool\'s private interface — that is what standardisation buys.' } },
      { edges: ['proto->s1', 'proto->s2', 'proto->s3'], say: { zh: '协议层向各个 Server 询问「你都有什么能力」。注意这是**运行时发现**：新上线一个 Server，Agent 不用重新部署就能发现并使用它。', en: 'The protocol asks each server what it can do. This is **run-time discovery**: a newly deployed server becomes usable without redeploying the agent.' } },
      { edge: 'proto->s2', say: { zh: 'Agent 决定要查数据库，通过统一协议发起调用。换成另一个模型或框架，这段调用完全不用改。', en: 'The agent decides to query the database and calls through the protocol. Swap the model or framework and this call is unchanged.' } },
      { edge: 's2->agent', say: { zh: '结果按标准格式返回。整套机制让工具从「一次性胶水代码」变成「可复用的组件」——别人写的 Server 你也能直接用。', en: 'The result comes back in the standard shape. Tools stop being one-off glue and become reusable components — including servers other people wrote.' } }
    ]
  },
  code: [
    '# 工具方：把能力按 MCP 标准暴露出去',
    'server = MCPServer("github")',
    '',
    '@server.tool()',
    'def list_issues(repo: str) -> list:',
    '    """列出仓库的开放 issue。"""',
    '    return gh.issues(repo)',
    '',
    '# Agent 方：连上就能用，还能在运行时发现有哪些工具',
    'client = MCPClient.connect("github")',
    'tools  = client.discover()      # 不用重新部署就能拿到新工具'
  ],
  useCases: [
    { zh: '**企业工具中台**：各团队把自己的服务包成 MCP Server，全公司的 Agent 都能复用。', en: '**Internal tool platforms**: teams wrap services as MCP servers that every agent in the company can reuse.' },
    { zh: '**开发者工具链**：让编码 Agent 统一接入 Git、CI、issue 系统、文档库。', en: '**Developer tooling**: one way for coding agents to reach Git, CI, issues and docs.' },
    { zh: '**可替换的模型层**：底层模型从 A 换到 B，上层工具接入完全不用动。', en: '**Swappable models**: change the underlying model and the tool wiring stays untouched.' }
  ],
  quiz: [
    {
      q: { zh: 'MCP 相对于直接写函数调用，最主要的优势是？', en: 'What does MCP mainly add over plain function calling?' },
      options: [
        { zh: '执行速度更快', en: 'Faster execution' },
        { zh: '标准化和互操作：工具可跨模型、跨框架复用，还能运行时发现', en: 'Standardisation and interoperability: tools are reusable across models and frameworks, and discoverable at run time' },
        { zh: '模型准确率更高', en: 'Higher model accuracy' },
        { zh: '不需要写工具描述了', en: 'You no longer write tool descriptions' }
      ],
      answer: 1,
      why: {
        zh: 'MCP 解决的是**工程规模化**问题，不是性能问题。它让工具从一次性胶水代码变成可复用组件，代价是多一层协议开销——所以工具少的时候并不划算。',
        en: 'MCP addresses **engineering scale**, not speed. It turns glue code into reusable components, at the cost of a protocol layer — which is why it does not pay off with only a few tools.'
      }
    },
    {
      q: { zh: '书里明确说什么情况下**不必**上 MCP？', en: 'When does the book explicitly say MCP is **unnecessary**?' },
      options: [
        { zh: '任何情况下都应该用 MCP', en: 'Always use MCP' },
        { zh: '工具数量固定且少的简单应用，直接函数调用就够了', en: 'Simple apps with a few fixed tools — direct function calling suffices' },
        { zh: '只有在使用 Google 模型时', en: 'Only when using Google models' },
        { zh: '只有在处理图片时', en: 'Only when handling images' }
      ],
      answer: 1,
      why: {
        zh: '书里原话就是「对于功能固定且有限的简单应用，直接的工具函数调用可能就足够了」。这是很好的提醒：模式是用来解决具体问题的，没有那个问题就别引入复杂度。',
        en: 'The book says as much: for simple applications with a fixed, limited set of functions, direct tool calling may be enough. A good reminder that patterns solve specific problems — without the problem, skip the complexity.'
      }
    },
    {
      q: { zh: 'MCP 采用的是什么架构？', en: 'What architecture does MCP use?' },
      options: [
        { zh: '点对点架构，每个 Agent 直连每个工具', en: 'Peer-to-peer — every agent wires directly to every tool' },
        { zh: '客户端—服务器架构：工具方作 Server 暴露能力，Agent 应用作 Client', en: 'Client–server — tool providers expose capabilities as servers, agent apps are clients' },
        { zh: '区块链架构', en: 'A blockchain' },
        { zh: '单体架构', en: 'A monolith' }
      ],
      answer: 1,
      why: {
        zh: '客户端—服务器的好处是解耦：Server 只管按标准暴露能力，不关心谁来用；Client 只管按标准发现和调用，不关心对面怎么实现。双方可以各自独立演进。',
        en: 'Client–server decouples the two sides: a server exposes capabilities to the standard without caring who calls; a client discovers and invokes to the standard without caring how it is implemented. Each evolves independently.'
      }
    }
  ],
  terms: [
    { en: 'Client–Server Architecture', zh: { zh: '客户端—服务器架构', en: 'Client–server architecture' }, d: { zh: 'MCP 的基础结构：工具方作为 Server 暴露能力，LLM 应用作为 Client 消费它们，双方可独立演进。', en: 'MCP\'s underlying structure: tool providers expose capabilities as servers, LLM applications consume them as clients, and each side evolves independently.' } },
    { en: 'Tools / Resources / Prompts', zh: { zh: 'MCP 的三类原语', en: 'The three MCP primitives' }, d: { zh: 'MCP 可暴露的三种东西：Tools（有副作用的可调用函数）、Resources（只读数据）、Prompts（服务端定义的可复用提示模板）。**Tool 与 Resource 的安全模型完全不同。**', en: 'The three exposable kinds: Tools (callable, side-effecting), Resources (read-only data) and Prompts (reusable server-defined templates). **Tools and Resources have entirely different security models.**' } },
    { en: 'Dynamic Discovery', zh: { zh: '动态发现', en: 'Dynamic discovery' }, d: { zh: 'Client 在运行时查询有哪些能力可用，使 Agent 无需重新部署就能接入新上线的工具。', en: 'A client querying available capabilities at run time, so agents pick up newly deployed tools without redeployment.' } },
    { en: 'Interoperability', zh: { zh: '互操作性', en: 'Interoperability' }, d: { zh: 'MCP 的核心价值主张：同一套工具可被不同 LLM、不同框架的 Agent 复用，把一次性胶水代码变成可复用组件。', en: 'MCP\'s core value: one tool set reusable across different LLMs and frameworks, turning one-off glue into reusable components.' } }
  ],
  refs: [
    { kind: 'docs', title: 'Model Context Protocol — ADK 文档', url: 'https://google.github.io/adk-docs/mcp/' },
    { kind: 'code', title: 'FastMCP — 快速搭建 MCP Server', url: 'https://github.com/jlowin/fastmcp', note: { zh: '想自己写一个 Server 从这里开始', en: 'start here to write your own server' } },
    { kind: 'docs', title: 'MCP Toolbox for Databases', url: 'https://google.github.io/adk-docs/mcp/databases/' }
  ],
  related: ['tool-use', 'inter-agent-communication', 'multi-agent']
},

/* ---------------------------------------------------------- 11 */
{
  id: 'goal-setting', num: 11, part: 2, core: false, icon: '🎯',
  pages: '183–195',
  name: { zh: '目标设定与监控', en: 'Goal Setting and Monitoring' },
  keywords: 'goal monitoring smart metrics success criteria 目标 监控 验收',
  oneLiner: {
    zh: '给 Agent 一个可衡量的目标，再给它一把尺子随时量自己离目标还有多远。',
    en: 'Give the agent a measurable goal, and a ruler to keep checking how far off it still is.'
  },
  analogy: {
    icon: '🧭',
    title: { zh: '导航而不是指路', en: 'Navigation, not directions' },
    body: {
      zh: '别人给你指路：「前面右转，再直走」——走错了你不知道。而导航知道你的**目的地**，随时对比当前位置和目标，一偏航就立刻重新规划。差别不在于谁更懂路，而在于导航手里同时握着「目标」和「当前状态」，因此能自己发现走错了。',
      en: 'Someone giving directions says "right at the lights, then straight on" — take a wrong turn and you will not know. A satnav knows your **destination**, constantly compares where you are against it, and re-routes the moment you drift. The difference is not route knowledge: the satnav holds both the goal and the current state, so it can notice its own mistakes.'
    }
  },
  problem: {
    zh: '**规划**让 Agent 能拆出步骤，但它常常缺一样东西：判断「我到底做成了没有」的标准。任务被执行完了不等于目标达成了。没有明确的成功标准和监控机制，Agent 既不知道自己跑偏了，也不知道什么时候该停。',
    en: 'Planning lets an agent produce steps, but something is usually missing: any way to judge whether it actually succeeded. Steps completed is not the same as goal achieved. Without explicit success criteria and monitoring, the agent neither notices drift nor knows when to stop.'
  },
  solution: {
    zh: '把目标**显式写出来并且可衡量**——书里用了 SMART 原则：具体、可衡量、可达成、相关、有时限。同时建立监控机制，持续对比「当前状态」和「目标状态」。两者之间的差距形成反馈回路：偏离了就纠正，计划不行就改，实在搞不定就上报给人。Agent 从被动执行变成主动奔着目标去。',
    en: 'State the goal **explicitly and measurably** — the book invokes SMART: specific, measurable, achievable, relevant, time-bound. Then monitor continuously, comparing current state against goal state. The gap between them is a feedback loop: correct on drift, revise the plan when it fails, escalate to a human when stuck. The agent stops executing and starts pursuing.'
  },
  without: {
    zh: 'Agent 说「任务已完成」，你一看结果根本不对——它执行完了所有步骤，但从没检查过这些步骤是否真的达成了目标。',
    en: 'The agent reports "task complete" and the result is wrong. It finished every step and never once checked whether the steps achieved the goal.'
  },
  with: {
    zh: 'Agent 自己发现「已生成的报告缺少竞品 C 的数据，不满足『覆盖全部三家竞品』这条标准」，于是回头补上，然后才宣布完成。',
    en: 'The agent notices "the report lacks data on competitor C, so it fails the all-three-competitors criterion", goes back for it, and only then reports done.'
  },
  whenToUse: [
    { zh: 'Agent 要**自主**跑完多步任务，中途没人盯着', en: 'The agent runs a multi-step task **autonomously**, unsupervised' },
    { zh: '成功与否有客观标准可以写清楚', en: 'Success has criteria you can write down objectively' },
    { zh: '环境会变化，需要 Agent 自己发现偏离并纠正', en: 'Conditions change and the agent should catch and correct drift itself' },
    { zh: '长时间运行的任务，需要知道什么时候该停、什么时候该求助', en: 'Long-running work that needs to know when to stop and when to ask for help' }
  ],
  whenNotToUse: [
    { zh: '目标本身难以量化（「写得优美一点」）——硬定指标会逼出钻空子的行为', en: 'The goal resists measurement ("make it more elegant") — forcing a metric invites gaming it' },
    { zh: '单步任务，做完就是做完，不需要额外的监控层', en: 'Single-step work: done is done, and a monitoring layer adds nothing' },
    { zh: '**当心指标错位**：Agent 会优化你写下的指标，而不是你心里想要的东西', en: '**Beware misaligned metrics**: the agent optimises the metric you wrote, not the outcome you meant' }
  ],
  deepDive: [
    { t: { zh: '古德哈特定律：指标一旦成为目标就不再是好指标', en: 'Goodhart\'s law: a measure that becomes a target stops being a good measure' },
      d: { zh: '把「报告要覆盖三家竞品」写成硬指标，Agent 可能塞三个名字进去就宣告达标，内容却空洞。这不是 Agent 在作弊，是**你写下的指标和你真正想要的东西之间有缝隙**，而优化过程一定会钻进这个缝隙。缓解手段：指标要覆盖多个维度而非单一数字、混入难以被机械满足的质量项、并定期人工抽查指标达标但实际不合格的样本。',
        en: 'Make "cover three competitors" a hard target and the agent may insert three names and declare success while the content stays hollow. That is not cheating — it is the **gap between the metric you wrote and the outcome you meant**, and optimisation will find that gap every time. Mitigate with multi-dimensional criteria rather than one number, quality terms that resist mechanical satisfaction, and periodic human spot-checks of samples that passed but should not have.' } },
    { t: { zh: '三类终止条件缺一不可', en: 'Three kinds of termination condition, all required' },
      d: { zh: '任何自主循环都必须同时具备：**成功终止**（目标达成，正常退出）、**资源终止**（超出轮数、时间或 token 预算，强制停止）、**失败终止**（判定为无法达成，上报给人）。只写成功条件的系统，遇到永远达不到目标的情况会无限循环烧钱；只写资源上限的系统，会在预算耗尽时静默交付一个半成品而不告诉任何人。',
        en: 'Any autonomous loop needs all three: **success termination** (goal met, exit normally), **resource termination** (round, time or token budget exceeded, stop by force), and **failure termination** (judged unachievable, escalate). A system with only a success condition loops and burns money on unreachable goals; one with only a budget cap silently ships a half-finished result when the budget runs out.' } },
    { t: { zh: '监控的三个对象', en: 'Three things monitoring watches' },
      d: { zh: '书里说得很具体：监控要覆盖 **Agent 自己的动作**（它在做什么、有没有偏离计划）、**环境状态**（外部条件是否变了，原来的假设还成立吗）、**工具输出**（返回的数据是否合理，有没有静默失败）。很多实现只监控最后的结果，等于只在终点检查——**过程中的偏离被发现得越晚，纠正成本越高**。',
        en: 'The book is specific: monitoring covers **the agent\'s own actions** (what it is doing, whether it drifted from plan), **environment state** (have external conditions changed, do the original assumptions hold), and **tool outputs** (is the returned data plausible, did something fail silently). Many implementations watch only the final result, which is checking at the finish line — **the later a deviation is caught, the more it costs to correct**.' } },
    { t: { zh: '和「评估与监控」的分工', en: 'How this differs from evaluation and monitoring' },
      d: { zh: '两个模式名字相近但层次不同。**目标设定与监控是运行时的自我校正**：这一次任务有没有达成目标，没达成就当场纠正——作用范围是单次执行。**评估与监控（模式 19）是跨运行的系统健康度**：这个 Agent 最近一周整体表现如何，有没有漂移——作用范围是统计分布。前者让单次任务做对，后者让系统长期不退化。',
        en: 'Similar names, different layers. **Goal setting and monitoring is run-time self-correction**: did this task meet its goal, and if not, fix it now — scoped to a single execution. **Evaluation and monitoring (pattern 19) is cross-run system health**: how has this agent performed this week, has it drifted — scoped to a statistical distribution. The first gets one task right; the second keeps the system from decaying.' } }
  ],
  diagram: {
    w: 770, h: 305,
    nodes: [
      { id: 'goal',  kind: 'plan',     x: 112, y: 76,  label: { zh: '明确目标', en: 'Explicit goal' }, sub: { zh: '可衡量 SMART', en: 'measurable' } },
      { id: 'act',   kind: 'agent',    x: 320, y: 76,  label: { zh: 'Agent 执行', en: 'Agent acts' } },
      { id: 'mon',   kind: 'check',    x: 530, y: 76,  label: { zh: '监控对比', en: 'Monitor' }, sub: { zh: '现状 vs 目标', en: 'state vs goal' } },
      { id: 'fix',   kind: 'decision', x: 530, y: 226, label: { zh: '有差距就纠正', en: 'Correct the gap' } },
      { id: 'done',  kind: 'output',   x: 692, y: 226, label: { zh: '达标才收工', en: 'Done when met' } },
      { id: 'human', kind: 'human',    x: 300, y: 226, label: { zh: '搞不定就上报', en: 'Escalate' } }
    ],
    edges: [
      { from: 'goal', to: 'act' },
      { from: 'act', to: 'mon' },
      { from: 'mon', to: 'fix' },
      { from: 'fix', to: 'act', label: { zh: '调整计划', en: 'revise' }, bend: 58 },
      { from: 'fix', to: 'done' },
      { from: 'fix', to: 'human', dash: true }
    ],
    steps: [
      { edge: 'goal->act', say: { zh: '先把目标写成可衡量的形式：不是「做个竞品分析」，而是「覆盖三家竞品、每家含营收和市占率、本周内完成」。', en: 'State the goal measurably: not "do a competitive analysis" but "cover three competitors, each with revenue and market share, by Friday".' } },
      { edge: 'act->mon', say: { zh: 'Agent 执行的同时，监控机制一直在跑，观察它的动作、工具返回和环境状态。', en: 'While the agent works, monitoring runs alongside, watching its actions, tool outputs and the state of the environment.' } },
      { edge: 'mon->fix', say: { zh: '核心是**对比**：当前结果离目标还差什么？发现「只覆盖了两家竞品」，差距就出来了。这一步靠的正是前面写清楚的可衡量标准。', en: 'The core move is **comparison**: what is still missing? It finds only two competitors covered, and the gap is explicit — which only works because the criteria were written down measurably.' } },
      { edge: 'fix->act', say: { zh: '有差距就纠正：补上缺的部分，或者干脆修改计划。这就是反馈回路。', en: 'A gap triggers correction: fill what is missing, or revise the plan outright. That is the feedback loop.' } },
      { edge: 'fix->human', say: { zh: '如果反复尝试仍达不到目标，Agent 应该**主动上报给人**，而不是无限重试或谎报完成。', en: 'If repeated attempts still miss, the agent should **escalate to a human** rather than retry forever or falsely claim success.' } },
      { edge: 'fix->done', say: { zh: '只有全部标准都满足了才宣布完成。「执行完了」和「达成了」是两回事——这个模式存在的全部意义就在这句话里。', en: 'Only when every criterion is met is it done. "Steps finished" and "goal achieved" are different things — which is the entire reason this pattern exists.' } }
    ]
  },
  code: [
    '# 目标写成可以程序化检查的形式',
    'goal = {"competitors": 3, "fields": ["revenue", "market_share"]}',
    '',
    'for attempt in range(5):',
    '    result = agent.run(task)',
    '',
    '    gap = check_against(result, goal)    # 监控：现状 vs 目标',
    '    if not gap:',
    '        return result                    # 达标才算完成',
    '',
    '    task = llm("还差这些：" + str(gap) + "，请补充")',
    '',
    'escalate_to_human(result, gap)           # 反复不达标就交给人'
  ],
  useCases: [
    { zh: '**自动化报告**：定义好必须覆盖的章节和数据点，Agent 自查补齐后才交付。', en: '**Automated reports**: define required sections and data points; the agent self-checks and fills gaps before delivering.' },
    { zh: '**运维 Agent**：目标是「服务恢复正常」，持续监控指标，没恢复就继续处置并最终上报。', en: '**Ops agents**: the goal is "service healthy again"; keep monitoring, keep acting, escalate if not.' },
    { zh: '**数据清洗**：目标是「缺失率低于 1%」，Agent 反复处理直到指标达标。', en: '**Data cleaning**: target "under 1% missing"; keep iterating until the metric is met.' }
  ],
  quiz: [
    {
      q: { zh: '这个模式解决的核心问题是什么？', en: 'What core problem does this pattern solve?' },
      options: [
        { zh: '让 Agent 跑得更快', en: 'Making the agent faster' },
        { zh: '让 Agent 能判断自己是否真的达成了目标，而不只是执行完了步骤', en: 'Letting the agent tell whether it achieved the goal, not merely finished the steps' },
        { zh: '减少 token 消耗', en: 'Reducing token spend' },
        { zh: '让 Agent 支持更多语言', en: 'Supporting more languages' }
      ],
      answer: 1,
      why: {
        zh: '「执行完了」≠「达成了」。规划模式负责拆步骤，这个模式负责验收。没有验收标准，Agent 会理直气壮地交付一个不合格的结果。',
        en: 'Finished is not achieved. Planning produces the steps; this pattern provides acceptance. Without criteria, an agent will confidently deliver something that does not meet the brief.'
      }
    },
    {
      q: { zh: 'SMART 原则要求目标必须是？', en: 'The SMART principle requires goals to be:' },
      options: [
        { zh: '简短、现代、抽象、真实、透明', en: 'Short, modern, abstract, real, transparent' },
        { zh: '具体、可衡量、可达成、相关、有时限', en: 'Specific, measurable, achievable, relevant, time-bound' },
        { zh: '安全、可维护、自动、可复用、可测试', en: 'Safe, maintainable, automatic, reusable, testable' },
        { zh: '简单、快速、准确、可靠、便宜', en: 'Simple, fast, accurate, reliable, cheap' }
      ],
      answer: 1,
      why: {
        zh: '其中「可衡量」对 Agent 系统尤其关键——目标必须能被程序检查，监控机制才有东西可对比。「写得优美一点」这种目标无法监控，也就无法自动纠偏。',
        en: 'Measurable matters most here: the goal must be checkable in code for monitoring to have anything to compare against. "Make it more elegant" cannot be monitored, so it cannot be self-corrected.'
      }
    },
    {
      q: { zh: '书里提到，当 Agent 反复尝试仍无法达成目标时，正确做法是？', en: 'When repeated attempts still miss the goal, what should the agent do?' },
      options: [
        { zh: '无限重试直到成功', en: 'Retry indefinitely' },
        { zh: '直接宣布完成，避免流程卡住', en: 'Declare success so the flow does not stall' },
        { zh: '上报给人类处理', en: 'Escalate to a human' },
        { zh: '自动降低目标标准', en: 'Quietly lower the bar' }
      ],
      answer: 2,
      why: {
        zh: '知道什么时候该求助，是自主系统成熟的标志。无限重试会烧钱，谎报完成会造成更大的下游损失，偷偷降标准则会让人失去对系统的信任。',
        en: 'Knowing when to ask for help marks a mature autonomous system. Infinite retries burn money, false success causes worse downstream damage, and silently lowering the bar destroys trust.'
      }
    }
  ],
  terms: [
    { en: 'SMART Goals', zh: { zh: 'SMART 目标', en: 'SMART goals' }, d: { zh: '原书引用的目标设定框架：Specific（具体）、Measurable（可衡量）、Achievable（可达成）、Relevant（相关）、Time-bound（有时限）。对 Agent 而言「可衡量」最关键。', en: 'The framework the book cites: specific, measurable, achievable, relevant, time-bound. For agents, measurable is the load-bearing one.' } },
    { en: 'Success Criteria / Metrics', zh: { zh: '成功标准与指标', en: 'Success criteria / metrics' }, d: { zh: '判定目标是否达成的明确依据。没有它，监控机制就没有可对比的对象，Agent 也就无法自我纠偏。', en: 'The explicit basis for judging achievement. Without it monitoring has nothing to compare against and the agent cannot self-correct.' } },
    { en: 'Feedback Loop', zh: { zh: '反馈回路', en: 'Feedback loop' }, d: { zh: '监控发现「现状与目标」的差距后驱动纠正的闭环，让 Agent 从被动执行者变成主动追求目标者。', en: 'The closed loop where monitoring finds the gap between state and goal and drives correction, turning an executor into a pursuer.' } },
    { en: 'Escalation', zh: { zh: '上报', en: 'Escalation' }, d: { zh: '反复尝试仍无法达成目标时主动交给人类处理。原书把它与「无限重试」和「谎报完成」明确区分开。', en: 'Handing over to a human when repeated attempts still miss. The book distinguishes it sharply from retrying forever or falsely claiming success.' } }
  ],
  refs: [
    { kind: 'docs', title: 'SMART criteria — 概述', url: 'https://en.wikipedia.org/wiki/SMART_criteria', note: { zh: '原书引用的目标设定框架', en: 'the goal framework the book cites' } },
    { kind: 'docs', title: 'Google ADK — Evaluate', url: 'https://google.github.io/adk-docs/evaluate/', note: { zh: '把成功标准写成可自动检查的形式', en: 'expressing success criteria as automated checks' } }
  ],
  related: ['planning', 'human-in-the-loop', 'evaluation', 'exception-handling']
}

);
