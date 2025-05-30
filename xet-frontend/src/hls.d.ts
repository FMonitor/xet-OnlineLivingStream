// src/types/hls.d.ts (新建文件)
declare module 'hls.js' {
  export default Hls;
  export interface HlsConfig {
    enableWorker?: boolean;
    lowLatencyMode?: boolean;
    backBufferLength?: number;
    maxBufferLength?: number;
    maxMaxBufferLength?: number;
    maxBufferSize?: number;
    maxBufferHole?: number;
    highBufferWatchdogPeriod?: number;
    nudgeOffset?: number;
    nudgeMaxRetry?: number;
    maxFragLookUpTolerance?: number;
    liveSyncDurationCount?: number;
    liveMaxLatencyDurationCount?: number;
    liveDurationInfinity?: boolean;
    liveBackBufferLength?: number;
    enableSoftwareAES?: boolean;
    manifestLoadingTimeOut?: number;
    manifestLoadingMaxRetry?: number;
    manifestLoadingRetryDelay?: number;
    levelLoadingTimeOut?: number;
    levelLoadingMaxRetry?: number;
    levelLoadingRetryDelay?: number;
    fragLoadingTimeOut?: number;
    fragLoadingMaxRetry?: number;
    fragLoadingRetryDelay?: number;
  }
}