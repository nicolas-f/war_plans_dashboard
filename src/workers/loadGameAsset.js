const AdmZip = require('adm-zip');

onmessage = (e) => {
  console.log('Worker: Message received from main script');

  const zipPath = e.data

  postMessage({});
};
