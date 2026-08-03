import { defineToolContent } from './define';

export const cronContent = defineToolContent({
  zh: {
    overview: [
      'Cron 表达式用空格分隔的时间字段描述重复计划。工具解析常见的分钟、小时、日、月和星期字段，生成可读说明，并基于选定时区预览接下来的执行时间，适合在部署前检查边界。',
      'Cron 并非只有一个方言。Linux crontab 常用五字段，Quartz 常增加秒和年份，不同平台对星期编号、问号和特殊字符的支持也不同。这里的结果必须与实际调度器文档对照。',
    ],
    steps: [
      ['确认目标方言', '先查部署平台需要五字段还是包含秒的格式，以及它如何解释星期和时区。'],
      ['输入表达式和时区', '粘贴完整表达式，选择任务真正运行的时区，而不是只看本机时间。'],
      ['核对后续执行时间', '检查跨日、月底、夏令时和工作日边界，确认预览符合业务预期。'],
    ],
    example: {
      caption: "注意最后一例：日和周同时指定时按「或」处理，1 号和每个周一都会触发。",
      inputLabel: "Cron 表达式",
      input: "0 9 * * 1-5\n*/15 * * * *\n0 0 1 * 1",
      outputLabel: "解析结果",
      output: "每周一至周五 09:00\n每 15 分钟\n每月 1 号 00:00，以及每周一 00:00",
      language: "text",
    },
    scenarios: [
      ['审查定时任务配置', '在提交 CI、Kubernetes 或服务器计划任务前确认频率没有写快或写慢。'],
      ['排查未按时执行', '把表达式放回解析器，结合时区和下次时间定位字段误解。'],
      ["把需求翻译成表达式再验证", "「每个工作日早上九点」这类描述写成表达式后，用接下来几次的触发时间反向确认理解是否一致。"],
    ],
    notes: [
      '预览只解释计划，不会创建、保存或运行任何真实任务。',
      '夏令时切换可能让某个本地时间重复或不存在，调度器的处理策略各不相同。',
      '“日”和“星期”字段同时受限时，OR 还是 AND 取决于具体 Cron 方言。',
    ],
    specs: [["支持的字段", "标准五字段（分 时 日 月 周），部分实现的六字段（含秒）写法"], ["输出", "人类可读的执行时间描述，以及接下来 N 次的实际触发时间"], ["方言差异", "Linux crontab、Quartz、Kubernetes CronJob、各语言库的语法并不完全一致，特殊字符支持不同"], ["日与周同时指定", "多数实现按「或」处理（满足任一即触发），这是最常被误解的一条规则"], ["时区", "预览按你浏览器的本地时区计算。服务器多以 UTC 运行，部署前务必核对"], ["夏令时", "跨夏令时切换的时点可能被跳过或执行两次，关键任务不要安排在切换时段"]],
    faq: [{ question: "日和周同时指定会怎样？", answer: "多数实现按「或」处理：只要日期或星期任一匹配就触发。例如 `0 0 1 * 1` 在每月 1 号和每个周一都会执行，而不是只在「1 号且是周一」时执行。这是最常被误解的一条规则，务必用预览确认。" }, { question: "预览时间和服务器实际执行时间不一致？", answer: "预览按你浏览器的本地时区计算，而服务器和容器多数运行在 UTC。部署前请把表达式换算到服务器时区，或者在调度配置里显式声明时区。" }],
    reference: [
      ['field', 'Cron 中用空格分隔的一段，例如分钟或小时，可以包含通配符、列表、范围和步长。'],
      ['step value', '用 */n 表示每隔 n 个单位执行，例如 */15 代表每 15 分钟。'],
    ],
  },
  en: {
    overview: [
      'A Cron expression describes a repeating schedule through space-separated time fields. The parser explains common minute, hour, day, month, and weekday fields and previews upcoming runs in a selected time zone so boundaries can be checked before deployment.',
      'Cron has multiple dialects. Linux crontab commonly uses five fields, Quartz often adds seconds and a year, and platforms disagree on weekday numbering, question marks, and special characters. Compare the result with the actual scheduler documentation.',
    ],
    steps: [
      ['Confirm the target dialect', 'Check whether the deployment platform wants five fields or a seconds field and how it interprets weekdays and zones.'],
      ['Enter the expression and zone', 'Paste the complete expression and choose the zone where the task truly runs, not just local machine time.'],
      ['Review upcoming runs', 'Inspect day boundaries, month ends, daylight saving transitions, and weekdays against the business schedule.'],
    ],
    example: {
      caption: "Note the last one: with both day-of-month and weekday set, the rule is OR, so it fires on the 1st and on every Monday.",
      inputLabel: "Cron expressions",
      input: "0 9 * * 1-5\n*/15 * * * *\n0 0 1 * 1",
      outputLabel: "Parsed",
      output: "At 09:00, Monday through Friday\nEvery 15 minutes\nAt 00:00 on day 1 of the month, and at 00:00 every Monday",
      language: "text",
    },
    scenarios: [
      ['Reviewing a scheduled job', 'Verify frequency before committing a CI, Kubernetes, or server task that could otherwise run too often or too late.'],
      ['Debugging a missed run', 'Parse the expression again with its real time zone to find a misunderstood field.'],
      ["Translating a requirement into an expression and checking it", "Write \"nine every weekday morning\" as an expression, then confirm your reading of it against the next few firing times."],
    ],
    notes: [
      'The preview explains a schedule and does not create, store, or execute a real job.',
      'A daylight saving transition can repeat or skip a local time, and schedulers handle that differently.',
      'When both day-of-month and weekday are restricted, OR versus AND behavior depends on the Cron dialect.',
    ],
    specs: [["Supported fields", "The standard five (minute, hour, day, month, weekday) and the six-field form with seconds used by some implementations"], ["Output", "A human-readable description plus the next N actual firing times"], ["Dialect differences", "Linux crontab, Quartz, Kubernetes CronJob and various language libraries do not agree on special characters"], ["Day and weekday together", "Most implementations treat this as OR; fire if either matches; which is the most commonly misread rule"], ["Time zone", "Previews use your browser's local zone. Servers usually run in UTC, so check before deploying"], ["Daylight saving", "Times crossing a DST change can be skipped or run twice; do not schedule critical jobs in that window"]],
    faq: [{ question: "What happens if I set both day-of-month and weekday?", answer: "Most implementations treat it as OR: it fires if either matches. `0 0 1 * 1` runs on the 1st of every month and on every Monday, not only when the 1st is a Monday. This is the most commonly misread rule, so always confirm with the preview." }, { question: "The preview times do not match when the server actually runs it.", answer: "Previews use your browser's local time zone, while servers and containers mostly run in UTC. Convert the expression to the server's zone before deploying, or declare the time zone explicitly in the scheduler configuration." }],
    reference: [
      ['field', 'One space-separated Cron segment, such as minute or hour, supporting wildcards, lists, ranges, and steps.'],
      ['step value', 'The */n notation for every n units, such as */15 for every fifteen minutes.'],
    ],
  },
});
