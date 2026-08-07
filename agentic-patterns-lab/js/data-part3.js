/* ============================================================
   Part Three — 可靠性 / Reliability (12–14)
   ============================================================ */
window.PATTERNS.push(

/* ---------------------------------------------------------- 12 */
{
  id: 'exception-handling', num: 12, part: 3, core: false, icon: '🛟',
  pages: '196–203',
  name: { zh: '异常处理与恢复', en: 'Exception Handling and Recovery' },
  keywords: 'error retry fallback recovery resilience 容错 重试 降级 兜底',
  oneLiner: {
    zh: '工具会失败、网络会断、数据会脏——提前想好每种情况下 Agent 该怎么办。',
    en: 'Tools fail, networks drop, data is dirty — decide in advance what the agent does about each.'
  },
  analogy: {
    icon: '🧗',
    title: { zh: '攀岩的保护绳', en: 'The climber\'s rope' },
    body: {
      zh: '攀岩者不会假设自己不会滑手。他们沿路布保护点，滑了也只掉一小段。区别不在于会不会失手——一定会——而在于失手之后会怎样。异常处理就是给 Agent 沿路布保护点：这一步失败了，是重试、换个工具、退回上一个稳定状态，还是叫人来。',
      en: 'A climber does not assume they will never slip. They place protection along the route, so a slip costs a metre rather than everything. The difference is not whether you fall — you will — but what happens next. Exception handling places that protection: on failure, does the agent retry, switch tools, roll back to a known-good state, or call a human?'
    }
  },
  problem: {
    zh: 'Demo 里一切顺利，上线后什么都可能出事：API 超时、返回格式变了、数据库连不上、模型输出的 **JSON** 解析失败。没有处理机制的 Agent 一碰到意外就整条流程崩掉，或者更糟——带着错误数据继续往下跑，最后交付一个看不出问题的错误结果。',
    en: 'Everything works in the demo. In production the API times out, the response shape changes, the database is unreachable, the model\'s **JSON** will not parse. An agent without handling either crashes outright or, worse, carries the bad data onward and delivers a wrong answer that looks fine.'
  },
  solution: {
    zh: '分成**主动检测**和**被动处理**两半。主动检测是持续检查工具返回和 API 响应是否正常；被动处理则按严重程度分层应对：临时性故障就重试（最好带退避），有替代方案就降级到备用工具，状态乱了就回退到上一个稳定点，Agent 自己判断得出计划有问题就改计划，实在处理不了就上报给人。同时把所有异常记下来，方便事后诊断。',
    en: 'Split it into **proactive detection** and **reactive handling**. Detection means continuously checking tool outputs and API responses for sanity. Handling is layered by severity: retry transient failures (ideally with backoff), fall back to an alternative tool where one exists, revert to the last stable state when things get inconsistent, let the agent revise its own plan when the plan is the problem, and escalate to a human when nothing works. Log all of it for diagnosis.'
  },
  without: {
    zh: '天气 API 偶发超时，整个行程规划直接报错退出。用户看到一句「出错了」，什么都没拿到，也不知道该重试还是放弃。',
    en: 'The weather API times out occasionally and the whole trip planner exits with an error. The user sees "something went wrong", gets nothing, and cannot tell whether to retry.'
  },
  with: {
    zh: '超时后自动重试两次，还不行就换备用数据源，再不行就在结果里注明「天气数据暂不可用」，其余部分照常交付。',
    en: 'It retries twice, falls back to a secondary source, and failing that delivers everything else with a note that weather data was unavailable.'
  },
  whenToUse: [
    { zh: '任何**上线给真实用户**的 Agent——这不是可选项', en: 'Any agent facing **real users** — this is not optional' },
    { zh: '依赖外部 **API** 或网络的流程（外部服务一定会偶发失败）', en: 'Flows depending on external **API**s or networks — they will fail intermittently' },
    { zh: '长时间运行的任务：跑到第 8 步失败，不该让前 7 步白费', en: 'Long-running tasks: a failure at step 8 should not discard steps 1–7' },
    { zh: '有副作用的操作（下单、发信），失败后的状态必须是确定的', en: 'Operations with side effects — after a failure the state must be unambiguous' }
  ],
  whenNotToUse: [
    { zh: '本地跑着玩的原型，加一堆容错反而拖慢迭代', en: 'A throwaway local prototype — heavy resilience just slows iteration' },
    { zh: '**别无脑重试**：非临时性错误（参数就是错的）重试一百次也没用，只会烧钱', en: '**Do not blindly retry**: a non-transient error (the argument is simply wrong) fails identically a hundred times and costs money each time' },
    { zh: '**别把异常吞掉**：捕获后什么都不说，比直接报错更难查', en: '**Do not swallow exceptions**: catching silently is harder to debug than crashing' }
  ],
  deepDive: [
    { t: { zh: '第一步永远是把错误分成两类', en: 'Step one is always sorting errors into two classes' },
      d: { zh: '**临时性（transient）**：网络抖动、429 限流、503 服务暂时不可用、请求超时——再试一次可能就好了。**确定性（permanent）**：400 参数错误、401 未授权、404 找不到——重试一百次结果完全相同。把这两类混在一起用同一套重试逻辑，是最常见的实现错误：既在确定性错误上白烧钱，又在临时性错误上过早放弃。',
        en: '**Transient**: network blips, 429 rate limits, 503 unavailable, timeouts — another attempt may succeed. **Permanent**: 400 bad argument, 401 unauthorised, 404 not found — a hundred attempts return identically. Handling both with one retry policy is the most common implementation error: money burned on deterministic failures and premature surrender on transient ones.' } },
    { t: { zh: '退避要加抖动，否则会同步成惊群', en: 'Backoff needs jitter or you get a thundering herd' },
      d: { zh: '指数退避（1s、2s、4s、8s）解决了「别猛敲」，但如果同时有一百个请求失败，它们会**在完全相同的时刻一起重试**，对服务端造成周期性冲击波，很可能再次全部失败——然后再次同步。标准解法是加**随机抖动**：`sleep(2**attempt * random(0.5, 1.5))`，把重试时刻打散开。这是分布式系统的基本功。',
        en: 'Exponential backoff (1s, 2s, 4s, 8s) stops the hammering, but if a hundred requests fail together they will **retry at exactly the same instants**, hitting the server in synchronised waves that likely all fail again — and resynchronise. The standard fix is **random jitter**: `sleep(2**attempt * random(0.5, 1.5))`, spreading the retries out. Basic distributed-systems hygiene.' } },
    { t: { zh: '幂等性决定了你敢不敢重试', en: 'Idempotency decides whether you dare retry at all' },
      d: { zh: '查询类操作重试无害。但「下单」「扣款」「发邮件」这类**有副作用**的操作，超时往往意味着「不知道成没成」——服务端可能已经执行了，只是响应丢了。此时盲目重试会造成重复扣款。正确做法是**给请求带幂等键**（idempotency key），服务端据此去重；没有这个机制就不能自动重试，只能上报给人确认。',
        en: 'Retrying a read is harmless. But for **side-effecting** operations — place order, charge card, send email — a timeout usually means "unknown outcome": the server may have executed and only lost the response. Blind retry double-charges. The fix is an **idempotency key** on the request that the server deduplicates against; without one you cannot retry automatically and must escalate for confirmation.' } },
    { t: { zh: '检查点：让失败不必从头再来', en: 'Checkpoints so failure does not mean starting over' },
      d: { zh: '长流程跑到第 8 步失败，如果没有中间状态持久化，前 7 步的 token 和时间全部作废。做法是**每完成一步就把状态写入持久存储**，重启时从最后一个检查点恢复。**LangGraph** 的 checkpointer 就是为此设计的。这个机制在多步骤 Agent 里的收益极大——尤其当每一步都是几秒钟的模型调用时。',
        en: 'A long flow failing at step 8 discards the tokens and time of steps 1–7 unless intermediate state was persisted. **Write state to durable storage after each step** and resume from the last checkpoint on restart. **LangGraph**\'s checkpointer exists for exactly this. The payoff in multi-step agents is large — especially when every step is a multi-second model call.' } },
    { t: { zh: '断路器：连续失败时主动停手', en: 'Circuit breakers: stop trying when it is clearly down' },
      d: { zh: '如果某个下游服务已经连续失败几十次，继续对它重试既浪费资源又拖慢整个系统。**断路器**模式在失败率超过阈值时「跳闸」，一段时间内直接快速失败并走降级路径，不再发起真实请求；过一阵子放一个试探请求看看恢复没有。这能防止一个挂掉的依赖把整个 Agent 系统拖垮。',
        en: 'When a downstream service has failed dozens of times consecutively, continuing to retry wastes resources and slows everything. A **circuit breaker** trips once the failure rate crosses a threshold, failing fast into the fallback path without issuing real requests, then periodically letting one probe through to test recovery. This stops one dead dependency dragging the whole agent system down.' } }
  ],
  diagram: {
    w: 770, h: 320,
    nodes: [
      { id: 'act',    kind: 'agent',    x: 110, y: 78,  label: { zh: 'Agent 调用工具', en: 'Agent calls tool' } },
      { id: 'detect', kind: 'check',    x: 320, y: 78,  label: { zh: '检测结果', en: 'Check result' }, sub: { zh: '正常吗？', en: 'sane?' } },
      { id: 'ok',     kind: 'output',   x: 530, y: 78,  label: { zh: '正常继续', en: 'Carry on' } },
      { id: 'retry',  kind: 'decision', x: 320, y: 228, label: { zh: '重试', en: 'Retry' }, sub: { zh: '仅限临时故障', en: 'transient only' } },
      { id: 'back',   kind: 'tool',     x: 520, y: 228, label: { zh: '降级备用方案', en: 'Fallback' } },
      { id: 'human',  kind: 'human',    x: 690, y: 228, label: { zh: '上报给人', en: 'Escalate' } }
    ],
    edges: [
      { from: 'act', to: 'detect' },
      { from: 'detect', to: 'ok' },
      { from: 'detect', to: 'retry', label: { zh: '失败', en: 'failed' } },
      { from: 'retry', to: 'act', label: { zh: '退避后再试', en: 'with backoff' }, bend: 62 },
      { from: 'retry', to: 'back' },
      { from: 'back', to: 'human' }
    ],
    steps: [
      { edge: 'act->detect', say: { zh: 'Agent 调了个外部工具。第一件事不是用返回值，而是**先检查它是否正常**——超时了吗？格式对吗？内容合理吗？', en: 'The agent calls an external tool. The first move is not to use the result but to **check it**: did it time out, is the shape right, is the content plausible?' } },
      { edge: 'detect->ok', say: { zh: '一切正常，流程照常往下走。这是大多数时候的情况——但设计系统时不能只考虑这条路径。', en: 'All fine, and the flow continues. This is the common case — but a system cannot be designed for only this path.' } },
      { edge: 'detect->retry', say: { zh: '失败了。第一层处理是重试，但**只对临时性故障有意义**：网络抖动、限流、瞬时超时。如果是参数写错了，重试一百次结果都一样。', en: 'It failed. The first layer is retry — but only for **transient** faults: a network blip, rate limiting, a momentary timeout. If the argument was simply wrong, a hundred retries give a hundred identical failures.' } },
      { edge: 'retry->act', say: { zh: '重试要带**退避**：间隔逐次拉长，别在对方已经过载时继续猛敲。同时必须设次数上限。', en: 'Retry with **backoff**: lengthen the gap each time rather than hammering an already-struggling service. And always cap the attempts.' } },
      { edge: 'retry->back', say: { zh: '重试用完还是不行，就降级：换备用数据源，或者返回一个「这部分暂不可用」的部分结果，而不是整体崩掉。', en: 'Retries exhausted, so degrade: switch to a backup source, or return a partial result flagging what is unavailable, rather than failing wholesale.' } },
      { edge: 'back->human', say: { zh: '最后一道防线是上报给人。关键是**别默默吞掉异常**——捕获了却什么都不说，比直接报错更难排查。', en: 'The last line is a human. The key rule: **never swallow the exception**. Catching it and saying nothing is harder to debug than crashing.' } }
    ]
  },
  code: [
    'for attempt in range(3):',
    '    try:',
    '        result = weather_api(city)',
    '        if not valid(result):           # 主动检测：返回了不代表返回对了',
    '            raise ValueError("格式异常")',
    '        return result',
    '',
    '    except TransientError as e:         # 只重试临时性故障',
    '        log.warning(e)                  # 千万别默默吞掉',
    '        sleep(2 ** attempt)             # 退避：间隔逐次拉长',
    '',
    'return fallback_source(city)            # 重试用完就降级，别整体崩掉'
  ],
  useCases: [
    { zh: '**多源数据聚合**：某个数据源挂了，用备用源补上，并在结果里注明来源。', en: '**Multi-source aggregation**: one source is down, a backup fills in, and the result says which was used.' },
    { zh: '**长流程任务**：每完成一步存一次检查点，失败后从检查点继续而不是从头重来。', en: '**Long workflows**: checkpoint after each step and resume from there rather than restarting.' },
    { zh: '**支付、下单等有副作用的操作**：失败后必须能明确判断「到底成没成」，避免重复扣款。', en: '**Payments and orders**: after a failure you must be able to tell whether it went through, or you double-charge.' }
  ],
  quiz: [
    {
      q: { zh: '重试机制**只适合**处理什么类型的错误？', en: 'Retries are appropriate for which kind of error?' },
      options: [
        { zh: '所有类型的错误', en: 'All of them' },
        { zh: '临时性故障，比如网络抖动、限流、瞬时超时', en: 'Transient faults — network blips, rate limits, momentary timeouts' },
        { zh: '参数写错导致的错误', en: 'Errors caused by wrong arguments' },
        { zh: '权限不足导致的错误', en: 'Permission-denied errors' }
      ],
      answer: 1,
      why: {
        zh: '重试的前提是「再试一次可能就好了」。参数错误、权限不足这类**确定性**错误，重试一百次结果完全一样，只是白白烧钱和时间。区分这两类错误是写好容错逻辑的第一步。',
        en: 'Retrying assumes the next attempt might differ. Wrong arguments and missing permissions are **deterministic**: a hundred retries give a hundred identical failures, burning time and money. Telling the two apart is the first step in decent error handling.'
      }
    },
    {
      q: { zh: '为什么重试要带「退避」（backoff）？', en: 'Why should retries use backoff?' },
      options: [
        { zh: '为了让日志更好看', en: 'To make logs look tidier' },
        { zh: '避免在对方服务已经过载时继续密集请求，让它雪上加霜', en: 'To avoid hammering an already-overloaded service and making things worse' },
        { zh: '因为模型需要时间思考', en: 'The model needs thinking time' },
        { zh: '为了省 token', en: 'To save tokens' }
      ],
      answer: 1,
      why: {
        zh: '对方返回超时或限流，往往正是因为它已经扛不住了。这时候立刻高频重试等于补刀，还可能让整个系统一起雪崩。退避（间隔逐次拉长）是给对方喘息的机会。',
        en: 'A timeout or rate limit usually means the other side is already struggling. Immediate rapid retries pile on and can cascade into a wider outage. Lengthening the interval gives it room to recover.'
      }
    },
    {
      q: { zh: '下面哪个做法是**错误的**？', en: 'Which practice is **wrong**?' },
      options: [
        { zh: '捕获异常后记录日志，再决定重试或降级', en: 'Catch, log, then decide whether to retry or degrade' },
        { zh: '捕获异常后什么都不做，让流程静默继续', en: 'Catch the exception, do nothing, and let the flow continue silently' },
        { zh: '重试失败后降级到备用方案', en: 'Fall back to an alternative after retries fail' },
        { zh: '实在处理不了就上报给人类', en: 'Escalate to a human when nothing works' }
      ],
      answer: 1,
      why: {
        zh: '「静默吞掉异常」是最危险的做法：系统看起来正常运行，实际上在用错误或缺失的数据往下跑，最后交付一个看不出问题的错误结果。这比直接崩掉难查得多。',
        en: 'Silently swallowing is the most dangerous option: the system looks healthy while carrying bad or missing data downstream, and delivers a wrong answer that looks fine. That is far harder to diagnose than a crash.'
      }
    }
  ],
  terms: [
    { en: 'Transient vs Permanent Failure', zh: { zh: '临时性故障 vs 确定性错误', en: 'Transient vs permanent failure' }, d: { zh: '容错逻辑的第一分岔：前者（网络抖动、429、超时）重试有意义，后者（400 参数错、401 未授权）重试一百次结果相同。', en: 'The first fork in any recovery logic: the former (blips, 429s, timeouts) is worth retrying; the latter (400, 401) returns identically a hundred times.' } },
    { en: 'Exponential Backoff + Jitter', zh: { zh: '指数退避 + 随机抖动', en: 'Exponential backoff with jitter' }, d: { zh: '重试间隔逐次加倍，并叠加随机扰动。抖动是为了防止大量失败请求**同步重试**形成惊群，把已经过载的服务彻底压垮。', en: 'Doubling the wait each attempt plus randomisation. The jitter prevents many failed requests **retrying in lockstep** and finishing off an already-struggling service.' } },
    { en: 'Fallback / Graceful Degradation', zh: { zh: '降级与优雅退化', en: 'Fallback / graceful degradation' }, d: { zh: '重试耗尽后改用备用数据源，或返回标注了缺失部分的部分结果，而不是整体崩掉。', en: 'After retries are exhausted, switch to a backup source or return a partial result flagging what is missing, rather than failing wholesale.' } },
    { en: 'Idempotency Key', zh: { zh: '幂等键', en: 'Idempotency key' }, d: { zh: '随请求带上的唯一标识，让服务端能识别重复请求。**有副作用的操作没有它就不能自动重试**，否则会重复扣款。', en: 'A unique identifier on the request letting the server deduplicate. **Without one, side-effecting operations must not be auto-retried** or you double-charge.' } },
    { en: 'Circuit Breaker', zh: { zh: '断路器', en: 'Circuit breaker' }, d: { zh: '失败率超阈值时「跳闸」，一段时间内直接快速失败走降级路径，避免一个挂掉的依赖拖垮整个系统。', en: 'Trips when the failure rate crosses a threshold, failing fast into the fallback for a while so one dead dependency cannot drag down the system.' } }
  ],
  refs: [
    { kind: 'paper', title: 'Towards Fault Tolerance in Multi-Agent Reinforcement Learning (Shi et al., 2024)', url: 'https://arxiv.org/abs/2412.00534' },
    { kind: 'docs', title: 'Improving Fault Tolerance of Heterogeneous Multi-Agent IoT Systems', url: 'https://www.mdpi.com/2079-9292/11/17/2724' },
    { kind: 'docs', title: 'Code Complete (McConnell, 2004)', note: { zh: '原书引用的软件工程经典，防御式编程一章尤其相关', en: 'the software-engineering classic the book cites; the defensive-programming chapter is the relevant one' } }
  ],
  related: ['human-in-the-loop', 'goal-setting', 'evaluation', 'guardrails']
},

/* ---------------------------------------------------------- 13 */
{
  id: 'human-in-the-loop', num: 13, part: 3, core: false, icon: '🙋',
  pages: '204–212',
  name: { zh: '人在回路', en: 'Human-in-the-Loop' },
  alias: { zh: 'HITL', en: 'HITL' },
  keywords: 'human in the loop approval escalation oversight 人工审核 确认 兜底',
  oneLiner: {
    zh: '高风险的动作，让 AI 准备好方案，但由人来按下最后那个按钮。',
    en: 'For high-stakes actions, let the AI prepare the decision but leave the final button to a person.'
  },
  analogy: {
    icon: '✈️',
    title: { zh: '自动驾驶与机长', en: 'Autopilot and the captain' },
    body: {
      zh: '飞机绝大部分航程靠自动驾驶，但机长始终在座位上。遇到复杂天气、异常读数或需要判断的情况，控制权交回人手。这不是不信任自动化，而是承认某些决策的**出错代价太高**，值得为它保留一个人。HITL 就是给 Agent 系统装上这个座位。',
      en: 'Autopilot flies most of the route, but the captain never leaves the seat. In difficult weather, on an odd reading, or where judgement is needed, control comes back. This is not distrust of automation; it is acknowledging that some decisions **cost too much to get wrong**. HITL builds that seat into an agent system.'
    }
  },
  problem: {
    zh: '**LLM** 在需要细腻判断、伦理权衡或理解复杂模糊情境的地方并不可靠。在医疗、金融、法务这类高风险场景里，一个错误可能造成严重的安全、经济或伦理后果。完全自主的 AI 不具备人类的常识和创造性判断——这时候把关键决策全权交给它，既不明智也会损害系统本身的可信度。',
    en: '**LLM**s are unreliable exactly where nuanced judgement, ethical weighing or genuinely ambiguous context is needed. In medicine, finance and law a single error carries severe safety, financial or ethical consequences. Fully autonomous AI lacks human common sense and creative judgement, and handing it the critical decision is both imprudent and corrosive to trust in the system.'
  },
  solution: {
    zh: '把人有策略地嵌进流程，形成分工：AI 负责重复的、计算密集的部分——检索、初筛、起草、整理；人负责验证、判断和干预。关键不是「哪里都要人审」，而是**精确选择在哪个环节插入人**：通常是不可逆动作发生之前，或者模型置信度低的时候。人给出的反馈还能反过来持续改进系统。',
    en: 'Place humans into the flow deliberately, splitting the work: AI does the repetitive, computation-heavy parts — retrieval, triage, drafting, organising — while humans validate, judge and intervene. The skill is not reviewing everything but **choosing precisely where the human goes**: usually just before an irreversible action, or wherever the model\'s confidence is low. That human feedback also feeds back into improving the system.'
  },
  without: {
    zh: 'Agent 自动给一位客户批了三十万额度、自动发出了一封措辞失当的道歉信、自动删掉了一批「看起来没用」的数据。等你发现时，全都已经发生了。',
    en: 'The agent approved a £300k credit line, sent a badly worded apology, and deleted a batch of "apparently unused" data. By the time anyone noticed, all of it had already happened.'
  },
  with: {
    zh: 'Agent 把材料查好、把额度算好、把信写好，全部准备到「只差点头」这一步，然后停下来等人确认。人的工作从「自己做」变成了「审一下」。',
    en: 'The agent gathers the evidence, computes the limit, drafts the letter — everything up to the point of assent — then stops and waits. The human\'s job shifts from doing to checking.'
  },
  whenToUse: [
    { zh: '错误代价高：涉及金钱、健康、法律责任、人身安全', en: 'Errors are costly — money, health, legal liability, safety' },
    { zh: '**不可逆动作**之前：删除、发送、支付、公开发布', en: 'Before **irreversible actions** — deleting, sending, paying, publishing' },
    { zh: '任务本身模糊、需要价值判断（内容审核、纠纷处理）', en: 'The task is ambiguous and needs value judgement — moderation, dispute handling' },
    { zh: '模型自己置信度低的时候——把「不确定」变成一次转人工', en: 'Whenever model confidence is low — turn uncertainty into a handoff' },
    { zh: '想收集高质量的人工标注数据来持续改进系统', en: 'You want high-quality human-labelled data to keep improving the system' }
  ],
  whenNotToUse: [
    { zh: '低风险、高频率的操作——每条都要人审，等于没有自动化', en: 'Low-risk, high-volume actions — reviewing every one means you have not automated anything' },
    { zh: '**当心「橡皮图章」效应**：让人审的东西太多，人就会闭着眼一路点确认，审核形同虚设', en: '**Beware rubber-stamping**: ask a person to approve too much and they will click through blind, which is worse than no review' },
    { zh: '需要毫秒级响应的实时场景，人根本来不及介入', en: 'Millisecond-latency paths where a human cannot possibly intervene in time' }
  ],
  deepDive: [
    { t: { zh: '用「不可逆性 × 影响面」二维决定插入点', en: 'Place the human by irreversibility × blast radius' },
      d: { zh: '比单看风险更实用的判断框架。**可逆且影响小**（改个草稿）：全自动。**可逆但影响大**（群发内部通知）：自动执行 + 事后通知 + 一键撤回。**不可逆但影响小**（删一条测试数据）：自动 + 日志。**不可逆且影响大**（转账、删生产库、对外发布）：必须人工确认。按这两个维度画个四象限，你的审核点位置基本就定了。',
        en: 'More useful than risk alone. **Reversible, small blast radius** (edit a draft): fully automatic. **Reversible, large** (broadcast an internal notice): automatic plus notification plus one-click undo. **Irreversible, small** (delete one test record): automatic plus logging. **Irreversible and large** (transfers, dropping a production table, publishing externally): human confirmation required. Draw those two axes and your review points largely place themselves.' } },
    { t: { zh: '模型的置信度并不可靠', en: 'Model confidence is not trustworthy' },
      d: { zh: '「置信度低就转人工」听起来完美，问题是 **LLM 的自陈置信度校准很差**——它经常对错误答案表现得非常确定，这恰恰是最危险的情况。更可靠的转人工信号是外部的：检索没找到相关资料、工具连续失败、用户重复追问同一件事、输出触发了敏感词或金额阈值。**别把模型的自我评估当成安全阀**。',
        en: '"Escalate when confidence is low" sounds ideal, but **an LLM\'s self-reported confidence is poorly calibrated** — it is frequently very certain about wrong answers, which is precisely the dangerous case. More reliable triggers are external: retrieval found nothing relevant, tools failed repeatedly, the user re-asked the same thing, or the output crossed a sensitive-term or monetary threshold. **Do not use self-assessment as a safety valve.**' } },
    { t: { zh: '审核疲劳是可以量化管理的', en: 'Review fatigue can be measured and managed' },
      d: { zh: '橡皮图章效应不是态度问题，是**通过率过高的必然结果**——如果 99% 的送审内容都该批准，人的注意力必然下降。可量化的对策：监控**审核通过率**（长期高于 95% 说明门槛设得太松，该收紧筛选条件）、监控**平均审核耗时**（骤降是走过场的信号）、以及对低风险项改用**抽样审核**而非全量审核。',
        en: 'Rubber-stamping is not an attitude problem but the **inevitable result of an approval rate that is too high** — if 99% of submissions should be approved, attention will drop. Measurable countermeasures: track **approval rate** (persistently above 95% means the filter is too loose and should tighten), track **median review time** (a sudden drop signals going through the motions), and switch low-risk items to **sampled** rather than exhaustive review.' } },
    { t: { zh: '审核界面的设计直接决定审核质量', en: 'The review interface determines review quality' },
      d: { zh: '这一点在工程实践中被严重低估。让人看一大段原始输出去找问题，和让人看一个**结构化的对比视图**（改了哪些字段、依据是什么、AI 的不确定点在哪、有哪些可选项）——两者的审核准确率天差地别。**AI 已经把活干到「只差点头」，那就要真的把决策成本降到「点一下头」**，否则 HITL 的经济性不成立。',
        en: 'Badly underrated in practice. Asking someone to scan raw output for problems, versus showing a **structured diff view** (which fields changed, on what evidence, where the AI is unsure, what the alternatives are), produces wildly different accuracy. **If the AI worked up to the point of assent, the assent must genuinely cost one click** — otherwise HITL does not pay for itself.' } },
    { t: { zh: '异步审核比同步阻塞更实用', en: 'Asynchronous review beats blocking' },
      d: { zh: '同步等待人工确认会把整个 Agent 流程卡住，人不在线时任务就悬着。生产做法通常是**异步**：Agent 把待审项写入队列后继续处理其他任务，人审核完通过回调或轮询触发后续动作。这需要流程本身支持**暂停与恢复**——**LangGraph** 的 interrupt 机制和检查点持久化正是为这类场景设计的。',
        en: 'Blocking on human confirmation stalls the whole flow and leaves tasks hanging whenever nobody is online. Production usually runs **asynchronously**: the agent queues the item and moves on, and approval triggers the continuation via callback or polling. That requires the flow to support **pause and resume** — which is exactly what **LangGraph**\'s interrupt mechanism plus checkpoint persistence is built for.' } }
  ],
  diagram: {
    w: 770, h: 315,
    nodes: [
      { id: 'task',  kind: 'actor',    x: 90,  y: 80,  label: { zh: '请求进来', en: 'Request' } },
      { id: 'ai',    kind: 'agent',    x: 268, y: 80,  label: { zh: 'AI 处理', en: 'AI handles it' }, sub: { zh: '检索 · 初筛 · 起草', en: 'retrieve · draft' }, w: 128 },
      { id: 'risk',  kind: 'decision', x: 470, y: 80,  label: { zh: '风险判断', en: 'Risk check' }, sub: { zh: '高风险？置信度低？', en: 'risky? unsure?' }, w: 132 },
      { id: 'auto',  kind: 'output',   x: 672, y: 80,  label: { zh: '低风险直接执行', en: 'Auto-execute' } },
      { id: 'human', kind: 'human',    x: 470, y: 232, label: { zh: '人来把关', en: 'Human decides' }, sub: { zh: '批准 / 修改 / 否决', en: 'approve · edit · reject' }, w: 132 },
      { id: 'learn', kind: 'memory',   x: 200, y: 232, label: { zh: '反馈改进系统', en: 'Feedback loop' } }
    ],
    edges: [
      { from: 'task', to: 'ai' },
      { from: 'ai', to: 'risk' },
      { from: 'risk', to: 'auto', label: { zh: '低风险', en: 'low risk' } },
      { from: 'risk', to: 'human', label: { zh: '高风险', en: 'high risk' } },
      { from: 'human', to: 'auto' },
      { from: 'human', to: 'learn', dash: true }
    ],
    steps: [
      { edge: 'task->ai', say: { zh: '请求进来，AI 先干重活：查资料、初步筛选、把方案起草好。这部分正是它擅长的。', en: 'A request arrives and the AI does the heavy lifting — research, triage, drafting a proposal. This is what it is good at.' } },
      { edge: 'ai->risk', say: { zh: '关键设计点：**在哪里插入人**。判断依据通常是两个——这个动作是不是不可逆？模型对自己的判断有多确定？', en: 'The key design decision: **where the human goes**. Usually two tests — is this action irreversible, and how confident is the model?' } },
      { edge: 'risk->auto', say: { zh: '低风险的照常自动执行。别什么都送去人工，否则等于没有自动化，人也会疲于应付。', en: 'Low-risk work executes automatically. Routing everything to a human means you have not automated anything, and the reviewer burns out.' } },
      { edge: 'risk->human', say: { zh: '高风险的停下来等人。注意 AI 已经把材料准备到「只差点头」——人的成本从「自己做」降到「审一下」，这才是 HITL 划算的原因。', en: 'High-risk work stops and waits. Note the AI has prepared everything up to the point of assent — the human cost drops from doing to checking, which is what makes HITL worth it.' } },
      { edge: 'human->auto', say: { zh: '人批准、修改或否决之后，动作才真正发生。这道关卡挡住的是那些一旦发生就收不回来的事。', en: 'Only after the human approves, edits or rejects does the action happen. This gate stands in front of everything that cannot be taken back.' } },
      { edge: 'human->learn', say: { zh: '额外收益：人的每一次判断都是高质量的标注数据，可以喂回去持续改进模型，让未来需要人工介入的比例慢慢下降。', en: 'A bonus: every human judgement is high-quality labelled data, which can improve the model so the share needing intervention slowly falls.' } }
    ]
  },
  code: [
    'draft = agent.run(request)          # AI 把活干到「只差点头」',
    '',
    '# 两个判断依据：动作是否不可逆、模型是否有把握',
    'if draft.irreversible or draft.confidence < 0.8:',
    '    decision = await human_review(draft)   # 停下来等人',
    '',
    '    feedback.log(draft, decision)          # 人的判断是高质量训练数据',
    '    if not decision.approved:',
    '        return decision.reason',
    '    draft = decision.edited or draft',
    '',
    'return execute(draft)               # 低风险的直接执行，别什么都送审'
  ],
  useCases: [
    { zh: '**内容审核**：AI 过滤掉明显违规的，边界模糊的交给人判断。', en: '**Moderation**: AI clears the obvious cases and sends the borderline ones to a person.' },
    { zh: '**医疗辅助**：AI 给出候选诊断和依据，最终判断权始终在医生手里。', en: '**Clinical support**: AI proposes candidates with evidence; the clinician decides.' },
    { zh: '**客服升级**：常见问题自动答，复杂或情绪激动的对话转人工。', en: '**Support escalation**: routine questions answered automatically, complex or heated ones handed over.' },
    { zh: '**代码部署**：AI 写好改动并跑通测试，合并到生产分支前需要人 review。', en: '**Deployment**: AI writes and tests the change; a human reviews before it merges to production.' }
  ],
  quiz: [
    {
      q: { zh: '设计 HITL 时，最关键的决策是什么？', en: 'What is the key design decision in HITL?' },
      options: [
        { zh: '让人审核所有输出，越多越安全', en: 'Have humans review everything — more review is safer' },
        { zh: '精确选择在哪个环节插入人：通常是不可逆动作之前或置信度低时', en: 'Choosing precisely where the human sits — usually before irreversible actions or when confidence is low' },
        { zh: '找尽可能多的人来审核', en: 'Recruiting as many reviewers as possible' },
        { zh: '把人放在流程最开始', en: 'Putting the human at the very start' }
      ],
      answer: 1,
      why: {
        zh: '「哪里都要人审」和「哪里都不要人审」一样糟。前者会拖垮效率，还会引发橡皮图章效应——人被淹没在低价值审核里，反而会闭着眼点确认。真正有价值的是把人放在少数几个高风险节点上。',
        en: 'Reviewing everything is as bad as reviewing nothing. It destroys throughput and invites rubber-stamping — drowned in low-value approvals, people click through blind. The value comes from placing humans at a few genuinely high-risk points.'
      }
    },
    {
      q: { zh: '什么是「橡皮图章」效应？', en: 'What is the rubber-stamp effect?' },
      options: [
        { zh: '人审核得太慢，拖累系统', en: 'Reviewers are too slow and hold up the system' },
        { zh: '需要人审的内容太多，人疲于应付就会闭眼点确认，审核形同虚设', en: 'Too much to review, so people approve without looking and the review becomes meaningless' },
        { zh: 'AI 拒绝接受人类的修改', en: 'The AI refuses human edits' },
        { zh: '人和 AI 意见不一致', en: 'Humans and AI disagree' }
      ],
      answer: 1,
      why: {
        zh: '这是 HITL 最常见的失败模式，而且很隐蔽：流程图上人还在，实际上早已形同虚设。这也是为什么「少而准地插入人」比「到处都插人」更安全。',
        en: 'This is HITL\'s most common failure mode and an insidious one: the human is still on the diagram while the review has quietly stopped happening. It is why placing humans sparingly and precisely is safer than placing them everywhere.'
      }
    },
    {
      q: { zh: 'HITL 除了防止错误，还有什么额外收益？', en: 'Beyond preventing errors, what else does HITL give you?' },
      options: [
        { zh: '可以减少服务器成本', en: 'Lower server costs' },
        { zh: '人的每次判断都是高质量标注数据，可以用来持续改进系统', en: 'Every human judgement is high-quality labelled data for improving the system' },
        { zh: '可以让模型响应更快', en: 'Faster model responses' },
        { zh: '不再需要写提示词', en: 'No more prompt writing' }
      ],
      answer: 1,
      why: {
        zh: '这是个常被忽略的复利效应：人工审核的结果天然就是「正确答案」标注。积累下来可以用于评估、微调或者调整提示，让未来需要人工介入的比例逐步下降。',
        en: 'An often-missed compounding benefit: review decisions are ground-truth labels by construction. Accumulated, they support evaluation, fine-tuning or prompt changes that steadily reduce how often a human is needed.'
      }
    }
  ],
  terms: [
    { en: 'Human-in-the-Loop (HITL)', zh: { zh: '人在回路', en: 'Human-in-the-loop' }, d: { zh: '把人的判断策略性地嵌入 AI 工作流：AI 承担计算密集的重活，人负责验证、反馈和干预。', en: 'Strategically embedding human judgement in an AI workflow: AI does the computational heavy lifting, humans validate, give feedback and intervene.' } },
    { en: 'Escalation Policy', zh: { zh: '升级策略', en: 'Escalation policy' }, d: { zh: '定义什么情况下必须转人工的规则。可靠的触发信号是外部的（检索为空、工具连续失败、超过金额阈值），而非模型自陈的置信度。', en: 'The rules for when a human must take over. Reliable triggers are external — empty retrieval, repeated tool failures, a monetary threshold — not the model\'s self-reported confidence.' } },
    { en: 'Rubber-stamping', zh: { zh: '橡皮图章效应', en: 'Rubber-stamping' }, d: { zh: 'HITL 最常见的失效：送审内容过多导致人闭眼批准，流程图上人还在，实际审核早已形同虚设。', en: 'HITL\'s commonest failure: too much to review, so approvals happen unread. The human is still on the diagram while the review has quietly stopped.' } },
    { en: 'Interrupt / Resume', zh: { zh: '中断与恢复', en: 'Interrupt and resume' }, d: { zh: '让流程在等待人工决策时暂停、拿到结果后继续的机制。LangGraph 的 interrupt 加检查点持久化就是为此设计的。', en: 'Pausing a flow to await a human decision and continuing afterwards. LangGraph\'s interrupt plus checkpoint persistence exists for this.' } }
  ],
  refs: [
    { kind: 'paper', title: 'A Survey of Human-in-the-loop for Machine Learning (Wu et al.)', url: 'https://arxiv.org/abs/2108.00941', note: { zh: 'HITL 方向的系统性综述', en: 'the systematic survey on HITL' } },
    { kind: 'docs', title: 'LangGraph — Human-in-the-loop', url: 'https://langchain-ai.github.io/langgraph/', note: { zh: '图可以停下来等人输入再决定走哪个节点', en: 'the graph can wait for input before choosing the next node' } }
  ],
  related: ['guardrails', 'exception-handling', 'goal-setting', 'evaluation']
},

/* ---------------------------------------------------------- 14 */
{
  id: 'knowledge-retrieval', num: 14, part: 3, core: false, icon: '🔎',
  pages: '213–230',
  name: { zh: '知识检索', en: 'Knowledge Retrieval (RAG)' },
  alias: { zh: 'RAG 检索增强生成', en: 'Retrieval-Augmented Generation' },
  keywords: 'rag retrieval vector embedding grounding citation 检索 知识库 引用',
  oneLiner: {
    zh: '回答之前先去知识库里查资料，然后**照着资料答**，而不是凭记忆瞎编。',
    en: 'Look things up in a knowledge base first, then answer **from what you found** instead of from memory.'
  },
  analogy: {
    icon: '📖',
    title: { zh: '闭卷考试变开卷', en: 'Closed book becomes open book' },
    body: {
      zh: '闭卷考试时，你只能靠记忆答题，记错了也不知道，还容易硬编一个看起来合理的答案。开卷就不一样了：先翻到相关那一页，照着上面的内容答，还能标出处。**RAG** 做的就是把模型从闭卷考生变成开卷考生——它的知识不再限于训练时记住的东西。',
      en: 'In a closed-book exam you answer from memory, cannot tell when memory is wrong, and are tempted to invent something plausible. Open book changes everything: find the relevant page, answer from it, cite it. **RAG** turns the model from a closed-book candidate into an open-book one — its knowledge is no longer limited to what it memorised in training.'
    }
  },
  problem: {
    zh: '**LLM** 的知识是**静态**的，停在训练截止那天，而且完全不包含你公司的内部文档、产品手册、客户资料。问它「我们退货政策是几天」，它要么说不知道，要么编一个听起来很合理的数字——后者危险得多。',
    en: '**LLM** knowledge is **static**, frozen at the training cutoff, and contains nothing from your internal documents, product manuals or customer records. Ask about your returns policy and it either declines or invents a plausible-sounding number — and the second is far more dangerous.'
  },
  solution: {
    zh: '分两步：**检索**再**增强**。收到问题后，先去知识库里搜出最相关的几段资料（通常用 **Embedding** 做语义检索，存在 **Vector Database** 里）；然后把这几段拼进提示词，再交给模型作答。模型于是「照着材料说话」，答案有据可查、可以标引用，**Hallucination** 大幅下降。更新知识也只需要更新文档，不用重新训练模型。',
    en: 'Two steps: **retrieve**, then **augment**. On a question, search the knowledge base for the most relevant passages — usually semantic search over **Embedding**s in a **Vector Database** — then splice those passages into the prompt before the model answers. The model now speaks from the material: answers are traceable, citable, and **Hallucination** drops sharply. Updating knowledge means updating documents, not retraining.'
  },
  without: {
    zh: '用户问「你们的退货政策是几天」，模型笃定地答「30 天」。你们实际是 14 天。它不是在撒谎，它只是根本没有这个信息，于是补了一个最常见的数字。',
    en: 'Asked about the returns window, the model confidently says 30 days. Yours is 14. It is not lying — it simply never had the information and filled in the most common answer.'
  },
  with: {
    zh: '系统先从你的政策文档里检索出「退货期限为签收后 14 个自然日」，模型照着这句话回答，还能附上文档出处让用户自己核对。',
    en: 'The system retrieves "returns accepted within 14 calendar days of delivery" from your policy document, the model answers from that line, and cites the source so the user can check.'
  },
  whenToUse: [
    { zh: '需要基于**私有资料**回答：内部文档、产品手册、合同、工单历史', en: 'Answers must come from **private material** — internal docs, manuals, contracts, ticket history' },
    { zh: '信息更新频繁，重新训练模型不现实', en: 'The information changes often and retraining is impractical' },
    { zh: '答案必须**可溯源**，用户要能看到引用出处', en: 'Answers must be **traceable**, with citations users can check' },
    { zh: '想显著降低幻觉——这是 RAG 最直接的价值', en: 'You want a large drop in hallucination — RAG\'s most direct benefit' }
  ],
  whenNotToUse: [
    { zh: '问的是常识或推理题，知识库里根本没有相关内容，检索反而引入噪音', en: 'The question is general knowledge or pure reasoning — retrieval only injects noise' },
    { zh: '**检索质量决定一切**：搜出来的是错的或不相关的，模型会照着错资料一本正经地答', en: '**Retrieval quality is everything**: fetch the wrong passage and the model will confidently answer from it' },
    { zh: '知识库本身没整理好——文档过时、互相矛盾，RAG 只会把这些问题放大', en: 'The knowledge base itself is a mess — stale, self-contradicting documents get amplified, not fixed' },
    { zh: '对延迟极敏感的场景：多一次检索就多一份等待', en: 'Very latency-sensitive paths — retrieval is another round trip' }
  ],
  deepDive: [
    { t: { zh: '切分策略决定检索质量的下限', en: 'Chunking sets the floor on retrieval quality' },
      d: { zh: '这是 RAG 里最被低估的环节。切得太碎，一段话被拦腰截断，检索到的片段缺少必要上下文；切得太大，一个片段里混了多个主题，向量表示被稀释，相关性下降。实用做法：**按语义边界切**（标题、段落、条款）而不是按固定字数，**片段之间留重叠**（通常 10–20%）避免边界信息丢失，并在片段里**保留标题层级等元数据**帮助模型理解它来自哪里。',
        en: 'The most underrated stage. Chunk too small and a passage is cut mid-thought, so the retrieved fragment lacks the context it needs. Chunk too large and several topics share one vector, diluting the representation and hurting relevance. What works: **split on semantic boundaries** — headings, paragraphs, clauses — rather than fixed character counts, **overlap adjacent chunks** by roughly 10–20% so boundary information survives, and **keep metadata such as heading path** inside the chunk so the model knows where it came from.' } },
    { t: { zh: '纯向量检索的已知失败模式', en: 'Where pure vector search reliably fails' },
      d: { zh: '**Embedding** 擅长语义相似，但在几类查询上明显吃亏：精确的产品型号或订单号（字面匹配才对）、专有名词和缩写、否定语义（「不含麸质」和「含麸质」在向量空间里很近）、以及数字和日期。所以生产 RAG 普遍用**混合检索**：向量召回 + 关键词检索（BM25）并行，结果合并后再用 **rerank 模型**做一次精排。这一步通常是 RAG 效果提升最大的单项改动。',
        en: '**Embedding**s excel at semantic similarity and lose badly on several query types: exact model or order numbers (where literal matching is correct), proper nouns and acronyms, negation ("gluten-free" and "contains gluten" sit close in vector space), and numbers and dates. So production RAG runs **hybrid retrieval**: vector recall alongside keyword search (BM25), merged and then re-ranked by a dedicated **reranker**. This is usually the single highest-impact change to a RAG system.' } },
    { t: { zh: 'top-k 不是越大越好', en: 'Bigger top-k is not better' },
      d: { zh: '直觉上多检索几段更保险，实际上有两个反效果：**上下文预算被无关内容占满**（钱花了、有效信息比例反而低），以及模型在长上下文中间的信息容易被忽略（业界称为 lost in the middle 现象）。实用做法是 **top-k 取小（3–5）但先经过 rerank 精排**，让进入上下文的每一段都真的相关，而不是靠数量堆概率。',
        en: 'Retrieving more feels safer and backfires twice: **the context budget fills with irrelevant text** (you pay more for a lower signal ratio), and material in the middle of a long context is more easily overlooked — the "lost in the middle" effect. The practical setting is a **small top-k of 3–5 preceded by reranking**, so every passage that enters context is genuinely relevant rather than betting on volume.' } },
    { t: { zh: '「资料里没有就说不知道」必须显式写进提示', en: 'Explicitly instruct it to say "not in the sources"' },
      d: { zh: '模型的默认倾向是尽力回答。如果检索回来的片段不足以支撑答案，它会用自己的参数化知识补上——这时你得到的是一个**混合了检索内容和幻觉的答案**，而且因为带着引用显得更可信。所以系统提示里必须明确要求：只依据提供的资料回答，资料不足就直说。这一句话的效果往往比换更大的模型明显。',
        en: 'A model\'s default is to answer helpfully. When the retrieved passages do not support an answer it fills the gap from parametric knowledge, and you get **an answer blending retrieval with hallucination** — made more credible by the citation attached. So the system prompt must state it: answer only from the supplied material, and say so when the material is insufficient. That single instruction often outperforms upgrading the model.' } },
    { t: { zh: 'RAG、长上下文、微调怎么选', en: 'Choosing between RAG, long context and fine-tuning' },
      d: { zh: '三者解决的不是同一个问题。**RAG** 解决「知识是什么」：知识频繁更新、需要溯源引用、语料远超上下文窗口时用它。**长上下文**（直接把全部文档塞进去）在语料较小且固定时更简单，但成本随每次调用线性上涨，且有 lost in the middle 问题。**Fine-tuning** 解决「行为是什么」：改变模型的语气、格式、领域术语习惯，**它不适合用来灌入事实知识**——这是最常见的选型错误。',
        en: 'They solve different problems. **RAG** answers "what does it know": use it when knowledge changes often, citations are needed, or the corpus dwarfs the context window. **Long context** — pasting everything in — is simpler for a small fixed corpus, but cost rises linearly per call and lost-in-the-middle applies. **Fine-tuning** answers "how does it behave": tone, format, domain idiom. **It is the wrong tool for injecting facts** — the most common selection error of the three.' } }
  ],
  diagram: {
    w: 780, h: 315,
    nodes: [
      { id: 'q',     kind: 'actor',  x: 82,  y: 78,  label: { zh: '用户提问', en: 'Question' }, sub: { zh: '退货几天？', en: 'returns window?' } },
      { id: 'embed', kind: 'check',  x: 262, y: 78,  label: { zh: '转成向量', en: 'Embed query' }, sub: 'Embedding' },
      { id: 'store', kind: 'store',  x: 262, y: 228, label: { zh: '知识库', en: 'Knowledge base' }, sub: { zh: '你的文档', en: 'your documents' } },
      { id: 'snip',  kind: 'memory', x: 468, y: 155, label: { zh: '相关片段', en: 'Relevant passages' }, sub: { zh: '「14 个自然日」', en: '"14 calendar days"' }, w: 130 },
      { id: 'llm',   kind: 'llm',    x: 660, y: 78,  label: { zh: '模型照着答', en: 'Model answers' } },
      { id: 'ans',   kind: 'output', x: 660, y: 228, label: { zh: '带引用的回答', en: 'Cited answer' } }
    ],
    edges: [
      { from: 'q', to: 'embed' },
      { from: 'embed', to: 'store' },
      { from: 'store', to: 'snip' },
      { from: 'snip', to: 'llm' },
      { from: 'q', to: 'llm', label: { zh: '原问题', en: 'original question' }, via: [{ x: 82, y: 25 }, { x: 660, y: 25 }] },
      { from: 'llm', to: 'ans' }
    ],
    steps: [
      { edge: 'q->embed', say: { zh: '用户问「退货政策是几天」。这个答案只存在于你的内部文档里，模型的训练数据里不可能有。', en: 'The user asks about the returns window. That answer exists only in your internal documents and cannot be in the training data.' } },
      { edge: 'embed->store', say: { zh: '问题先被转成向量（Embedding），因为要按**意思**去搜，而不是按关键词。用户说「几天能退」，文档写的是「退货期限」——字面不重合，意思一致。', en: 'The question becomes an embedding, because the search is by **meaning** rather than keywords. The user says "how long to send it back"; the document says "returns period" — no shared words, same meaning.' } },
      { edge: 'store->snip', say: { zh: '检索出最相关的几段。**这一步的质量决定了整个 RAG 的上限**——搜错了，后面模型只会照着错资料一本正经地答。', en: 'The most relevant passages come back. **This step caps the quality of the whole system**: retrieve the wrong passage and the model will answer confidently from it.' } },
      { edge: 'snip->llm', say: { zh: '「增强」这一步：把检索到的片段拼进提示词。模型现在手上有的是你的真实文档，而不是它的模糊记忆。', en: 'The augmentation step: the passages are spliced into the prompt. The model now holds your actual document rather than a hazy memory.' } },
      { edge: 'q->llm', say: { zh: '原问题也一起交给模型，让它知道要从这些材料里回答什么。', en: 'The original question travels along too, so the model knows what to answer from the material.' } },
      { edge: 'llm->ans', say: { zh: '模型照着材料作答，还能标出处。想更新知识？改文档就行，不用重新训练模型——这是 RAG 在工程上最实惠的地方。', en: 'The model answers from the material and can cite it. Updating knowledge means editing a document, not retraining — RAG\'s most practical engineering benefit.' } }
    ]
  },
  code: [
    '# 一次性：把文档切片、转成向量、存进向量库',
    'store.add([embed(chunk) for chunk in split(documents)])',
    '',
    '# 每次提问：先检索（Retrieval）',
    'snippets = store.search(embed(question), top_k=4)',
    '',
    '# 再增强（Augmentation）：把资料拼进提示',
    'answer = llm(f"""只依据下面的资料回答，资料里没有就说不知道。',
    '资料：{snippets}',
    '问题：{question}""")',
    '',
    'return answer, [s.source for s in snippets]    # 附上引用出处'
  ],
  useCases: [
    { zh: '**企业知识问答**：基于内部制度、产品手册回答员工和客户的问题。', en: '**Internal Q&A**: answer staff and customer questions from policies and manuals.' },
    { zh: '**客服助手**：从历史工单和帮助文档里找到解决方案，并附上原文链接。', en: '**Support assistants**: find solutions in past tickets and help docs, with links to the source.' },
    { zh: '**法律与合规**：基于具体条款回答，每条结论都能追溯到原文出处。', en: '**Legal and compliance**: answer from specific clauses with every conclusion traceable.' }
  ],
  quiz: [
    {
      q: { zh: 'RAG 这个名字里的两个动作分别是？', en: 'What are the two actions in RAG?' },
      options: [
        { zh: '推理（Reasoning）和生成（Generation）', en: 'Reasoning and Generation' },
        { zh: '检索（Retrieval）和增强（Augmentation），然后才是生成', en: 'Retrieval and Augmentation, and only then Generation' },
        { zh: '重试（Retry）和聚合（Aggregation）', en: 'Retry and Aggregation' },
        { zh: '排序（Ranking）和分组（Grouping）', en: 'Ranking and Grouping' }
      ],
      answer: 1,
      why: {
        zh: '先从知识库里检索相关片段，再把这些片段「增强」进提示词，最后模型才生成回答。理解这个顺序很重要：模型是**照着检索结果**回答的，不是先答完再去核对。',
        en: 'Retrieve relevant passages, augment the prompt with them, and only then generate. The order matters: the model answers **from** the retrieved material rather than answering first and checking afterwards.'
      }
    },
    {
      q: { zh: 'RAG 系统效果的**上限**主要由什么决定？', en: 'What mainly caps a RAG system\'s quality?' },
      options: [
        { zh: '模型的大小', en: 'The size of the model' },
        { zh: '检索质量——搜出来的资料对不对、全不全', en: 'Retrieval quality — whether the right, complete passages come back' },
        { zh: '提示词的长度', en: 'Prompt length' },
        { zh: '用户提问的语气', en: 'How politely the user asks' }
      ],
      answer: 1,
      why: {
        zh: '检索错了，再强的模型也只会照着错资料一本正经地答，反而因为「有出处」显得更可信、更危险。所以做 RAG 时，大部分精力应该花在文档切分、检索策略和排序上，而不是换更大的模型。',
        en: 'Retrieve the wrong passage and even the best model answers confidently from it — and the citation makes it look more credible, not less. Most RAG effort belongs in chunking, retrieval strategy and ranking, not in a bigger model.'
      }
    },
    {
      q: { zh: '相比微调（Fine-tuning）模型，RAG 在工程上的主要优势是？', en: 'Compared with fine-tuning, what is RAG\'s main practical advantage?' },
      options: [
        { zh: 'RAG 的回答一定比微调更准确', en: 'RAG answers are always more accurate' },
        { zh: '更新知识只需要改文档，不用重新训练模型，而且答案可溯源', en: 'Updating knowledge means editing documents rather than retraining, and answers stay traceable' },
        { zh: 'RAG 不需要向量数据库', en: 'RAG needs no vector database' },
        { zh: 'RAG 速度更快', en: 'RAG is faster' }
      ],
      answer: 1,
      why: {
        zh: '知识更新成本和可溯源性是 RAG 最大的工程优势。政策改了？改一份文档就生效。用户质疑答案？直接把出处给他看。微调则要重新准备数据、重新训练，而且模型学到的东西没法追溯。速度上 RAG 其实更慢，因为多了一次检索。',
        en: 'Update cost and traceability are the real wins. Policy changed? Edit one document. User disputes an answer? Show the source. Fine-tuning needs fresh data and another training run, and what the model learned cannot be traced. On speed RAG is actually slower — it adds a retrieval hop.'
      }
    }
  ],
  terms: [
    { en: 'Retrieval-Augmented Generation (RAG)', zh: { zh: '检索增强生成', en: 'Retrieval-augmented generation' }, d: { zh: '先从外部知识库检索相关片段，把它们追加进提示，再让模型据此生成回答。原书的比喻是把模型从「闭卷」变成「开卷」推理者。', en: 'Retrieve relevant snippets from an external knowledge base, append them to the prompt, and generate from those. The book\'s phrase: turning a closed-book reasoner into an open-book one.' } },
    { en: 'Chunking', zh: { zh: '文档切分', en: 'Chunking' }, d: { zh: '把文档切成可检索的片段。按语义边界切、片段间留重叠、保留标题层级元数据——这一步基本决定了检索质量的下限。', en: 'Splitting documents into retrievable pieces. Split on semantic boundaries, overlap adjacent chunks, keep heading metadata — this largely sets the floor on retrieval quality.' } },
    { en: 'Hybrid Search + Reranking', zh: { zh: '混合检索与重排', en: 'Hybrid search and reranking' }, d: { zh: '向量召回与关键词检索（BM25）并行，合并后用 rerank 模型精排。通常是提升 RAG 效果最大的单项改动。', en: 'Vector recall alongside keyword search (BM25), merged then re-ranked by a dedicated model. Usually the single highest-impact change to a RAG system.' } },
    { en: 'Grounding', zh: { zh: '事实接地', en: 'Grounding' }, d: { zh: '让回答建立在可验证的外部资料之上，使其可溯源、可核对，从而显著降低幻觉。', en: 'Basing answers on verifiable external material so they are traceable and checkable, sharply reducing hallucination.' } },
    { en: 'GraphRAG', zh: { zh: '图检索增强生成', en: 'GraphRAG' }, d: { zh: 'RAG 的扩展方向：用图结构组织知识，以处理需要跨多个文档做关系推理的问题。', en: 'A RAG extension organising knowledge as a graph, for questions needing relational reasoning across many documents.' } }
  ],
  refs: [
    { kind: 'paper', title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)', url: 'https://arxiv.org/abs/2005.11401', note: { zh: 'RAG 的开山论文，值得读原文', en: 'the paper that named RAG — worth reading in full' } },
    { kind: 'paper', title: 'Retrieval-Augmented Generation with Graphs (GraphRAG)', url: 'https://arxiv.org/abs/2501.00309' },
    { kind: 'docs', title: 'Vertex AI — RAG Engine 概述', url: 'https://cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-overview' },
    { kind: 'docs', title: 'RAG: From Theory to LangChain Implementation', url: 'https://medium.com/data-science/retrieval-augmented-generation-rag-from-theory-to-langchain-implementation-4e9bd5f6a4f2', note: { zh: '从理论到实现的完整走查', en: 'a full walk-through from theory to code' } }
  ],
  related: ['tool-use', 'memory', 'guardrails', 'reasoning']
}

);
