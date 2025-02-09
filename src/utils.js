import Papa from 'papaparse';

export function convertJSONtoCSV(jsonData) {
  return Papa.unparse(jsonData, { delimiter: ',' });
}

export function convertCVStoJSON(csvData) {
  return Papa.parse(csvData, {header: true, delimiter: ',', skipEmptyLines: true});
}

export function fahrenheitToCelsius(temp) {
  let celsius = (temp - 32) * (5 / 9);
  return parseFloat(celsius.toFixed(2)); // Round to 2 decimal points
}
