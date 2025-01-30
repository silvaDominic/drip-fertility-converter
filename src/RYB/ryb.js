const CONTRACEPTIVES_MAP = {
  "solo": "solo",
  "unprotected": "other",
  "condom": "condom",
  "iud": "iud",
  "non_piv": "other",
  "sterilisation": "other",
  "cervicalCap": "other",
  "insemination": "other",
  "withdrawal": "other",
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
  'low': 1,
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
    let notes = "";
    const dripEntry = {
      ['date']: new Date(entry['date']).toISOString().split('T')[0],
      ['temperature.value']: entry['tempOneValue'] || "",
      ['temperature.exclude']: false,
      ['bleeding.value']: getBleedingValue(entry['fluid']),
      ['bleeding.exclude']: !!getBleedingValue(entry['fluid']) ? false : null,
      ['mucus.value']: getCervicalFluidVal(entry['fluid']),
      ['mucus.feeling']: VAGINAL_SENSATION_MAP[entry['sensation']] || 0, // Default to 0 (nothing)
      ['mucus.exclude']: false,
      ['cervix.opening']: CERVIX_OPENING_MAP[entry['cervixOpenness']] || null,
      ['cervix.firmness']: CERVIX_FIRMNESS_MAP[entry['cervixFirmness']] ?? null,
      ['cervix.position']: CERVIX_POSITION_MAP[entry['cervixHeight']] || null,
      ['cervix.exclude']: false,
    }

    // Set sex type (solo/partner)
    const sexType = getSexType(entry["intercourse"]);
    if (sexType) {
      dripEntry[`sex.${ sexType }`] = true;
    }

    // Set various contraceptive types
    const contraceptiveTypes = getContraceptiveTypes(entry["intercourse"]);
    contraceptiveTypes.forEach(item => {
      if (item.asNote) {
        notes += `Sex: ${ item.name } \n`; // Add unsupported types as notes
      } else if (item.name) {
        dripEntry[`sex.${ item.name }`] = true;
      }
    });

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
  });
}

export function getBleedingValue(values) {
  const tokens = values.split(',').map(token => token.trim()).filter((token => Object.keys(BLEEDING_MAP).includes(token)));
  // Sort bleeding items based on the defined priority
  const sortedItems = tokens.sort((a, b) => (BLEEDING_MAP[b] - BLEEDING_MAP[a]));
  // Return the highest-priority item (first in the sorted list)
  return BLEEDING_MAP[sortedItems[0]] || null;  // Return null if no items found
}

export function getCervicalFluidVal(values) {
  const tokens = values
    .split(',')
    .map(token => token.trim())
    .filter((token => Object.keys(CERVIX_MUCUS_MAP).includes(token)));
  // Sort mucus items based on the defined priority
  const sortedItems = tokens.sort((a, b) => (CERVIX_MUCUS_MAP[b] - CERVIX_MUCUS_MAP[a]));
  // Return the highest-priority item (first in the sorted list)
  return CERVIX_MUCUS_MAP[sortedItems[0]] || null; // Return null if no items found
}

export function getSexType(values) {
  if (values.trim() === "") return null;

  const types = values
    .split(',')
    .map(token => token.trim());

  // If solo is found at all, assume 'solo' sex.
  if (types.includes(CONTRACEPTIVES_MAP["solo"])) return "solo";
  // RYB doesn't have a 'partner' term and so any sex method that isn't 'solo' is assumed as such.
  for (const type of types) {
    if (types.includes(type)) return "partner";
  }
}

export function getContraceptiveTypes(values) {
  // Remove 'solo' type
  const validTypes = values.split(',')
    .map(token => token.trim())
    .filter(token => token !== 'solo');

  // Marks unsupported types to be a note and uses RYB name, otherwise, maps to associated Drip name
  return validTypes.map((type) => {
    if (CONTRACEPTIVES_MAP[type] === 'other') {
      return { name: type, asNote: true }
    } else {
      return { name: CONTRACEPTIVES_MAP[type], asNote: false }
    }
  });
}
