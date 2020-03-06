import { IRecording } from '../models/IRecording';
const { desktopCapturer, remote } = require('electron');
const { writeFile } = require('fs');
const { Menu, dialog } = remote;

export class RecordingService implements IRecording {
  private readonly recordedChunks: BlobPart[];
  private readonly video: HTMLVideoElement;
  private stream: MediaStream;
  private mediaRecorder: MediaRecorder;
  private source: Electron.DesktopCapturerSource;
  private readonly selectButton: HTMLElement;
  private readonly videoType: string;

  constructor(
    videoDisplay: HTMLVideoElement,
    videoButton: HTMLElement,
    videoType: string,
  ) {
    this.video = videoDisplay;
    this.selectButton = videoButton;
    this.videoType = videoType;
    this.recordedChunks = [];
  }

  get isSetup(): boolean {
    return Boolean(this.mediaRecorder);
  }

  public async setup() {
    const inputSources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
    });

    const videoOptions = Menu.buildFromTemplate(
      inputSources.map((source: Electron.DesktopCapturerSource) => ({
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

  private selectSource(source: Electron.DesktopCapturerSource) {
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
    await this.video.play();
  }

  private setupMediaRecorder() {
    const options: MediaRecorderOptions = {
      mimeType: this.videoType,
    };

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.ondataavailable = ({ data }) =>
      this.onStartRecording(data, this.recordedChunks);
    this.mediaRecorder.onstop = () => this.onEndRecording(this.recordedChunks);
  }

  private onStartRecording(data: Blob, chunks: BlobPart[]) {
    chunks.push(data);
  }

  public start() {
    this.mediaRecorder.start();
  }

  public stop() {
    this.mediaRecorder.stop();
  }

  public showNotSetupError() {
    dialog.showMessageBox(null, {
      title: 'Select a screen',
      message: 'Please select a screen to record before clicking start',
    });
  }

  private async onEndRecording(chunks: BlobPart[]) {
    const blob = new Blob(chunks, {
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
