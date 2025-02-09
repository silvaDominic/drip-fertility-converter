import { fahrenheitToCelsius } from "../utils.js";

const PROPS = {
  DATE: 'date',
  TEMP_TIME: 'temperature.time',
  TEMP_VAL: 'temperature.value',
  BLEEDING_VAL: 'bleeding.value',
  BLEEDING_EXCLUDE: 'bleeding.exclude',
  C_MUCUS_TEXTURE: 'mucus.texture',
  VAG_FEELING: 'mucus.feeling',
  C_MUCUS_EXCLUDE: 'mucus.exclude',
  C_OPENING: 'cervix.opening',
  C_FIRMNESS: 'cervix.firmness',
  C_POS: 'cervix.position',
  C_EXCLUDE: 'cervix.exclude',
  SEX_SOLO: 'sex.solo',
  SEX_PARTNER: 'sex.partner',
  CONTRA_CONDOM: 'sex.condom',
  CONTRA_PILL: 'sex.pill',
  CONTRA_IUD: 'sex.iud',
  CONTRA_PATCH: 'sex.patch',
  CONTRA_RING: 'sex.ring',
  CONTRA_IMPLANT: 'sex.implant',
  CONTRA_DIAPHRAGM: 'sex.diaphragm',
  CONTRA_NONE: 'sex.none',
  CONTRA_OTHER: 'sex.other',
  SEX_NOTE: 'sex.note',
  PAIN_OVU: 'pain.ovulationPain',
  EXCLUDE: 'temperature.exclude',
  NOTE: 'note',
}

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
      [PROPS.DATE]: new Date(entry[OVA_PROPS.DATE]).toISOString().split('T')[0],
      [PROPS.TEMP_TIME]: entry[OVA_PROPS.TEMP_TIME] ?? null,
      [PROPS.TEMP_VAL]: fahrenheitToCelsius(entry[OVA_PROPS.TEMP_VAL]) ?? null,
      [PROPS.BLEEDING_VAL]: entry[OVA_PROPS.BLEEDING_VAL] ?? null,
      [PROPS.C_MUCUS_TEXTURE]: C_MUCUS_TEXTURE_MAP[entry[OVA_PROPS.C_MUCUS]] ?? null,
      [PROPS.C_OPENING]: C_OPENING_MAP[entry[OVA_PROPS.C_OPENING]] ?? null,
      [PROPS.C_FIRMNESS]: C_FIRMNESS_MAP[entry[OVA_PROPS.C_FIRMNESS]] ?? null,
      [PROPS.VAG_FEELING]: VAG_SENS_MAP[entry[OVA_PROPS.VAG_SEN]] ?? null,
      [PROPS.C_POS]: C_POS_MAP[entry[OVA_PROPS.C_POS]] ?? null,
      [PROPS.SEX_PARTNER]: entry[OVA_PROPS.INTERCOURSE] ?? null,
      [PROPS.PAIN_OVU]: entry[OVA_PROPS.OVU_PAIN] ?? null,
      [PROPS.EXCLUDE]: !!Number(entry[OVA_PROPS.EXCLUDE]) ?? null, // value is 0 or 1
      [PROPS.NOTE]: entry[OVA_PROPS.NOTE],
    }

    if (entry[OVA_PROPS.VAG_SEN] === 'sticky') {
      notes += `Vaginal Sensation: ${entry[OVA_PROPS.VAG_SEN]}\n`;
    }

    if (entry[OVA_PROPS.C_MUCUS] === 'sticky' || entry[OVA_PROPS.C_MUCUS] === 'watery') {
      notes += `Cervical Mucus: ${entry[OVA_PROPS.C_MUCUS]}\n`;
    }

    dripEntry[PROPS.NOTE] += notes;
    return dripEntry;

  }).filter(entry => entry !== null); // Exclude any null (dateless) entries
}
