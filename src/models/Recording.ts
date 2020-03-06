export interface Recording {
  videoType: string;
  mediaRecorder: MediaRecorder;
  recordedChunks: BlobPart[];
  getVideoSources: () => Promise<void>;
  handleDataAvailable: (e: BlobEvent) => void;
  handleStop: () => Promise<void>;
  selectSource: (source: Electron.DesktopCapturerSource) => Promise<void>;
}
