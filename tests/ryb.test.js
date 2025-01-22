import { getBleedingValue, getCervicalFluidVal, getContraceptiveTypes, getSexType } from '../src/RYB/ryb.js';
import { expect, describe, it } from 'vitest';

describe("RYB", () => {
  describe("getBleedingValue", () => {
    describe("when multiple bleeding values are passed in", () => {
      it("ignores spotting values", () => {
        const input = "non_peak,bleeding_light,spotting";
        expect(getBleedingValue(input)).toBe(1);
      });
    });
  });

  describe("getCervicalFluidVal", () => {
    describe("when multiple mucus values are passed in", () => {
      it("prioritizes 'peak' values over others", () => {
        const input = "non_peak,bleeding_light,dry,peak,spotting";
        expect(getCervicalFluidVal(input)).toBe("peak");
      });
    });
  });

  describe("getSexType", () => {
    describe("when a non-solo value is selected", () => {
      it("returns 'partner'", () => {
        const input = "cervicalCap,withdrawal,iud,sterilisation";
        expect(getSexType(input)).toBe("partner");
      });
    });

    describe("when a solo value is selected", () => {
      it("returns 'solo'", () => {
        const input = "cervicalCap,withdrawal,solo,sterilisation";
        expect(getSexType(input)).toBe("solo");
      });
    });
  });

  describe("getContraceptiveTypes", () => {
    describe("when a supported contraceptive is selected", () => {
      it("returns a list of associated 'drip' types", () => {
        const input = "cervicalCap,condom,solo,diaphragm,sterilisation";
        expect(getContraceptiveTypes(input).sort()).toEqual(['condom', 'diaphragm', 'other', 'other']);
      });
      it("excludes the 'solo' option", () => {
        const input = "cervicalCap,withdrawal,solo,sterilisation";
        const inputLength = input.split(',').length;
        const result = getContraceptiveTypes(input)
        expect(result).not.toContain('solo');
        expect(result.length).toBe(inputLength - 1);
      });
    });
  });
});

// describe("getBleedingValue", () => {
//
// });
