import { mapRYB } from "./RYB/ryb.js";
import { convertCVStoJSON, convertJSONtoCSV } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
  // Convert Data button
  const convertBtn = document.getElementById('convert-button');
  convertBtn.addEventListener('click', () => {
    onConvertData();
  });

  // File input
  const fileInput = document.getElementById('file-input');
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      convertBtn.style.display = 'block';
    } else {
      convertBtn.style.display = 'none';
    }
  });
});

const APP_TYPE = {
  RYB: "RYB",
}

function mapToDripFormat(appType, jsonData) {
  switch(appType) {
    case 'RYB':
      return mapRYB(jsonData);
  }
}

function onConvertData() {
  console.log("Converting data...");

  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select file first.');
    return;
  }

  const fileExtension = file.name.split('.').pop().toLowerCase();

  const reader = new FileReader();
  reader.onload = function(e) {
    const fileContent = e.target.result;
    let csvData = null;

    switch (fileExtension) {
      case 'json':
        try {
          const parsedJSON = JSON.parse(fileContent);
          csvData = convertJSONtoCSV(parsedJSON);
        } catch(err) {
          alert('Error parsing JSON data.');
          console.error(err);
        }
      break;
      case 'csv':
        try {
          const parsedJSON = convertCVStoJSON(fileContent);
          const mappedData = mapToDripFormat(APP_TYPE.RYB, parsedJSON);
          csvData = convertJSONtoCSV(mappedData);
        } catch(err) {
          alert('Error parsing CSV data.');
          console.error(err);
        }
        break;
    }

    prepareDownload(csvData);
  };

  reader.readAsText(file);
}

function prepareDownload(csvData) {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById('download-link');
  downloadLink.href = url;
  downloadLink.download = `import-to-drip.csv`;
  downloadLink.style.display = 'inline';
}
