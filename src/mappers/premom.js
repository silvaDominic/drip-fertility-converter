import { DRIP_PROPS } from "../constants.js";

export function mapPremom(jsonData) {
  return jsonData.data.map(entry => {
    // If no date prop OR invalid date
    if (!entry?.['Date']?.trim()) return null;

    const [time, timeIndicator] = getTimeAndIndicator(entry['Time(BBT)']) || [null, null];
    return {
      [DRIP_PROPS.DATE]: new Date(entry['Date']).toISOString(),
      [DRIP_PROPS.TEMP_TIME]: convertToMilitaryTime(time, timeIndicator) || null,
      [DRIP_PROPS.TEMP_VAL]: formatTemperature(entry['Temperature']) || null,
      [DRIP_PROPS.TEMP_EXCLUDE]: false,
    }
  }).filter(entry => entry !== null); // Exclude any null (dateless) entries
}

/**
 * @param temp {string}
 * @returns {*|null}
 */
export function formatTemperature(temp) {
  if (!temp) return null;

  const regex = /[^0-9.]/g; // Exclude any characters not a number or a period
  return temp.replace(regex, '');
}

/**
 * @param timeStr {string} Format of hh:mm
 * @param timeIndicator {string} 'AM' or 'PM'
 * @returns {string|*|string|null}
 */
export function convertToMilitaryTime(timeStr, timeIndicator) {
  if (!timeStr || timeStr?.trim() === "") return null;

  switch(timeIndicator) {
    case 'PM':
      // Handle noon
      if (timeStr === '12:00') return '12:00';
      // Otherwise, add 12 hours to time
      return (Number(timeStr.slice(0,2)) + 12) + timeStr.slice(2, 5);
    case 'AM':
      // Handle midnight, otherwise no adjustments
      return timeStr === '12:00' ? '00:00' : timeStr;
    default:
      return null;
  }
}

/**
 * @param timeStr {string}
 * @returns {*|null}
 */
export function getTimeAndIndicator(timeStr) {
  if (!timeStr || timeStr?.trim() === "") return null;

  return timeStr.trim().split(' ');
}
