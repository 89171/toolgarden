import { defineToolContent } from './define';

export const jwtContent = defineToolContent({
  zh: {
    overview: [
      'JSON Web Token 通常由以点号分隔的 header、payload 和 signature 三部分组成。前两部分使用 Base64URL 编码，可以直接解码查看算法声明、签发方、受众、过期时间和业务声明；编码并不等于加密，payload 不应存放秘密。',
      '本工具用于在浏览器中检查 JWT 的结构与声明，方便排查登录、接口鉴权和令牌过期问题。仅能读出内容不代表签名可信，真正的身份验证必须由服务端使用可信密钥、固定算法和严格的声明校验完成。',
    ],
    steps: [
      ['粘贴完整令牌', '输入三段式 JWT，避免附带 `Bearer` 前缀、引号或多余空格。'],
      ['查看头部与载荷', '确认算法、密钥标识及 `iss`、`aud`、`exp`、`nbf` 等标准声明。'],
      ['在服务端验证', '需要信任令牌时，使用后端 JWT 库和可信配置完成签名及声明验证。'],
    ],
    example: {
      caption: "payload 只是 Base64URL 编码，不是加密：任何拿到 token 的人都能读出下面这些内容。",
      inputLabel: "JWT",
      input: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzY3MjI1NjAwfQ.<signature>",
      outputLabel: "解码结果",
      output: "// header\n{ \"alg\": \"HS256\" }\n\n// payload\n{ \"sub\": \"1\", \"role\": \"admin\", \"exp\": 1767225600 }\nexp → 2026-01-01 00:00:00 UTC",
      language: "json",
    },
    scenarios: [
      ['排查过期登录', '把 `exp` 和 `nbf` 转换为可读时间，检查客户端与服务端时钟差异。'],
      ['核对鉴权配置', '比较签发方、受众、算法和 key ID，定位环境或密钥轮换配置错误。'],
      ["确认 token 里携带的权限声明", "排查用户「有权限但被拒绝」时，先解开 token 看实际下发的角色和作用域，判断问题在签发端还是校验端。"],
    ],
    notes: [
      '解码是读取编码内容，不是验证签名，也不能证明令牌由可信系统签发。',
      'JWT 可能包含用户标识和权限等敏感信息，不要粘贴仍有效的生产令牌到不可信页面。',
      '服务端应限制允许的算法，并验证过期时间、签发方、受众和使用场景需要的其它声明。',
    ],
    specs: [["解析内容", "Header、Payload 与签名三段，Payload 中的时间字段会转成可读日期"], ["签名验证", "支持 HS256 对称算法。RS256 等非对称算法需要公钥，不在本工具处理范围"], ["Payload 不是加密的", "它只是 Base64URL 编码，任何拿到 token 的人都能直接读出内容：不要在里面放密码或密钥"], ["关键声明", "exp 过期时间、iat 签发时间、nbf 生效时间、iss 签发方、aud 接收方"], ["解析成功 ≠ token 有效", "能解出内容只说明格式正确。是否过期、签名是否可信、是否被吊销要另行判断"], ["安全提醒", "生产环境的 token 等同于凭据。调试时请优先使用测试环境签发的 token"]],
    faq: [{ question: "解析出内容就说明 token 有效吗？", answer: "不说明。解析只验证格式，你还需要另外确认三件事：exp 是否已过期、签名是否可信、以及该 token 是否已被服务端吊销。三者任一不满足，token 就不该被接受。" }, { question: "为什么不能在 payload 里放敏感信息？", answer: "payload 只是 Base64URL 编码，不是加密。任何拿到 token 的人都能直接读出全部内容，不需要密钥。密码、身份证号、内部 ID 都不应该放进去。" }],
    reference: [
      ['Base64URL', '适合 URL 的 Base64 变体，使用 `-` 和 `_` 并通常省略末尾填充。'],
      ['registered claims', 'JWT 标准定义的一组常用声明，包括 `iss`、`sub`、`aud`、`exp` 和 `nbf`。'],
    ],
  },
  en: {
    overview: [
      'A JSON Web Token commonly has header, payload, and signature segments separated by dots. The first two are Base64URL encoded and can be decoded to inspect the declared algorithm, issuer, audience, expiry, and application claims. Encoding is not encryption, so the payload must not contain secrets.',
      'This browser tool inspects JWT structure and claims when diagnosing sign-in, API authorization, and expiry problems. Readable content does not make the signature trustworthy. Real authentication requires server-side verification with trusted keys, an allowlisted algorithm, and strict claim checks.',
    ],
    steps: [
      ['Paste the complete token', 'Enter the three JWT segments without a `Bearer` prefix, quotes, or surrounding whitespace.'],
      ['Inspect header and payload', 'Check the algorithm, key identifier, and standard claims such as `iss`, `aud`, `exp`, and `nbf`.'],
      ['Verify on the server', 'When trust matters, use a backend JWT library and trusted configuration to validate the signature and claims.'],
    ],
    example: {
      caption: "The payload is only Base64URL encoded, not encrypted; anyone holding the token can read everything below.",
      inputLabel: "JWT",
      input: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzY3MjI1NjAwfQ.<signature>",
      outputLabel: "Decoded",
      output: "// header\n{ \"alg\": \"HS256\" }\n\n// payload\n{ \"sub\": \"1\", \"role\": \"admin\", \"exp\": 1767225600 }\nexp → 2026-01-01 00:00:00 UTC",
      language: "json",
    },
    scenarios: [
      ['Diagnosing an expired session', 'Convert `exp` and `nbf` values to readable time and check for client-server clock skew.'],
      ['Checking authorization configuration', 'Compare issuer, audience, algorithm, and key ID to find environment or key-rotation mistakes.'],
      ["Checking which claims a token actually carries", "When a user is \"authorised but denied\", decode the token to see the roles and scopes that were really issued, which tells you whether the problem is at the issuer or the verifier."],
    ],
    notes: [
      'Decoding only reads encoded data. It neither verifies the signature nor proves who issued the token.',
      'JWTs can contain user identifiers and privileges. Do not paste a live production token into an untrusted page.',
      'Servers should restrict accepted algorithms and validate expiry, issuer, audience, and any claims required by the use case.',
    ],
    specs: [["What it decodes", "The header, payload and signature, with time claims in the payload rendered as readable dates"], ["Signature verification", "HS256 symmetric verification is supported. Asymmetric algorithms such as RS256 need a public key and are out of scope here"], ["The payload is not encrypted", "It is only Base64URL encoded, so anyone holding the token can read it; never put passwords or secrets inside"], ["Key claims", "exp expiry, iat issued-at, nbf not-before, iss issuer, aud audience"], ["Decoding is not validation", "A successful decode only proves the format is right. Expiry, signature trust and revocation are separate questions"], ["Security note", "A production token is a credential. Prefer tokens issued by a test environment when debugging"]],
    faq: [{ question: "Does a successful decode mean the token is valid?", answer: "No. Decoding only proves the format. Three separate things still need checking: whether exp has passed, whether the signature is trustworthy, and whether the server has revoked it. Fail any one and the token should not be accepted." }, { question: "Why should sensitive data stay out of the payload?", answer: "The payload is Base64URL encoded, not encrypted. Anyone holding the token can read all of it with no key at all. Passwords, national ID numbers and internal identifiers do not belong there." }],
    reference: [
      ['Base64URL', 'A URL-safe Base64 variant that uses `-` and `_` and commonly omits trailing padding.'],
      ['registered claims', 'Standard JWT claim names including `iss`, `sub`, `aud`, `exp`, and `nbf`.'],
    ],
  },
});
