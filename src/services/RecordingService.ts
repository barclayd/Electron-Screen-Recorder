import { IRecording } from '../models/IRecording';
import { desktopCapturer, remote } from 'electron';
import { writeFile } from 'fs';
const { Menu, dialog } = remote;
import DesktopCapturerSource = Electron.DesktopCapturerSource;

export class RecordingService implements IRecording {
  private recordedChunks: BlobPart[] = [];
  private video: HTMLVideoElement;
  private stream: MediaStream;
  private mediaRecorder: MediaRecorder;
  private source: DesktopCapturerSource;
  private selectButton: HTMLElement;
  private readonly videoType: string;

  constructor(
    videoDisplay: HTMLVideoElement,
    videoButton: HTMLElement,
    videoType: string,
  ) {
    this.video = videoDisplay;
    this.selectButton = videoButton;
    this.videoType = videoType;
  }

  get isSetup(): boolean {
    return Boolean(this.mediaRecorder);
  }

  public async setup() {
    const inputSources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
    });

    const videoOptions = Menu.buildFromTemplate(
      inputSources.map((source: DesktopCapturerSource) => ({
        label: source.name,
        click: async () => {
          this.selectSource(source);
          await this.setupStream();
          await this.playStream();
          this.setupMediaRecorder();
        },
      })),
    );
    videoOptions.popup();
  }

  private selectSource(source: DesktopCapturerSource) {
    this.selectButton.innerText = source.name;
    this.source = source;
  }

  private async setupStream() {
    const constraints: any = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: this.source.id,
        },
      },
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
  }

  private async playStream() {
    this.video.srcObject = await this.stream;
    this.video.play();
  }

  private setupMediaRecorder() {
    const options: MediaRecorderOptions = {
      mimeType: this.videoType,
    };

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.ondataavailable = this.onStartRecording;
    this.mediaRecorder.onstop = this.onEndRecording;
  }

  private onStartRecording({ data }: { data: Blob }) {
    this.recordedChunks.push(data);
  }

  public start() {
    this.mediaRecorder.start();
  }

  public stop() {
    this.mediaRecorder.stop();
  }

  private async onEndRecording() {
    const blob = new Blob(this.recordedChunks, {
      type: this.videoType,
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: 'Save video',
      defaultPath: `recording-${Date.now()}.webm`,
    });

    if (filePath) {
      writeFile(filePath, buffer, () => {
        console.log('video successfully saved');
      });
    }
  }
}
