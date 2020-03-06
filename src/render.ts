const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

const video = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectButton = document.getElementById('videoSelectBtn');

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

  // has to be defined separately before being passed as a reference to video.srcObject
  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  video.srcObject = stream;
  video.play();
};

videoSelectButton.onclick = getVideoSources;
