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
