import Papa from 'papaparse';

export function convertJSONtoCSV(jsonData) {
  return Papa.unparse(jsonData, { delimiter: ',', linebreak: "\n" });
}

export function convertCVStoJSON(csvData) {
  return Papa.parse(csvData, {header: true, skipEmptyLines: true});
}

export function getMilitaryTime(dateStr) {
  if (!dateStr) return null;

  const localDate = new Date(dateStr);
  return `${localDate.getHours().toString().padStart(2, '0')}:${localDate.getMinutes().toString().padStart(2, '0')}`;
}
