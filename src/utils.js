import Papa from 'papaparse';

export function convertJSONtoCSV(jsonData) {
  console.log("JSON: ", jsonData);
  const result = Papa.unparse(jsonData, { delimiter: ',', linebreak: "\n" });
  console.log("CSV: ", result);
  return result;
}

export function convertCVStoJSON(csvData) {
  return Papa.parse(csvData, {header: true, skipEmptyLines: true});
}
