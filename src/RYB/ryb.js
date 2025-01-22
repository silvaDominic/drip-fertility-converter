const SEX_FIELDS = {
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
  'soft': 0,
  'medium': null, // Note
  'firm': 2,
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
  console.log(jsonData);
  let mappedData = [];
  jsonData.data.forEach(entry => {
    const date = new Date(entry['date']).toISOString().split('T')[0];
    const bleedingVal = getBleedingValue(entry['fluid']);
    const temp = entry['tempOneValue'];
    const note = entry['note'];
    const cervixOpening =CERVIX_OPENING_MAP[entry['cervixOpenness']]
    const cervixFirmness = CERVIX_FIRMNESS_MAP[entry['cervixFirmness']] || null;
    const cervixPosition = CERVIX_POSITION_MAP[entry['cervixHeight']] || null;
    const cervixMucus = getCervicalFluidVal(entry['fluid']);
    const cervixFeeling = VAGINAL_SENSATION_MAP[entry['sensation']] || 0; // Default to 0 (nothing)
    const cervixTilt = "" // Note
    const intercourseType = getSexType(entry["intercourse"]);
    const contraceptiveTypes = getContraceptiveTypes(entry["intercourse"]);
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
  const tokens = values.split(',').map(token => token.trim()).filter((token => Object.keys(CERVIX_MUCUS_MAP).includes(token)));
  // Sort mucus items based on the defined priority
  const sortedItems = tokens.sort((a, b) => (CERVIX_MUCUS_MAP[b] - CERVIX_MUCUS_MAP[a]));
  // Return the highest-priority item (first in the sorted list)
  return sortedItems[0] || null;  // Return null if no items found
}

export function getSexType(values) {
  const tokens = values.split(',').map(token => token.trim());
    if (tokens.includes(SEX_FIELDS["solo"])) return "solo";
    for (const token of tokens) {
      if (tokens.includes(token)) return "partner";
    }
  return null;
}

// TODO Evolve this to return obejcts with notes for 'other' values
export function getContraceptiveTypes(values) {
  const tokens = values.split(',').map(token => token.trim()).filter(token => token !== 'solo');
  return tokens.map((token) => SEX_FIELDS[token]);
}
