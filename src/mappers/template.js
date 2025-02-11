/*
  Feel free to use this as a template for your mapping function if you prefer to map it this way and add/remove whatever is necessary for your use case. There are certainly more clever ways to map data, but I found the more verbose way to be easier to comprehend.
 */

import { DRIP_PROPS } from "../constants.js";

export function mapAPP_TYPE(jsonData) {
  return jsonData.data.map(entry => {
    // If no date prop OR invalid date
    if (!entry?.date?.trim()) return null;

    let notes = "";

   const dripEntry = {
     [DRIP_PROPS.DATE]: ,
     [DRIP_PROPS.TEMP_TIME]: ,
     [DRIP_PROPS.TEMP_VAL]: ,
     [DRIP_PROPS.TEMP_EXCLUDE]: false, // False unless app supports exclude for this prop
     [DRIP_PROPS.BLEEDING_VAL]: ,
     [DRIP_PROPS.BLEEDING_EXCLUDE]: // Bleeding value/exclude must always be together AND valid
     [DRIP_PROPS.VAG_FEELING]: ,
     [DRIP_PROPS.C_MUCUS_TEXTURE]: ,
     [DRIP_PROPS.C_MUCUS_EXCLUDE]: false, // False unless app supports exclude for this prop
     [DRIP_PROPS.C_OPENING]: ,
     [DRIP_PROPS.C_FIRMNESS]: ,
     [DRIP_PROPS.C_POS]: ,
     [DRIP_PROPS.C_EXCLUDE]: false, // False unless app supports exclude for this prop
     [DRIP_PROPS.SEX_SOLO]: ,
     [DRIP_PROPS.SEX_PARTNER]: ,
     [DRIP_PROPS.CONTRA_CONDOM]: ,
     [DRIP_PROPS.CONTRA_PILL]: ,
     [DRIP_PROPS.CONTRA_IUD]: ,
     [DRIP_PROPS.CONTRA_PATCH]: ,
     [DRIP_PROPS.CONTRA_RING]: ,
     [DRIP_PROPS.CONTRA_IMPLANT]: ,
     [DRIP_PROPS.CONTRA_DIAPHRAGM]: ,
     [DRIP_PROPS.CONTRA_NONE]: ,
     [DRIP_PROPS.CONTRA_OTHER]: ,
     [DRIP_PROPS.SEX_NOTE]: ,
     // ...OTHER FIELDS
   }

   return dripEntry;
  }).filter(entry => entry !== null); // Exclude any null (dateless) entries
}
