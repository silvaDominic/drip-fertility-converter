(() => {
  const fileInput = document.getElementById('file-input');
  const convertBtn = document.getElementById('convert-button');

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      convertBtn.style.display = 'block';
    } else {
      convertBtn.style.display = 'none';
    }
  });
})();

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
          const parsedCSV = parseCSV(fileContent);
          csvData = convertCSVtoCSV(parsedCSV);
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

function convertJSONtoCSV(jsonData) {
  return Papa.unparse(jsonData);
}

function parseCSV(csvData) {
  console.log("parseCSV");
}

function convertCSVtoCSV(parsedCSV) {
  console.log("convertCSVtoCSV");
}

function prepareDownload(csvData) {
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.getElementById('download-link');
  downloadLink.href = url;
  downloadLink.download = 'drip-data.csv';
  downloadLink.style.display = 'inline';
}
