import { defineToolContent } from './define';

export const jsonFlattenContent = defineToolContent({
  zh: {
    overview: [
      'Flatten 把嵌套对象和数组改写为“路径到值”的一层对象，例如 user.address.city 变成单个 key。Unflatten 读取这些路径并重新建立容器，适合在不支持嵌套结构的表格、环境变量或键值存储之间搬运数据。',
      '分隔符是格式的一部分。如果原始 key 本身包含同样的点号或自定义分隔符，展开后会产生歧义；数组索引也需要保留为数字路径段，才能在还原时创建数组而不是普通对象。',
    ],
    steps: [
      ['选择展开或还原', 'Flatten 输入嵌套 JSON，Unflatten 输入以路径为 key 的一层对象。'],
      ['确认路径分隔符', '使用与目标系统兼容且不会出现在原始 key 里的分隔符。'],
      ['检查数组和空容器', '转换后重点核对数组索引、空对象、空数组及包含特殊字符的 key。'],
    ],
    example: {
      caption: "嵌套结构与路径键的对照。数组位置用方括号下标表示。",
      inputLabel: "嵌套 JSON",
      input: "{\n  \"user\": {\n    \"name\": \"kit\",\n    \"tags\": [\"a\", \"b\"]\n  }\n}",
      outputLabel: "平铺后",
      output: "{\n  \"user.name\": \"kit\",\n  \"user.tags[0]\": \"a\",\n  \"user.tags[1]\": \"b\"\n}",
      language: "json",
    },
    scenarios: [
      ['导出到表格列', '把嵌套配置展开成稳定路径列，便于筛选、对照和批量编辑。'],
      ['生成环境变量映射', '把层级配置变成一层键值对，再按部署系统的命名规则替换分隔符。'],
      ["把深层嵌套压平便于逐字段核对", "层级很深的配置平铺成路径列表后，可以逐行和另一份对照，比在树形结构里翻找更可靠。"],
    ],
    notes: [
      '原 key 含分隔符时无法无损区分“key 的一部分”和“层级边界”。',
      '稀疏数组还原后可能包含空位置，序列化时这些位置通常表现为 null。',
      '空对象与空数组没有叶子值，具体能否保留取决于展开格式的占位规则。',
    ],
    specs: [["两个方向", "把嵌套结构平铺为路径键，或从路径键还原嵌套结构"], ["路径表示", "用点号连接对象层级，用下标表示数组位置，如 user.tags[0]"], ["典型用途", "把嵌套 JSON 塞进只接受扁平键值的地方：环境变量、表格列、部分配置系统"], ["还原的前提", "路径键必须格式规范。手工拼写的路径出错时无法正确还原层级"], ["键名含点号", "原始 key 里本身带点号时，平铺后无法区分层级边界，还原会出错"], ["空对象与空数组", "平铺后没有对应的叶子节点，还原时可能丢失这两种空容器"]],
    faq: [{ question: "还原后为什么和原始结构不一样？", answer: "有两种常见原因：原始 key 里本身含点号，平铺后无法区分层级边界；以及原结构里有空对象或空数组，它们没有叶子节点可平铺，还原时就消失了。这两种情况都需要人工确认。" }, { question: "路径里的数组下标用什么表示？", answer: "用方括号，例如 `user.tags[0]`。手工书写路径时下标格式必须一致，否则还原时会把它当作普通的键名而不是数组位置。" }],
    reference: [
      ['leaf value', '递归结构中不再包含子成员的最终值，展开后每个路径通常指向一个叶子。'],
      ['delimiter', '连接路径段的字符，例如点号或大于号；必须与数据中的真实 key 区分。'],
    ],
  },
  en: {
    overview: [
      'Flatten rewrites nested objects and arrays as one object mapping paths to leaf values, such as user.address.city becoming one key. Unflatten reads those paths and rebuilds containers, which is useful when moving data through spreadsheets, environment variables, or key-value stores that do not support nesting.',
      'The delimiter is part of the format. If an original key already contains the same dot or custom delimiter, the flattened result is ambiguous. Array indexes also need to remain numeric path segments so unflatten can rebuild arrays instead of ordinary objects.',
    ],
    steps: [
      ['Choose flatten or unflatten', 'Flatten accepts nested JSON; Unflatten accepts a one-level object whose keys encode paths.'],
      ['Confirm the path delimiter', 'Use a separator accepted by the destination and absent from original property names.'],
      ['Review arrays and empty containers', 'Check array indexes, empty objects, empty arrays, and keys containing punctuation after conversion.'],
    ],
    example: {
      caption: "Nested structure against its path-key form. Array positions are written as bracketed indexes.",
      inputLabel: "Nested JSON",
      input: "{\n  \"user\": {\n    \"name\": \"kit\",\n    \"tags\": [\"a\", \"b\"]\n  }\n}",
      outputLabel: "Flattened",
      output: "{\n  \"user.name\": \"kit\",\n  \"user.tags[0]\": \"a\",\n  \"user.tags[1]\": \"b\"\n}",
      language: "json",
    },
    scenarios: [
      ['Creating spreadsheet columns', 'Turn nested configuration into stable path columns for filtering, comparison, and bulk editing.'],
      ['Preparing environment variable mappings', 'Flatten a hierarchy, then adapt the delimiter to the naming convention used by the deployment system.'],
      ["Flattening deep nesting for field-by-field review", "A deeply nested config becomes a list of paths you can compare line by line against another copy; more reliable than clicking through a tree."],
    ],
    notes: [
      'If a real key contains the delimiter there is no lossless way to distinguish key text from a hierarchy boundary.',
      'Sparse arrays can contain empty positions after reconstruction; JSON serialization usually renders those positions as null.',
      'Empty objects and arrays have no leaf value, so preservation depends on whether the flattening format records a placeholder.',
    ],
    specs: [["Two directions", "Flatten nesting into path keys, or rebuild nesting from path keys"], ["Path notation", "Dots join object levels and brackets index arrays, as in user.tags[0]"], ["Typical use", "Getting nested JSON into somewhere that only accepts flat key-values: environment variables, spreadsheet columns, some config systems"], ["Precondition for rebuilding", "Path keys must be well-formed; hand-typed paths with mistakes will not reconstruct correctly"], ["Keys containing dots", "An original key with a dot in it becomes ambiguous once flattened, and unflattening gets it wrong"], ["Empty objects and arrays", "They have no leaf to flatten to, so these empty containers can be lost on the round trip"]],
    faq: [{ question: "Why does unflattening not reproduce the original?", answer: "Two common causes: an original key containing a dot becomes ambiguous once flattened, and empty objects or arrays have no leaf to flatten to and so disappear. Both need a human check." }, { question: "How are array indexes written in a path?", answer: "In brackets, as in `user.tags[0]`. Hand-written paths must use that form consistently, or unflattening treats the index as an ordinary key name rather than an array position." }],
    reference: [
      ['leaf value', 'A final value with no child members; each flattened path normally points to one leaf.'],
      ['delimiter', 'The character joining path segments, such as a dot or greater-than sign, which must not collide with real keys.'],
    ],
  },
});
