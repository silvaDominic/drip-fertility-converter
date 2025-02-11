import { mapRYB } from "./mappers/ryb.js";
import { convertCVStoJSON, convertJSONtoCSV } from "./utils.js";
import { mapPremom } from "./mappers/premom.js";
import { mapOvagraph } from "./mappers/ovagraph.js";
import Alpine from 'alpinejs';

// DEV_NOTE: ADD APP TYPE HERE
const APP_TYPE = {
  RYB: "RYB",
  PREMOM: "PREMOM",
  OVA_GRAPH: "OVA_GRAPH",
}

// DEV_NOTE: ADD EXPORT DATA LINK HERE
const HELP_LINK_MAP = {
  [APP_TYPE.RYB]: 'https://readyourbody.zendesk.com/hc/en-gb/articles/360015907180-Manual-backup-RYB-JSON-CSV-ZIP',
  [APP_TYPE.PREMOM]: 'https://support.premom.com/hc/en-us/articles/4416350070035-Q6-How-do-I-export-BBT-and-share-via-Email',
  [APP_TYPE.OVA_GRAPH]: 'https://www.ovagraph.com/faq/can-i-export-my-data-ovagraphcom',
}

Alpine.data('main', () => ({
  selectedApp: "DEFAULT",
  selectedAppText: "",
  fileInput: null,
  get helpLink() { return HELP_LINK_MAP[this.selectedApp] },
  get disableFileInput() { return this.selectedApp === 'DEFAULT' },
  get showHelpBlock() { return this.selectedApp !== 'DEFAULT' },
  get showHelpLink() { return !!APP_TYPE[this.selectedApp] && HELP_LINK_MAP[this.selectedApp] },
  get showConvertButton() { return this.fileInput?.files?.length > 0 },
  onFileInputChange(event) {
    const fileInputElem = event.target;
    if (fileInputElem.files && fileInputElem.files[0]) {
      this.fileInput = fileInputElem;
    } else {
      this.fileInput = null;
    }
  },
  onSelectChange(e) { this.selectedAppText = e.target.selectedOptions[0].innerText; },
  onConvert() { onConvertData(this.selectedApp) },
}));

Alpine.start();

document.addEventListener('DOMContentLoaded', () => {

});

// DEV_NOTE: ADD ASSOCIATED MAPPING FUNCTIONS HERE
function mapToDripFormat(appType, jsonData) {
  switch(appType) {
    case APP_TYPE.RYB:
      return mapRYB(jsonData);
    case APP_TYPE.PREMOM:
      return mapPremom(jsonData);
    case APP_TYPE.OVA_GRAPH:
      return mapOvagraph(jsonData);
  }
}

function onConvertData(appType) {
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
          const mappedData = mapToDripFormat(appType, parsedJSON);
          console.log(mappedData)
          csvData = convertJSONtoCSV(mappedData);
        } catch(err) {
          alert('Error parsing CSV data.');
          console.error(err);
        }
        break;
    }

    prepareDownload(csvData, appType);
  };

  reader.readAsText(file);
}

function prepareDownload(csvData, appType) {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById('download-link');
  downloadLink.href = url;
  downloadLink.download = `${appType}-to-drip.csv`;
  downloadLink.style.display = 'inline';
}
