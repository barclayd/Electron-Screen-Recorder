const { RecordingService } = require('../dist/services/RecordingService');
const { remote } = require('electron');
const { dialog } = remote;

const video = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectButton = document.getElementById('videoSelectBtn');

const recordingService = new RecordingService(
  video,
  videoSelectButton,
  'video/webm; codecs=vp9',
);

videoSelectButton.onclick = () => recordingService.setup();

startBtn.onclick = () => {
  if (recordingService.isSetup) {
    recordingService.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
  } else {
    dialog.showMessageBox(null, {
      title: 'Select a screen',
      message: 'Please select a screen to record before clicking start',
    });
  }
};

stopBtn.onclick = () => {
  recordingService.stop();
  startBtn.classList.remove('is-danger');
  startBtn.innerText = 'Start';
};
