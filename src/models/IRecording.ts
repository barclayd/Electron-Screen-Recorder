export interface IRecording {
  setup: () => Promise<void>;
  readonly isSetup: boolean
  start: () => void;
  stop: () => void;
}
