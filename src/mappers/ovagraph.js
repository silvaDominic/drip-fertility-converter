import { fahrenheitToCelsius } from "../utils.js";
import { DRIP_PROPS } from "../constants.js";

const OVA_PROPS = {
  DATE: 'd',
  TEMP_TIME: 'bt',
  TEMP_VAL: 'bf',
  BLEEDING_VAL: 'me',
  C_MUCUS: 'cm',
  C_POS: 'cp',
  C_FIRMNESS: 'cf',
  C_OPENING: 'co',
  VAG_SEN: 'vs',
  INTERCOURSE: 'it',
  NOTE: 'sp',
  EXCLUDE: 'bx',
  OVU_PAIN: 'op',
}

const C_FIRMNESS_MAP = {
  'firm': 0,
  'medium': null,
  'soft': 1,
}

const C_POS_MAP = {
  'low': 0,
  'mid': 1,
  'high': 2,
}

const C_OPENING_MAP = {
  'closed': 0,
  'partial': 1,
  'open': 2,
}

const VAG_SENS_MAP = {
  'dry': 0,
  'sticky': null,
  'wet': 2,
  'slippery': 3,
}

const C_MUCUS_TEXTURE_MAP = {
  'dry': null,
  'sticky': null,
  'creamy': 1,
  'watery': null,
  'egg_white': 2,
}

export function mapOvagraph(jsonData) {
  return jsonData.data.map(entry => {
    // If no date prop OR invalid date
    if (!entry?.[OVA_PROPS.DATE]?.trim()) return null;

    let notes = "";

    const dripEntry = {
      [DRIP_PROPS.DATE]: new Date(entry[OVA_PROPS.DATE]).toISOString().split('T')[0],
      [DRIP_PROPS.TEMP_TIME]: entry[OVA_PROPS.TEMP_TIME] ?? null,
      [DRIP_PROPS.TEMP_VAL]: getTemperature(entry[OVA_PROPS.TEMP_VAL]) ?? null,
      [DRIP_PROPS.BLEEDING_VAL]: entry[OVA_PROPS.BLEEDING_VAL] ?? null,
      [DRIP_PROPS.BLEEDING_EXCLUDE]: entry[OVA_PROPS.BLEEDING_VAL] != null ? false : null, // Bleeding value/exclude must always be together AND valid,
      [DRIP_PROPS.C_MUCUS_TEXTURE]: C_MUCUS_TEXTURE_MAP[entry[OVA_PROPS.C_MUCUS]] ?? null,
      [DRIP_PROPS.C_OPENING]: C_OPENING_MAP[entry[OVA_PROPS.C_OPENING]] ?? null,
      [DRIP_PROPS.C_FIRMNESS]: C_FIRMNESS_MAP[entry[OVA_PROPS.C_FIRMNESS]] ?? null,
      [DRIP_PROPS.VAG_FEELING]: VAG_SENS_MAP[entry[OVA_PROPS.VAG_SEN]] ?? null,
      [DRIP_PROPS.C_POS]: C_POS_MAP[entry[OVA_PROPS.C_POS]] ?? null,
      [DRIP_PROPS.SEX_PARTNER]: entry[OVA_PROPS.INTERCOURSE] ?? null,
      [DRIP_PROPS.PAIN_OVU]: entry[OVA_PROPS.OVU_PAIN] ?? null,
      [DRIP_PROPS.TEMP_EXCLUDE]: !!Number(entry[OVA_PROPS.EXCLUDE]) ?? false, // value is 0 or 1
      [DRIP_PROPS.NOTE]: entry[OVA_PROPS.NOTE] ?? "",
    }

    if (entry[OVA_PROPS.VAG_SEN] === 'sticky') {
      notes += `Vaginal Sensation: ${entry[OVA_PROPS.VAG_SEN]}\n`;
    }

    if (entry[OVA_PROPS.C_MUCUS] === 'sticky' || entry[OVA_PROPS.C_MUCUS] === 'watery') {
      notes += `Cervical Mucus: ${entry[OVA_PROPS.C_MUCUS]}\n`;
    }

    dripEntry[DRIP_PROPS.NOTE] += notes;

    return dripEntry;
  }).filter(entry => entry !== null); // Exclude any null (dateless) entries
}

export function getTemperature(val) {
  if (typeof val !== 'string' && typeof val !== 'number') return null;

  const tempVal = Number(val);
  if (tempVal > 40) {
    return fahrenheitToCelsius(tempVal);
  }
  return tempVal;
}
