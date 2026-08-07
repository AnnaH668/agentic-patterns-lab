/* ============================================================
   glossary.js — hover/tap explanations for jargon.
   Key = the exact string as it appears in the copy.
   ============================================================ */
window.GLOSSARY = {
  'LLM': {
    zh: '大语言模型（Large Language Model）。就是 GPT、Gemini、Claude 这类会「续写文字」的模型，是 Agent 的大脑。',
    en: 'Large Language Model — the text-predicting brain (GPT, Gemini, Claude) an agent is built around.'
  },
  'Agent': {
    zh: '智能体。能自己决定「下一步做什么」并调用工具去做的 AI 程序，而不只是被动回答一句话。',
    en: 'An AI program that decides what to do next and acts on it, rather than only answering one question.'
  },
  'Prompt': {
    zh: '提示词。你发给模型的那段指令文字，决定了模型这一步该干什么。',
    en: 'The instruction text you send the model — it defines what this one step should do.'
  },
  'Token': {
    zh: '模型处理文字的最小单位，大约相当于半个中文词或一小截英文单词。计费和长度限制都按它算。',
    en: 'The unit a model reads and bills by — roughly a word-piece.'
  },
  'Context Window': {
    zh: '上下文窗口。模型一次能「看见」的文字总量上限，超了就得丢掉一部分内容。',
    en: 'The maximum amount of text a model can see at once; past that, something has to be dropped.'
  },
  'JSON': {
    zh: '一种结构化数据格式，像带标签的表格。让模型输出 JSON，下一步程序才好精确解析。',
    en: 'A structured data format. Asking the model for JSON makes its output safe to parse.'
  },
  'API': {
    zh: '程序之间互相调用的接口。查天气、发邮件、读数据库，都是通过它。',
    en: 'The interface one program calls another through — weather, email, databases.'
  },
  'Function Calling': {
    zh: '函数调用。模型不直接执行代码，而是输出一个「我要调用哪个函数、参数是什么」的结构化请求，由外层程序去真正执行。',
    en: 'The model emits a structured "call this function with these arguments" request; your code actually runs it.'
  },
  'Latency': {
    zh: '延迟。从你发出请求到拿到结果之间的等待时间。',
    en: 'The wait between sending a request and getting the result.'
  },
  'Hallucination': {
    zh: '幻觉。模型一本正经地编出不存在的事实。信息不足或任务太重时尤其容易发生。',
    en: 'When a model confidently invents facts — most likely when it lacks information or is overloaded.'
  },
  'Orchestration': {
    zh: '编排。负责决定各个步骤、工具、Agent 按什么顺序被调用的那层逻辑。',
    en: 'The layer deciding what runs in which order — steps, tools, agents.'
  },
  'Embedding': {
    zh: '把一段文字转换成一串数字（向量），意思相近的文字数字也相近，用来做语义搜索和判重。',
    en: 'Text turned into numbers so that similar meanings land close together — used for semantic search.'
  },
  'RAG': {
    zh: '检索增强生成（Retrieval-Augmented Generation）。先去知识库里搜相关资料，再把资料塞给模型让它照着答，能大幅减少瞎编。',
    en: 'Retrieval-Augmented Generation — fetch relevant documents first, then let the model answer from them.'
  },
  'MCP': {
    zh: '模型上下文协议（Model Context Protocol）。一套让 Agent 以统一方式接入各种外部工具和数据源的开放标准。',
    en: 'Model Context Protocol — an open standard for plugging agents into external tools and data uniformly.'
  },
  'A2A': {
    zh: 'Agent 之间通信的协议（Agent-to-Agent），让不同团队、不同框架做的 Agent 也能互相协作。',
    en: 'Agent-to-Agent communication — lets agents from different teams and frameworks work together.'
  },
  'LangChain': {
    zh: '最流行的 Agent 开发框架之一，提供把提示、模型、工具串起来的现成积木。',
    en: 'A popular framework providing ready-made building blocks for chaining prompts, models and tools.'
  },
  'LangGraph': {
    zh: 'LangChain 的图结构版本，用「节点 + 状态」来描述带循环和分支的复杂流程。',
    en: 'LangChain\'s graph flavour — nodes plus shared state, for flows with branches and loops.'
  },
  'CrewAI': {
    zh: '一个专注多 Agent 协作的框架，用「角色 + 任务」的方式组织一支 Agent 团队。',
    en: 'A framework for multi-agent work, organised around roles and tasks.'
  },
  'ADK': {
    zh: 'Google 的 Agent Development Kit，书中大量示例用的就是它。',
    en: 'Google\'s Agent Development Kit — the framework most examples in the book use.'
  },
  'Chain-of-Thought': {
    zh: '思维链。让模型把推理过程一步步写出来再给答案，复杂题目上准确率明显更高。',
    en: 'Have the model write out its reasoning step by step before answering — markedly better on hard problems.'
  },
  'ReAct': {
    zh: '一种「边想边做」的循环：思考 → 调用工具 → 看结果 → 再思考，直到解决问题。',
    en: 'A think-act-observe loop: reason, call a tool, read the result, reason again.'
  },
  'Guardrail': {
    zh: '护栏。在输入进模型前和输出给用户前加的安全检查，挡住有害、越权或跑题的内容。',
    en: 'Safety checks before input reaches the model and before output reaches the user.'
  },
  'Fine-tuning': {
    zh: '微调。用你自己的数据继续训练模型，改变它的「本能」。比写提示词贵得多，但效果更持久。',
    en: 'Continuing to train a model on your own data — far costlier than prompting, but it sticks.'
  },
  'Vector Database': {
    zh: '向量数据库。专门存 Embedding 的数据库，能快速找出「意思最接近」的内容。',
    en: 'A database of embeddings that can quickly find the closest meanings.'
  },
  'Sub-agent': {
    zh: '子 Agent。被主 Agent 调用来负责某一小块工作的专门 Agent。',
    en: 'A specialised agent invoked by a main agent to handle one slice of the work.'
  },
  'In-Context Learning': {
    zh: '上下文学习。模型仅凭提示里给的示例就学会一个新任务、不需要重新训练。这是 Few-Shot 之所以有效的底层机制。',
    en: 'Learning a new task purely from examples in the prompt, with no retraining — the mechanism behind few-shot.'
  },
  'Few-Shot': {
    zh: '少样本提示。在提示里给几个任务示例来引导模型，尤其适合传达难以用语言描述的格式和风格要求。',
    en: 'Giving a few worked examples in the prompt — especially good for format and style, which are hard to describe in words.'
  },
  'Zero-Shot': {
    zh: '零样本提示。不给任何示例，直接下指令。最省 token，但对格式和风格的控制最弱。',
    en: 'No examples, just the instruction. Cheapest in tokens, weakest control over format and style.'
  },
  'Multimodality': {
    zh: '多模态。模型能同时处理文字、图像、音频等多种输入，这决定了 Agent 能不能处理截图、表单、录音这类真实输入。',
    en: 'Handling text, images and audio together — what decides whether an agent can take screenshots, forms and recordings.'
  },
  'Transformer': {
    zh: '当代绝大多数 LLM 的底层神经网络架构，核心创新是自注意力机制，能高效处理长文本并捕捉词之间的复杂关系。',
    en: 'The neural architecture under nearly all modern LLMs; its key innovation, self-attention, handles long sequences and captures relationships between words.'
  },
  'Mixture of Experts': {
    zh: '混合专家（MoE）。一种高效架构：用一个路由网络为每个输入动态挑选少数「专家」子网络来处理，从而在参数量极大的同时控制住计算成本。',
    en: 'A router network dynamically selects a few expert sub-networks per input, allowing huge parameter counts at manageable compute cost.'
  },
  'State': {
    zh: '状态。流程运行到当前为止攒下来的数据，各个步骤靠读写它来传递信息。',
    en: 'The data accumulated so far in a run; steps pass information by reading and writing it.'
  }
};
