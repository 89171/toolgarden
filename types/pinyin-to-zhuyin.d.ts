declare module 'pinyin-to-zhuyin' {
  export interface PinyinToZhuyinOptions {
    tonemarks?: boolean;
    convertPunctuation?: boolean;
  }

  export interface ZhuyinToPinyinOptions {
    erhuaTone?: 'after-r' | 'before-r';
    nlUmlautU?: 'preserveUmlaut' | 'collapseUmlaut';
    tonemarks?: boolean;
    markNeutralTone?: boolean;
    apostrophes?: 'auto' | 'always' | 'never';
  }

  export function p2z(pinyin: string, options?: PinyinToZhuyinOptions): string;
  export function z2p(zhuyin: string, options?: ZhuyinToPinyinOptions): string;
}
