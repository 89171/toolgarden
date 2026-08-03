import { defineToolContent } from './define';

export const jsonDiffContent = defineToolContent({
  zh: {
    overview: [
      'JSON 对比先把两边解析成数据结构，再按对象 key 和数组索引递归比较。它关注的是字段路径与值，而不是缩进、换行或 key 的书写顺序，因此比普通文本 diff 更适合接口响应和配置文件。',
      '结果把新增、删除和修改分开显示，并保留发生变化的路径。对象顺序变化不会产生噪声，但数组本身有顺序，移动数组元素可能同时表现为多个索引发生变化。',
    ],
    steps: [
      ['放入基准版本', '左侧输入准备作为基准的旧数据，可以是标准 JSON、JSONC 或 JSON5。'],
      ['放入待比较版本', '右侧输入新数据；两边都解析成功后才会生成差异，语法错误会单独指出。'],
      ['沿路径核对变化', '从差异列表查看字段路径、旧值和新值，必要时复制输入回原系统确认来源。'],
    ],
    example: {
      caption: "按字段而不是按行给出差异。注意 key 顺序变化不算差异。",
      inputLabel: "两份 JSON",
      input: "// 左\n{ \"name\": \"kit\", \"port\": 8080, \"old\": 1 }\n\n// 右\n{ \"port\": 3000, \"name\": \"kit\", \"tls\": true }",
      outputLabel: "差异",
      output: "~ port   8080 → 3000\n- old    1\n+ tls    true",
      language: "diff",
    },
    scenarios: [
      ['核对 API 版本变化', '比较同一请求在两次部署前后的响应，快速发现字段新增、类型变化或默认值漂移。'],
      ['审查配置修改', '忽略格式化噪声，只检查真正被删除、添加或改值的配置项。'],
      ["定位灰度环境的差异", "同一接口在两套环境返回的响应逐字段对比，快速找出配置或数据不一致的位置。"],
    ],
    notes: [
      '数组按索引比较。中间插入一项会让后续索引整体移动，不等同于带主键的数据表 diff。',
      '数值比较遵循 JavaScript number 精度，超长整数应在源数据中以字符串保存。',
      '重复 key 在 JSON 解析时会由后一个覆盖前一个，覆盖之前的内容无法进入比较结果。',
    ],
    specs: [["比较粒度", "按字段和路径比较结构，而不是按文本行比较"], ["可识别的变化", "新增字段、删除字段、值变化、类型变化"], ["数组处理", "按下标位置对比。中间插入一项会让其后所有元素都标记为变化"], ["key 顺序", "不影响结果。两份内容相同但 key 顺序不同的 JSON 判定为一致"], ["接受的输入", "标准 JSON、JSONC、JSON5，两侧可以是不同写法"], ["与文本对比的区别", "文本对比按行比较，会被格式化差异干扰；这里只关心数据本身"]],
    faq: [{ question: "为什么数组里插一项，后面全部标成变化？", answer: "数组按下标位置比较。在中间插入一项后，原来第 2 项变成第 3 项，位置全部错开，因此后续元素都被判为变化。这是按位置比较的固有结果，不是误判。" }, { question: "key 顺序不同会被当成差异吗？", answer: "不会。比较基于结构而不是文本，两份内容相同但 key 顺序不同的 JSON 判定为一致。这一点和文本对比不同，后者会把顺序变化显示成大段差异。" }],
    reference: [
      ['structural diff', '先解析数据类型，再按对象成员与数组索引比较的差异算法。'],
      ['JSON path', '用于定位变化位置的路径表示，例如 $.user.roles[0] 指向对象中的第一个角色。'],
    ],
  },
  en: {
    overview: [
      'JSON Diff parses both documents into data structures and compares them recursively by object key and array index. It focuses on paths and values rather than indentation, line breaks, or object key order, which makes it more useful than plain text diff for API responses and configuration.',
      'The result separates additions, removals, and changed values while retaining the path of every difference. Reordering object keys is ignored, but arrays are ordered, so moving an array item can appear as changes at several indexes.',
    ],
    steps: [
      ['Enter the baseline', 'Put the older or expected document on the left. Strict JSON, JSONC, and JSON5 inputs are accepted.'],
      ['Enter the candidate', 'Put the newer document on the right. A diff is created only after both sides parse successfully.'],
      ['Review changes by path', 'Use each path, old value, and new value to trace the change back to the producing API or configuration source.'],
    ],
    example: {
      caption: "Differences are reported by field rather than by line. Note that a changed key order is not a difference.",
      inputLabel: "Two documents",
      input: "// left\n{ \"name\": \"kit\", \"port\": 8080, \"old\": 1 }\n\n// right\n{ \"port\": 3000, \"name\": \"kit\", \"tls\": true }",
      outputLabel: "Differences",
      output: "~ port   8080 → 3000\n- old    1\n+ tls    true",
      language: "diff",
    },
    scenarios: [
      ['Checking an API release', 'Compare the same response before and after deployment to catch added fields, type changes, or drifting defaults.'],
      ['Reviewing configuration edits', 'Ignore formatting churn and inspect only keys that were added, removed, or assigned a different value.'],
      ["Locating a difference between environments", "Compare the same endpoint's response from two environments field by field to find where configuration or data diverges."],
    ],
    notes: [
      'Arrays are compared by index. Inserting one item in the middle shifts later indexes and is not the same as diffing keyed database rows.',
      'Number comparison follows JavaScript number precision. Preserve very large identifiers as strings in the source data.',
      'Duplicate object keys are overwritten during parsing, so an earlier duplicate cannot appear in the diff.',
    ],
    specs: [["Comparison granularity", "By field and path through the structure, not line by line as text"], ["Changes detected", "Added fields, removed fields, changed values, changed types"], ["Arrays", "Compared by index, so inserting one item marks everything after it as changed"], ["Key order", "Irrelevant. Two documents with the same content in a different key order compare as equal"], ["Accepted input", "Strict JSON, JSONC and JSON5, and the two sides need not match"], ["vs Text Diff", "Text Diff compares lines and is confused by formatting differences; this looks only at the data"]],
    faq: [{ question: "Why does inserting one array item mark everything after it as changed?", answer: "Arrays are compared by index. Insert an item and the old second element becomes the third, shifting every position after it, so all of them register as changed. That is inherent to positional comparison, not a false positive." }, { question: "Does a different key order count as a difference?", answer: "No. Comparison is structural rather than textual, so two documents with the same content in a different key order compare as equal. Text Diff behaves differently and would show that reordering as a large change." }],
    reference: [
      ['structural diff', 'A comparison that parses values first, then walks object members and array indexes instead of comparing text lines.'],
      ['JSON path', 'A path notation for a changed location, such as $.user.roles[0] for the first role in a user object.'],
    ],
  },
});
