import { defineToolContent } from './define';

export const timestampContent = defineToolContent({
  zh: {
    overview: [
      '时间戳用一个数字表示某个统一时间点，常见单位是秒或毫秒。它不携带时区信息，转换成人类可读时间时必须结合时区；同一个时间戳在上海和伦敦会显示不同的本地钟表时间，但指向同一瞬间。',
      '本工具用于 Unix 时间戳与日期时间之间的双向换算，并明确展示单位和本地结果。处理接口日志、数据库字段或签名参数时，先判断数字位数和约定单位，可避免把毫秒误当成秒而得到远离当前年份的日期。',
    ],
    steps: [
      ['选择转换方向', '根据已有数据选择时间戳转日期，或日期转时间戳。'],
      ['确认单位与时区', '检查输入使用秒还是毫秒，并确认日期应按哪个时区解释。'],
      ['核对转换结果', '对照 ISO 时间和本地时间，确认日期、时分秒及单位都符合来源系统。'],
    ],
    example: {
      caption: "位数决定精度。同一个数字按不同精度解析，结果相差数万年。",
      inputLabel: "时间戳",
      input: "1767225600\n1767225600000\n1767225600000000",
      outputLabel: "解析结果（UTC）",
      output: "10 位 → 秒     2026-01-01 00:00:00\n13 位 → 毫秒   2026-01-01 00:00:00\n16 位 → 微秒   2026-01-01 00:00:00",
      language: "text",
    },
    scenarios: [
      ['排查日志事件', '把接口或数据库中的时间戳转换为可读时间，按真实发生顺序定位问题。'],
      ['准备 API 参数', '将选定的日期时间转换为服务端要求的秒级或毫秒级整数。'],
      ["核对跨时区的事件顺序", "日志里的时间戳换算到同一时区后再排序，避免因为服务器和本地时区不同而误判事件先后。"],
    ],
    notes: [
      '10 位数字通常是秒，13 位数字通常是毫秒，但最终应以接口文档为准。',
      'Unix 时间戳以 UTC 基准计算，不等于没有时区差异的本地日期字符串。',
      '只有日期而没有时区的输入可能按浏览器本地时区解释，跨地区协作时建议使用带偏移量的 ISO 8601 格式。',
    ],
    specs: [["支持精度", "秒、毫秒、微秒。位数不同的时间戳会被自动识别"], ["转换方向", "时间戳 → 日期与日期 → 时间戳双向，支持批量"], ["时区", "可选择输出时区。同一个时间戳在不同时区显示为不同的本地时间，但它本身不含时区信息"], ["Unix 纪元", "以 1970-01-01 00:00:00 UTC 为零点，之前的时间为负数"], ["2038 问题", "32 位有符号秒级时间戳在 2038-01-19 溢出。现代系统多用 64 位，处理老数据时需留意"], ["常见错误", "把毫秒时间戳当秒解析会得到 5 万年后的日期，反之会得到 1970 年附近"]],
    faq: [{ question: "为什么算出来的日期是 1970 年或者五万年后？", answer: "精度用错了。把毫秒时间戳当成秒解析，得到的是五万年后；把秒当成毫秒解析，得到的是 1970 年附近。看位数判断：10 位是秒，13 位是毫秒，16 位是微秒。" }, { question: "时间戳自带时区信息吗？", answer: "不带。Unix 时间戳表示的是从 1970-01-01 00:00:00 UTC 起经过的绝对时间，同一个值在全球任何地方都指向同一瞬间。你看到的日期不同，只是显示时套用了不同的本地时区。" }],
    reference: [
      ['Unix epoch', '1970 年 1 月 1 日 00:00:00 UTC，Unix 时间戳的计时起点。'],
      ['ISO 8601', '常用的日期时间交换格式，可明确写出 UTC 的 Z 或具体时区偏移。'],
    ],
  },
  en: {
    overview: [
      'A timestamp represents one absolute instant as a number, usually in seconds or milliseconds. It carries no display time zone. The same value appears as different wall-clock times in Shanghai and London while still pointing to the same instant.',
      'This tool converts between Unix timestamps and readable date-time values while making the unit and local result visible. When handling API logs, database fields, or signature parameters, identify the expected unit first so milliseconds are not accidentally interpreted as seconds.',
    ],
    steps: [
      ['Choose a direction', 'Select timestamp to date or date to timestamp according to the source value.'],
      ['Confirm unit and time zone', 'Check whether the number uses seconds or milliseconds and how the date input should be interpreted.'],
      ['Verify the result', 'Compare the ISO and local representations, including date, time, and unit, with the source system.'],
    ],
    example: {
      caption: "Digit count sets the precision. Read the same number at the wrong precision and you are tens of thousands of years out.",
      inputLabel: "Timestamps",
      input: "1767225600\n1767225600000\n1767225600000000",
      outputLabel: "Parsed (UTC)",
      output: "10 digits → seconds       2026-01-01 00:00:00\n13 digits → milliseconds  2026-01-01 00:00:00\n16 digits → microseconds  2026-01-01 00:00:00",
      language: "text",
    },
    scenarios: [
      ['Investigating logs', 'Turn stored timestamps into readable times and reconstruct the real order of service events.'],
      ['Preparing an API parameter', 'Convert a chosen date-time into the integer unit required by a server endpoint.'],
      ["Checking event order across time zones", "Convert log timestamps into one zone before sorting, so a difference between server and local time does not reverse the apparent sequence."],
    ],
    notes: [
      'Ten digits commonly means seconds and thirteen commonly means milliseconds, but the source documentation is authoritative.',
      'Unix time is measured from a UTC baseline; that is different from a local date string with no time-zone context.',
      'An input without an offset may be interpreted in the browser time zone. Prefer ISO 8601 with `Z` or an explicit offset for cross-region work.',
    ],
    specs: [["Precision", "Seconds, milliseconds and microseconds, detected automatically from the digit count"], ["Directions", "Timestamp to date and date to timestamp, with batch input"], ["Time zones", "Choose the output zone. One timestamp renders as different local times, but the value itself carries no zone"], ["Unix epoch", "Zero is 1970-01-01 00:00:00 UTC; earlier moments are negative"], ["Year 2038", "A signed 32-bit second timestamp overflows on 2038-01-19. Modern systems use 64-bit, but watch for it in legacy data"], ["Classic mistake", "Reading a millisecond timestamp as seconds lands you 50,000 years out; the reverse lands you near 1970"]],
    faq: [{ question: "Why did I get 1970, or a date 50,000 years out?", answer: "Wrong precision. Reading a millisecond timestamp as seconds lands you 50,000 years ahead; reading seconds as milliseconds lands you near 1970. Judge by digit count: 10 is seconds, 13 is milliseconds, 16 is microseconds." }, { question: "Does a timestamp carry a time zone?", answer: "No. A Unix timestamp is absolute time elapsed since 1970-01-01 00:00:00 UTC, and one value names the same instant everywhere on earth. Different displayed dates only reflect a different local zone applied at render time." }],
    reference: [
      ['Unix epoch', '1970-01-01 00:00:00 UTC, the starting instant used by Unix timestamps.'],
      ['ISO 8601', 'A common exchange format that can state UTC with `Z` or include a numeric time-zone offset.'],
    ],
  },
});
