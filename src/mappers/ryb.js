/*
Mapper for Read Your Body app
https://readyourbody.com/
*/

const UNSUPPORTED = 'unsupported';
const CONTRA_MAP = {
  "solo": "solo",
  "unprotected": "none",
  "condom": "condom",
  "iud": "iud",
  "non_piv": UNSUPPORTED,
  "sterilisation": UNSUPPORTED,
  "cervicalCap": UNSUPPORTED,
  "insemination": UNSUPPORTED,
  "withdrawal": UNSUPPORTED,
  "diaphragm": "diaphragm",
  "other": "other",
}


const BLEEDING_VAL_MAP = {
  'spotting': 0,
  'bleeding_light': 1,
  'bleeding': 2,
  'bleeding_heavy': 3,
}

const C_FIRMNESS_MAP = {
  'firm': 0,
  'medium': null,
  'soft': 1,
}

const C_POS_MAP = {
  'low': 0,
  'medium': 1,
  'high': 2,
}

const C_OPENING_MAP = {
  'closed': 0,
  'medium': 1,
  'open': 2,
}

const VAG_SENS_MAP = {
  'low': 0,
  'medium': 2,
  'high': 3,
}

// peak,non_peak,spotting,bleeding_light,dry
const C_MUCUS_MAP = {
  'dry': 0,
  'non_peak': 1,
  'peak': 2,
}

export function mapRYB(jsonData) {
  return jsonData.data.map(entry => {
    // If no date prop OR invalid date
    if (!entry?.date?.trim()) return null;

    let notes = "";

    const dripEntry = {
      ['date']: new Date(entry['date']).toISOString().split('T')[0], // RYB doesn't localize date so just split the YYYY, MM, DD.
      ['temperature.time']: getMilitaryTime(entry['tempOne']) || null,
      ['temperature.value']: entry['tempOneValue'] || null,
      ['temperature.exclude']: false,
      ['bleeding.value']: getBleedingValue(entry['fluid']) ?? null,
      ['bleeding.exclude']: getBleedingValue(entry['fluid']) != null ? false : null, // Bleeding value/exclude must always be together AND valid
      ['mucus.feeling']: VAG_SENS_MAP[entry['sensation']] ?? 1, // Default to 1 (nothing)
      ['mucus.texture']: getCervicalFluidValue(entry['fluid']) ?? null,
      ['mucus.value']: null, // Computed value
      ['mucus.exclude']: false,
      ['cervix.opening']: C_OPENING_MAP[entry['cervixOpenness']] ?? null,
      ['cervix.firmness']: C_FIRMNESS_MAP[entry['cervixFirmness']] ?? null,
      ['cervix.position']: C_POS_MAP[entry['cervixHeight']] ?? null,
      ['cervix.exclude']: false,
      ['sex.solo']: null,
      ['sex.partner']: null,
      ['sex.condom']: null,
      ['sex.pill']: null,
      ['sex.iud']: null,
      ['sex.patch']: null,
      ['sex.ring']: null,
      ['sex.implant']: null,
      ['sex.diaphragm']: null,
      ['sex.none']: null,
      ['sex.other']: null,
      ['sex.note']: null,
    }

    // Set sex type (solo/partner)
    const sexType = getSexType(entry["intercourse"]);
    if (sexType) {
      dripEntry[`sex.${ sexType }`] = true;
    }

    // Set various contraceptive types
    const contraceptiveTypes = getContraceptiveTypes(entry["intercourse"]);
    if (contraceptiveTypes) {
      contraceptiveTypes.forEach(item => {
        if (item.asNote) {
          dripEntry['sex.other'] = true;
          dripEntry['sex.note'] = `Sex: ${ item.name }`; // Add unsupported types as a note
        } else if (item.name) {
          dripEntry[`sex.${ item.name }`] = true;
        }
      });
    }

    // Add unsupported values as notes
    if (entry['cervixFirmness'] === 'medium') {
      notes += `Cervix Firmness: ${ entry['cervixFirmness'] }\n`;
    }
    if (entry['cervixTilt']) {
      notes += `Cervix Tilt: ${ entry['cervixTilt'] }\n`;
    }

    // Add any existing notes
    if (entry['notes']) {
      notes += `${ entry['note'] }`;
    }
    dripEntry['note.value'] = notes;

    return dripEntry;
  }).filter(entry => entry !== null); // Exclude any null (dateless) entries
}

export function getBleedingValue(valuesStr) {
  if (!valuesStr || valuesStr.trim() === "") return null;

  const values = valuesStr.split(',')
    .map(value => value.trim())
    .filter((value => Object.keys(BLEEDING_VAL_MAP).includes(value)));
  // Sort bleeding items based on the defined priority
  const sortedItems = values.sort((a, b) => (BLEEDING_VAL_MAP[b] - BLEEDING_VAL_MAP[a]));
  // Return the highest-priority item (first in the sorted list)
  return BLEEDING_VAL_MAP[sortedItems[0]];  // Return null if no items found
}

export function getCervicalFluidValue(valuesStr) {
  if (!valuesStr || valuesStr.trim() === "") return null;

  const fluidTypes = valuesStr
    .split(',')
    .map(type => type.trim())
    .filter((type => Object.keys(C_MUCUS_MAP).includes(type)));
  // Sort mucus items based on the defined priority
  const sortedItems = fluidTypes.sort((a, b) => (C_MUCUS_MAP[b] - C_MUCUS_MAP[a]));
  // Return the highest-priority item (first in the sorted list)
  return C_MUCUS_MAP[sortedItems[0]]; // Return null if no items found
}

export function getSexType(valuesStr) {
  if (!valuesStr || valuesStr.trim() === "") return null;

  const contraceptiveType = valuesStr
    .split(',')
    .map(token => token.trim());

  // If solo is found at all, assume 'solo' sex.
  if (contraceptiveType.includes(CONTRA_MAP["solo"])) return "solo";
  // RYB doesn't have a 'partner' term and so any sex method that isn't 'solo' is assumed as such.
  for (const type of contraceptiveType) {
    if (contraceptiveType.includes(type)) return "partner";
  }
}

export function getContraceptiveTypes(valuesStr) {
  if (!valuesStr || valuesStr.trim() === "") return null;

  // Remove 'solo' type
  const validTypes = valuesStr.split(',')
    .map(type => type.trim())
    .filter(type => type !== 'solo');

  // Marks unsupported types to be a note and uses RYB name, otherwise maps to associated Drip name
  return validTypes.map((type) => {
    if (CONTRA_MAP[type] === UNSUPPORTED) {
      return { name: type, asNote: true }
    } else {
      return { name: CONTRA_MAP[type], asNote: false }
    }
  });
}

export function getMilitaryTime(dateStr) {
  if (!dateStr) return null;

  const localDate = new Date(dateStr);
  return `${localDate.getHours().toString().padStart(2, '0')}:${localDate.getMinutes().toString().padStart(2, '0')}`;
}
