const UNSUPPORTED = 'unsupported';
const CONTRACEPTIVES_MAP = {
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


const BLEEDING_MAP = {
  'spotting': 0,
  'bleeding_light': 1,
  'bleeding': 2,
  'bleeding_heavy': 3,
}

const CERVIX_FIRMNESS_MAP = {
  'firm': 0,
  'medium': null,
  'soft': 1,
}

const CERVIX_POSITION_MAP = {
  'low': 0,
  'medium': 1,
  'high': 2,
}

const CERVIX_OPENING_MAP = {
  'closed': 0,
  'medium': 1,
  'open': 2,
}

const VAGINAL_SENSATION_MAP = {
  'low': 0,
  'medium': 2,
  'high': 3,
}

// peak,non_peak,spotting,bleeding_light,dry
const CERVIX_MUCUS_MAP = {
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
      ['date']: new Date(entry['date']).toISOString().split('T')[0],
      ['temperature.value']: entry['tempOneValue'] || null,
      ['temperature.exclude']: false,
      ['bleeding.value']: getBleedingValue(entry['fluid']) ?? null,
      ['bleeding.exclude']: getBleedingValue(entry['fluid']) != null ? false : null, // Bleeding value/exclude must always be together AND valid
      ['mucus.feeling']: VAGINAL_SENSATION_MAP[entry['sensation']] ?? 1, // Default to 1 (nothing)
      ['mucus.texture']: getCervicalFluidValue(entry['fluid']) ?? null,
      ['mucus.value']: null, // Computed value
      ['mucus.exclude']: false,
      ['cervix.opening']: CERVIX_OPENING_MAP[entry['cervixOpenness']] ?? null,
      ['cervix.firmness']: CERVIX_FIRMNESS_MAP[entry['cervixFirmness']] ?? null,
      ['cervix.position']: CERVIX_POSITION_MAP[entry['cervixHeight']] ?? null,
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
    .filter((value => Object.keys(BLEEDING_MAP).includes(value)));
  // Sort bleeding items based on the defined priority
  const sortedItems = values.sort((a, b) => (BLEEDING_MAP[b] - BLEEDING_MAP[a]));
  // Return the highest-priority item (first in the sorted list)
  return BLEEDING_MAP[sortedItems[0]];  // Return null if no items found
}

export function getCervicalFluidValue(valuesStr) {
  if (!valuesStr || valuesStr.trim() === "") return null;

  const fluidTypes = valuesStr
    .split(',')
    .map(type => type.trim())
    .filter((type => Object.keys(CERVIX_MUCUS_MAP).includes(type)));
  // Sort mucus items based on the defined priority
  const sortedItems = fluidTypes.sort((a, b) => (CERVIX_MUCUS_MAP[b] - CERVIX_MUCUS_MAP[a]));
  // Return the highest-priority item (first in the sorted list)
  return CERVIX_MUCUS_MAP[sortedItems[0]]; // Return null if no items found
}

export function getSexType(valuesStr) {
  if (!valuesStr || valuesStr.trim() === "") return null;

  const contraceptiveType = valuesStr
    .split(',')
    .map(token => token.trim());

  // If solo is found at all, assume 'solo' sex.
  if (contraceptiveType.includes(CONTRACEPTIVES_MAP["solo"])) return "solo";
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
    if (CONTRACEPTIVES_MAP[type] === UNSUPPORTED) {
      return { name: type, asNote: true }
    } else {
      return { name: CONTRACEPTIVES_MAP[type], asNote: false }
    }
  });
}
