declare module 'upng-js' {
  export interface UpngModule {
    encode(
      imgs: Array<ArrayBuffer>,
      width: number,
      height: number,
      colors: number,
      delays?: number[]
    ): ArrayBuffer;
  }

  export const encode: UpngModule['encode'];

  const UPNG: UpngModule;
  export default UPNG;
}
