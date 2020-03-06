const { desktopCapturer, remote } = require('electron');
const { writeFile } = require('fs');
const { Menu, dialog } = remote;

const video = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectButton = document.getElementById('videoSelectBtn');

let mediaRecorder: MediaRecorder;
const recordedChunks: BlobPart[] = [];

const videoType = 'video/webm; codecs=vp9';

startBtn.onclick = (e) => {
  if (mediaRecorder) {
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
  } else {
    dialog.showMessageBox(null, {
      title: 'Select a screen',
      message: 'Please select a screen to record before clicking start',
    });
  }
};

stopBtn.onclick = (e) => {
  mediaRecorder.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};

const getVideoSources = async () => {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
  });

  const videoOptions = Menu.buildFromTemplate(
    inputSources.map((source) => ({
      label: source.name,
      click: () => selectSource(source),
    })),
  );
  videoOptions.popup();
};

const handleDataAvailable = (e: BlobEvent) => {
  recordedChunks.push(e.data);
};

const handleStop = async () => {
  const blob = new Blob(recordedChunks, {
    type: videoType,
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
};

const selectSource = async (source: Electron.DesktopCapturerSource) => {
  videoSelectButton.innerText = source.name;

  const constraints: any = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
      },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  // has to be defined separately before being passed as a reference to video.srcObject
  video.srcObject = stream;
  video.play();

  const options: MediaRecorderOptions = {
    mimeType: videoType,
  };

  mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
};

// event handlers
videoSelectButton.onclick = getVideoSources;
