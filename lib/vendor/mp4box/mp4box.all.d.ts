/**
 * mp4box.all.js（v0.5.4，GPAC mp4box.js 构建产物）的最小类型声明。
 *
 * 只覆盖视频重编码管线用到的部分：解封装、轨道信息、样本回调。
 * 上游包未提供 .d.ts，这里按实际结构手写，避免引入 @types/mp4box（已废弃）。
 */

export interface Mp4SampleEntry {
  avcC?: {
    configurationVersion?: number;
    AVCProfileIndication?: number;
    profile_compatibility?: number;
    AVCLevelIndication?: number;
    lengthSizeMinusOne?: number;
    SPS?: Array<{ nalu: Uint8Array }>;
    PPS?: Array<{ nalu: Uint8Array }>;
    ext?: Uint8Array;
  };
}

export interface Mp4VideoTrack {
  id: number;
  codec: string;
  timescale: number;
  duration: number;
  nb_samples: number;
  track_width: number;
  track_height: number;
  video: { width: number; height: number };
}

export interface Mp4Info {
  videoTracks?: Mp4VideoTrack[];
  audioTracks?: Array<{ id: number; codec: string }>;
}

export interface Mp4Sample {
  data: Uint8Array;
  cts: number;
  dts: number;
  duration: number;
  timescale: number;
  is_sync: boolean;
}

export interface Mp4BoxFile {
  onReady?: (info: Mp4Info) => void;
  onError?: (message: string) => void;
  onSamples?: (id: number, user: unknown, samples: Mp4Sample[]) => void;
  appendBuffer(buffer: ArrayBuffer & { fileStart?: number }): number;
  flush(): void;
  start(): void;
  stop(): void;
  setExtractionOptions(id: number, user?: unknown, options?: { nbSamples?: number }): void;
  getTrackById(id: number): {
    mdia?: {
      minf?: {
        stbl?: {
          stsd?: { entries?: Mp4SampleEntry[] };
        };
      };
    };
  };
}

export function createFile(keepMdatData?: boolean): Mp4BoxFile;
