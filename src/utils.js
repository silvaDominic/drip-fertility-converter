import Papa from 'papaparse';

export function convertJSONtoCSV(jsonData) {
  return Papa.unparse(jsonData, { delimiter: ',', linebreak: "\n" });
}

export function convertCVStoJSON(csvData) {
  return Papa.parse(csvData, {header: true, skipEmptyLines: true});
}
