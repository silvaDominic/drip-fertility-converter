import Papa from 'papaparse';

export function convertJSONtoCSV(jsonData) {
  try {
    return Papa.unparse(jsonData, { delimiter: ',' });
  } catch(err) {
    alert('Error converting JSON data to CSV.');
    console.error(err);
  }
}

export function convertCVStoJSON(csvData) {
  try {
    return Papa.parse(csvData, {header: true, delimiter: ',', skipEmptyLines: true});
  } catch(err) {
    alert('Error converting CSV data to JSON.');
    console.error(err);
  }
}

export function parseJSON(jsonData) {
  try {
    return JSON.parse(jsonData);
  } catch (err) {
    alert('Error parsing JSON data.')
  }
}

export function fahrenheitToCelsius(temp) {
  if (typeof temp !== 'number' || isNaN(temp)) return null;

  let celsius = (temp - 32) * (5 / 9);
  return parseFloat(celsius.toFixed(2)); // Round to 2 decimal points
}
