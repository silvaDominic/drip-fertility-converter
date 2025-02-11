import { mapRYB } from "./mappers/ryb.js";
import { convertCVStoJSON, convertJSONtoCSV, parseJSON } from "./utils.js";
import { mapPremom } from "./mappers/premom.js";
import { mapOvagraph } from "./mappers/ovagraph.js";
import Alpine from 'alpinejs';

// DEV_NOTE: ADD APP TYPE HERE
const APP_NAME = {
  RYB: "RYB",
  PREMOM: "PREMOM",
  OVA_GRAPH: "OVA_GRAPH",
}

// DEV_NOTE: ADD EXPORT DATA LINK HERE
const HELP_LINK_MAP = {
  [APP_NAME.RYB]: 'https://readyourbody.zendesk.com/hc/en-gb/articles/360015907180-Manual-backup-RYB-JSON-CSV-ZIP',
  [APP_NAME.PREMOM]: 'https://support.premom.com/hc/en-us/articles/4416350070035-Q6-How-do-I-export-BBT-and-share-via-Email',
  [APP_NAME.OVA_GRAPH]: 'https://www.ovagraph.com/faq/can-i-export-my-data-ovagraphcom',
}

Alpine.data('main', () => ({
  selectedApp: "DEFAULT",
  selectedAppLabel: "",
  fileInput: null,
  get helpLink() { return HELP_LINK_MAP[this.selectedApp] },
  get disableFileInput() { return this.selectedApp === 'DEFAULT' },
  get showHelpBlock() { return this.selectedApp !== 'DEFAULT' },
  get showHelpLink() { return !!APP_NAME[this.selectedApp] && HELP_LINK_MAP[this.selectedApp] },
  get showConvertButton() { return this.fileInput?.files?.length > 0 },
  onFileInputChange(event) {
    const fileInputElem = event.target;
    if (fileInputElem.files && fileInputElem.files[0]) {
      this.fileInput = fileInputElem;
    } else {
      this.fileInput = null;
    }
  },
  onSelectChange(e) { this.selectedAppLabel = e.target.selectedOptions[0].innerText; },
  onConvert() { onConvertData(this.selectedApp) },
}));

Alpine.start();

// DEV_NOTE: ADD ASSOCIATED MAPPING FUNCTIONS HERE
function mapToDripFormat(appType, jsonData) {
  switch(appType) {
    case APP_NAME.RYB:
      return mapRYB(jsonData);
    case APP_NAME.PREMOM:
      return mapPremom(jsonData);
    case APP_NAME.OVA_GRAPH:
      return mapOvagraph(jsonData);
  }
}

function onConvertData(appName) {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a file first.');
    return;
  }

  const fileExtension = file.name.split('.').pop().toLowerCase();

  const reader = new FileReader();
  reader.onload = function(e) {
    const fileContent = e.target.result;
    let mappedData = null;
    let parsedJSON = null;
    let csvData;

    switch (fileExtension) {
      case 'json':
        parsedJSON = parseJSON(fileContent);
        break;
      case 'csv':
        parsedJSON = convertCVStoJSON(fileContent);
        break;
    }

    try {
      mappedData = mapToDripFormat(appName, parsedJSON);
    } catch(err) {
      alert(`Error mapping ${appName}`);
      console.error(err);
    }

    csvData = convertJSONtoCSV(mappedData);
    prepareDownload(csvData, appName);
  };
  reader.readAsText(file);
}

function prepareDownload(csvData, appName) {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById('download-link');
  downloadLink.href = url;
  downloadLink.download = `${appName}-to-drip.csv`;
  downloadLink.style.display = 'inline';
}
