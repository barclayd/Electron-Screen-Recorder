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

const selectSource = (source: Electron.DesktopCapturerSource) => {};

videoSelectButton.onclick = getVideoSources;
