import { mapRYB } from "./mappers/ryb.js";
import { convertCVStoJSON, convertJSONtoCSV } from "./utils.js";
import { mapPremom } from "./mappers/premom.js";

const APP_TYPE = {
  RYB: "RYB",
  PREMOM: "PREMOM",
}

// DEV_NOTE: ADD EXPORT DATA LINK HERE
const HELP_LINK_MAP = {
  [APP_TYPE.RYB]: 'https://readyourbody.zendesk.com/hc/en-gb/articles/360015907180-Manual-backup-RYB-JSON-CSV-ZIP',
  [APP_TYPE.PREMOM]: 'https://support.premom.com/hc/en-us/articles/4416350070035-Q6-How-do-I-export-BBT-and-share-via-Email',
}

let selectedApp = null;

document.addEventListener('DOMContentLoaded', () => {
  const convertBtn = document.getElementById('convert-button');
  const fileInput = document.getElementById('file-input');
  const fileUploadContainerEl = document.getElementById('file-upload-container');
  const appTypeSelectEl = document.getElementById('app-type-select');
  const selectedAppEl = document.getElementsByClassName('selected-app-text');
  const howToLinkEl = document.getElementById('how-to-link');
  const howToDisclaimerEl = document.getElementById('how-to-disclaimer');

  // 'CONVERT' BUTTON
  convertBtn.addEventListener('click', () => {
    onConvertData(appTypeSelectEl.selectedOptions[0].value);
  });
  // FILE INPUT
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      convertBtn.style.display = 'block';
    } else {
      convertBtn.style.display = 'none';
    }
  });

  // DYNAMIC CHANGES AROUND SELECTED APP TYPE
  // Set defaults
  const currentlySelectedOption = appTypeSelectEl.selectedOptions[0]
  selectedAppEl[0].innerText = currentlySelectedOption.text;
  onSelectChange(currentlySelectedOption);

  // Dynamically change text/link when <select> is changed
  appTypeSelectEl.addEventListener('change', (e) => {
    const el = e.target;
    selectedAppEl[0].innerText = el.selectedOptions[0].text;
    selectedAppEl[1].innerText = el.selectedOptions[0].text;

    onSelectChange(el);
    selectedApp = el.value;
  });

  /**
   * Handles toggling help link text and whether the file input is visible/enabled.
   * @param option The <option> element
   */
  function onSelectChange(option) {
    if (APP_TYPE[option.value]) {
      enableFileInput();
      // If there is NO matching app (or DEFAULT), disable input
    } else {
      disableFileInput();
    }

    // If there is an export help link, show it
    if (HELP_LINK_MAP[option.value]) {
      enableHelpLink();
      howToLinkEl.href = HELP_LINK_MAP[option.value];
    // If the default option is select, hide the whole block
    } else if (option.value === 'DEFAULT') {
      disableHelpBlock();
    // Otherwise disable the link
    } else {
      disableHelpLink();
    }
  }

  // HELPERS
  function enableHelpLink() {
    howToDisclaimerEl.style.display = 'none';
    howToLinkEl.style.display = 'block';
  }

  function disableHelpLink() {
    howToDisclaimerEl.style.display = 'block';
    howToLinkEl.style.display = 'none';
    howToLinkEl.href = '#';
    selectedAppEl[1].innerText = appTypeSelectEl.selectedOptions[0].text;
  }

  function disableHelpBlock() {
    howToDisclaimerEl.style.display = 'none';
    howToLinkEl.style.display = 'none';
  }

  function disableFileInput() {
    fileInput.disabled = true;
    fileUploadContainerEl.style.opacity = '0.5';
  }

  function enableFileInput() {
    fileInput.disabled = false;
    fileUploadContainerEl.style.opacity = '1';
  }

});

// DEV_NOTE: ADD ASSOCIATED MAPPING FUNCTIONS HERE
function mapToDripFormat(appType, jsonData) {
  switch(appType) {
    case APP_TYPE.RYB:
      return mapRYB(jsonData);
    case APP_TYPE.PREMOM:
      return mapPremom(jsonData);
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
  downloadLink.download = `${selectedApp}-to-drip.csv`;
  downloadLink.style.display = 'inline';
}
