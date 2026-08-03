import type { ToolContent } from './types';

export const uuidContent: ToolContent = {
  zh: {
    overview: [
      'UUID 是一个 128 位的标识符，靠「取值空间足够大」而不是靠中央协调来保证不重复。这带来一个很实际的好处：客户端可以在完全离线、不询问数据库的情况下自己生成主键，多个服务同时写入也不会撞号。代价是它比自增整数长得多，也不携带任何顺序信息。',
      '不同版本解决的是不同问题。v4 是纯随机，适合绝大多数场景；v7 把毫秒级时间戳放在高位，因此按字符串排序就等于按生成时间排序，这对数据库索引很关键；v1 也含时间，但把 MAC 地址写进了标识符，会泄露生成设备的信息。NanoID 不是 UUID，它用更短的字符集换取更短的字符串，适合出现在 URL 里。',
      '生成使用浏览器的 `crypto.getRandomValues()`，也就是操作系统提供的密码学安全随机源，不是 `Math.random()`。这一点在标识符被当作难以猜测的凭据使用时很重要。',
    ],
    steps: [
      {
        title: '选择版本',
        detail: 'v4 用于一般标识，v7 用于需要按时间排序的数据库主键，v1 仅在对接要求它的旧系统时使用，NanoID 用于需要短标识的 URL 和分享链接。',
      },
      {
        title: '设置数量',
        detail: '可以一次生成多个。批量生成适合准备测试数据或预先分配一批标识。',
      },
      {
        title: '按目标系统调整格式',
        detail: '可以切换大小写，也可以去掉连字符。有些数据库列和旧接口只接受 32 位无连字符的形式，需要在这里对齐。',
      },
      {
        title: '复制使用',
        detail: '直接复制结果。生成完全在本地完成，不经过服务器，因此同一个值不会在别处出现。',
      },
    ],
    example: {
      caption: '四种标识符的形态对比。注意 v7 前半段随时间递增，所以按字典序排序就是按生成时间排序。',
      inputLabel: '版本',
      input: `v4
v7
v1
NanoID`,
      outputLabel: '生成结果示例',
      output: `9f8e7d6c-5b4a-4938-a271-6f0e5d4c3b2a
019205c7-3e80-7b19-8f42-1a9c7d3e5b60
6ba7b810-9dad-11d1-80b4-00c04fd430c8
V1StGXR8_Z5jdHi6B-myT`,
    },
    specs: [
      { label: 'v4', value: '122 位随机。无时间信息，无排序性，适合绝大多数标识场景' },
      { label: 'v7', value: '高位为 48 位毫秒时间戳 + 随机低位。字符串排序即时间排序' },
      { label: 'v1', value: '时间戳 + 节点标识。会把 MAC 地址写入标识符，存在信息泄露风险' },
      { label: 'NanoID', value: '默认 21 字符，使用 URL 安全字符集，比 UUID 短且可直接放进链接' },
      { label: '随机源', value: '浏览器 `crypto.getRandomValues()`，即操作系统的密码学安全随机源' },
      { label: '输出格式', value: '支持大小写切换与去除连字符，用于对齐目标系统的要求' },
    ],
    scenarios: [
      {
        title: '客户端先生成主键再提交',
        detail: '离线优先的应用需要在没有网络时创建记录。用 UUID 作为主键，客户端可以立刻生成 id 并在本地建立关联关系，等联网后整批同步，不必等服务端返回自增 id。',
      },
      {
        title: '给数据库主键选一个可排序的标识',
        detail: 'v4 完全随机，作为聚簇索引主键会导致插入位置随机分布、页分裂频繁。v7 的高位递增，插入总是发生在索引末尾，这是它存在的主要理由。',
      },
      {
        title: '准备测试与联调数据',
        detail: '批量生成一组标识用于填充测试用例或 mock 数据。因为生成在本地完成且取值空间极大，这些值不会与真实环境的数据冲突。',
      },
    ],
    notes: [
      'UUID 唯一但不保密。它由随机数构成，不含校验位，也无法验证真伪。把它当作难以枚举的 URL 标识是合理的；把它当作访问凭据（「知道这个 id 就能看到数据」）不安全，因为它可能出现在日志、Referer 头和浏览器历史里。',
      'v1 会把生成设备的 MAC 地址写进标识符。这意味着任何拿到该 UUID 的人都能推断出生成它的机器，以及大致的生成时间。除了对接明确要求 v1 的旧系统，不建议使用。',
      'v7 按设计会暴露生成时间：这是它可排序的代价。如果记录的创建时间本身属于敏感信息（例如不希望外部推断出业务量增长节奏），就不要把 v7 暴露在公开接口里。',
      '数据库里用字符串存 UUID 比用 16 字节二进制多占一倍以上空间，索引也更大。数据量大时值得考虑用二进制类型存储，只在接口层转成字符串形式。',
    ],
    reference: [
      { term: 'RFC 9562', definition: 'UUID 的现行标准，取代了早先的 RFC 4122，并正式定义了 v6、v7、v8。v7 就是在这一版里标准化的。' },
      { term: '版本位与变体位', definition: 'UUID 的第 13 个十六进制字符标识版本（v4 是 4，v7 是 7），第 17 个字符标识变体。这就是为什么 v4 的这一位总是 4，而不是完全随机。' },
      { term: '单调递增', definition: 'v7 的关键性质：后生成的值在字典序上更大。数据库聚簇索引因此能顺序追加，避免随机插入引起的页分裂。' },
      { term: 'NanoID', definition: '不属于 UUID 标准的替代方案。默认 21 个 URL 安全字符，碰撞概率与 UUID v4 同量级，但字符串更短。' },
    ],
    faq: [
      {
        question: '两次生成会撞上同一个 UUID 吗？',
        answer: '实践中不会。v4 有 122 位随机，即使每秒生成十亿个、持续上百年，出现一次碰撞的概率仍然可以忽略。这也是 UUID 不需要中央协调就能保证唯一的原因。',
      },
      {
        question: '数据库主键该用 v4 还是 v7？',
        answer: '需要按时间排序、或者主键是聚簇索引时用 v7：它的高位随时间递增，插入总在索引末尾，避免页分裂。不需要排序性、且不希望暴露创建时间时用 v4。',
      },
      {
        question: 'UUID 可以当作访问令牌吗？',
        answer: '不建议。它没有有效期、无法吊销、也不能验证签发方，而且很容易随 URL 泄露到日志和浏览器历史中。需要凭据请用 JWT 或服务端签发的 session token。',
      },
    ],
  },
  en: {
    overview: [
      'A UUID is a 128-bit identifier that avoids collisions by having an enormous value space rather than by coordinating with anyone. The practical payoff is that a client can mint its own primary key while completely offline, without asking a database, and several services can write concurrently without clashing. The cost is that it is far longer than an auto-increment integer and carries no ordering information.',
      'The versions solve different problems. v4 is pure randomness and fits almost every case. v7 puts a millisecond timestamp in the high bits, so sorting the strings sorts by creation time; which matters a great deal to database indexes. v1 also carries time, but writes the MAC address into the identifier and therefore leaks information about the machine. NanoID is not a UUID at all: it trades a different alphabet for a shorter string, which is what you want in a URL.',
      'Generation uses the browser\'s `crypto.getRandomValues()`; the operating system\'s cryptographically secure random source, not `Math.random()`. That distinction matters whenever an identifier is treated as something hard to guess.',
    ],
    steps: [
      {
        title: 'Pick a version',
        detail: 'v4 for general identifiers, v7 for database keys that need time ordering, v1 only when an older system explicitly requires it, NanoID for short identifiers in URLs and share links.',
      },
      {
        title: 'Set how many you need',
        detail: 'Generate a batch at once; useful for seeding test data or pre-allocating a block of identifiers.',
      },
      {
        title: 'Match the target system\'s format',
        detail: 'Switch case, or strip the hyphens. Some database columns and older APIs accept only the 32-character unhyphenated form, so align it here.',
      },
      {
        title: 'Copy and use',
        detail: 'Copy the results straight out. Generation is entirely local and never touches a server, so the same value is not handed to anyone else.',
      },
    ],
    example: {
      caption: 'The four shapes side by side. Note how the leading section of v7 increases over time, so lexicographic order equals creation order.',
      inputLabel: 'Version',
      input: `v4
v7
v1
NanoID`,
      outputLabel: 'Example output',
      output: `9f8e7d6c-5b4a-4938-a271-6f0e5d4c3b2a
019205c7-3e80-7b19-8f42-1a9c7d3e5b60
6ba7b810-9dad-11d1-80b4-00c04fd430c8
V1StGXR8_Z5jdHi6B-myT`,
    },
    specs: [
      { label: 'v4', value: '122 random bits. No time information, no ordering; right for most identifiers' },
      { label: 'v7', value: 'A 48-bit millisecond timestamp in the high bits, random below. String order equals time order' },
      { label: 'v1', value: 'Timestamp plus node identifier. Embeds the MAC address, so it leaks host information' },
      { label: 'NanoID', value: '21 characters by default from a URL-safe alphabet; shorter than a UUID and safe in a link' },
      { label: 'Random source', value: 'The browser\'s `crypto.getRandomValues()`, backed by the OS cryptographic RNG' },
      { label: 'Output format', value: 'Case switching and hyphen removal, to match what the target system accepts' },
    ],
    scenarios: [
      {
        title: 'Minting the primary key on the client',
        detail: 'Offline-first applications have to create records with no network. With UUID keys the client assigns an id immediately, wires up local relationships, and syncs the batch later; no waiting on a server-side auto-increment.',
      },
      {
        title: 'Choosing a sortable identifier for a database key',
        detail: 'A fully random v4 used as a clustered index key scatters inserts across the index and causes frequent page splits. v7\'s high bits increase, so inserts land at the end of the index; that is essentially why v7 exists.',
      },
      {
        title: 'Seeding tests and integration data',
        detail: 'Generate a batch to populate fixtures or mock payloads. Because generation is local and the value space is vast, none of it will collide with anything in a real environment.',
      },
    ],
    notes: [
      'A UUID is unique but not secret. It is made of random bits, has no check digit, and cannot be validated as authentic. Using one as a hard-to-enumerate URL identifier is reasonable; using one as an access credential; "knowing the id grants access"; is not, because it will end up in logs, Referer headers and browser history.',
      'v1 writes the generating machine\'s MAC address into the identifier. Anyone holding that UUID can infer which host produced it and roughly when. Avoid it unless a legacy system specifically demands v1.',
      'v7 exposes creation time by design; that is the price of being sortable. If the creation timestamp is itself sensitive; you would rather outsiders could not infer your growth rate; do not put v7 on a public interface.',
      'Storing a UUID as a string in a database costs more than twice the space of 16 raw bytes, and enlarges the index with it. At scale, consider a binary column and convert to the string form only at the API boundary.',
    ],
    reference: [
      { term: 'RFC 9562', definition: 'The current UUID standard, superseding RFC 4122 and formally defining v6, v7 and v8. v7 was standardised in this revision.' },
      { term: 'Version and variant bits', definition: 'The 13th hexadecimal character encodes the version (4 for v4, 7 for v7) and the 17th encodes the variant. That is why the same position in every v4 is always 4 rather than random.' },
      { term: 'Monotonicity', definition: 'v7\'s key property: a later value sorts higher lexicographically. It lets a clustered database index append sequentially instead of suffering random-insert page splits.' },
      { term: 'NanoID', definition: 'An alternative outside the UUID standard: 21 URL-safe characters by default, with collision odds comparable to UUID v4 but a shorter string.' },
    ],
    faq: [
      {
        question: 'Could two generated UUIDs collide?',
        answer: 'Not in practice. v4 carries 122 random bits; generate a billion per second for centuries and the chance of a single collision remains negligible. That is precisely why UUIDs need no central coordination to stay unique.',
      },
      {
        question: 'v4 or v7 for a database primary key?',
        answer: 'v7 when you need time ordering, or when the key is a clustered index: its high bits increase, so inserts land at the end and avoid page splits. v4 when you do not need ordering and would rather not reveal creation times.',
      },
      {
        question: 'Can I use a UUID as an access token?',
        answer: 'Not advisable. It has no expiry, cannot be revoked, carries no verifiable issuer, and leaks readily through URLs into logs and browser history. Use a JWT or a server-issued session token when you need a credential.',
      },
    ],
  },
};
