export type ToolCategory = 'format' | 'convert' | 'validate' | 'encode';

export interface ToolMeta {
  /** 路由唯一标识，对应 app/<id>/page.tsx */
  id: string;
  /** 工具显示名称 */
  name: string;
  /** 一句话描述 */
  description: string;
  /** 页面路径，由 id 推导，也可显式覆盖 */
  path: string;
  /** 展示图标（emoji 或 SVG 字符串） */
  icon: string;
  /** 工具分类，用于首页分组 */
  category: ToolCategory;
  /** 是否在首页置顶展示 */
  featured?: boolean;
}

/**
 * Hub 页分类正文。存放于 messages.hub_content.<hubKey>，只由服务端 hub 页读取，
 * 不进客户端 messages（见 getClientMessages）。
 */
export interface HubArticleContent {
  /** 导语，放在工具栅格上方，说明这一类工具解决什么问题。 */
  lead: string[];
  /** 怎么在这一类工具里选，放在栅格下方。 */
  choosing: Array<{ title: string; detail: string }>;
  /** 格式 / 能力对照表，用真表格承载。 */
  comparison?: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
  /** 这一类工具共同的边界和注意事项。 */
  notes: string[];
}
