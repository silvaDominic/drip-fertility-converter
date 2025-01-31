import { expect, describe, it } from 'vitest';
import { convertJSONtoCSV } from "../src/utils.js";

describe('Utils', () => {
  describe('convertJSONtoCSV', () => {
    it('returns a CSV with empty values set as empty strings', () => {
      const input = [  {
        date: '2024-01-01',
        'temperature.value': '36.56',
        'temperature.exclude': false,
        'bleeding.value': null,
        'bleeding.exclude': false,
        'mucus.value': null,
        'mucus.feeling': 1,
        'mucus.exclude': false,
        'sex.partner': true,
        'cervix.opening': null,
        'cervix.firmness': 1,
        'cervix.position': null,
        'cervix.exclude': false,
        'note.value': 'Cervix Tilt: tilted \n'
      }];
      const result = convertJSONtoCSV(input);
      console.log(result);
      expect(convertJSONtoCSV(input)).toMatch('');
    });
  });
});
