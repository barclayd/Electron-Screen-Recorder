const { RecordingService } = require('../dist/services/RecordingService');

const video = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectButton = document.getElementById('videoSelectBtn');

const recordingService = new RecordingService(
  video,
  videoSelectButton,
  'video/webm; codecs=vp9',
);

// event handlers
videoSelectButton.onclick = () => recordingService.setup();

startBtn.onclick = () => {
  if (recordingService.isSetup) {
    recordingService.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
  } else {
    recordingService.showNotSetupError();
  }
};

stopBtn.onclick = () => {
  recordingService.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};
