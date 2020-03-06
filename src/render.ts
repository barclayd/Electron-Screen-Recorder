import { desktopCapturer } from 'electron';

const video = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectButton = document.getElementById('videoSelectBtn');

const getVideoSources = async () => {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
  });
};

videoSelectButton.onclick = getVideoSources;
