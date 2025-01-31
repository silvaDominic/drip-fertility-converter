import { getBleedingValue, getCervicalFluidValue, getContraceptiveTypes, getSexType, mapRYB } from '../src/RYB/ryb.js';
import { expect, describe, it } from 'vitest';

describe("RYB", () => {
  describe("mapRYB", () => {
    describe("when mapping from RYB to drip", () => {
      it('excludes bad entries', () => {
        const input = {
          data: [
            { date: "2025-01-01T00:00:00.000Z" },
            { date: "" },
            { date: " " },
            { date: "2025-01-01T00:00:00.000Z" },
            { date: undefined },
            { date: null },
          ]
        };
        const result = mapRYB(input);

        result.forEach(item => {
          expect(item).toHaveProperty('date')
        });
        expect(result.length).toBe(2);
      });

      it('converts the date to ISO-8601', () => {
        const input = {
          data: [{ date: "2025-01-01T00:00:00.000Z" }]
        };
        expect(mapRYB(input)[0].date).toBe("2025-01-01");
      });

      it('returns an object with all relevant properties and default values', () => {
        const input = {
          data: [{ date: "2025-01-01" }]
        };
        const result = mapRYB(input)[0];
        expect(result).toHaveProperty('date'); // Has no default
        expect(result).toHaveProperty('temperature.value', null);
        expect(result).toHaveProperty('temperature.exclude', false);
        expect(result).toHaveProperty('bleeding.value', null);
        expect(result).toHaveProperty('bleeding.exclude', null);
        expect(result).toHaveProperty('mucus.feeling', 1);
        expect(result).toHaveProperty('mucus.texture', null);
        expect(result).toHaveProperty('mucus.value', null);
        expect(result).toHaveProperty('mucus.exclude', false);
        expect(result).toHaveProperty('cervix.opening', null);
        expect(result).toHaveProperty('cervix.firmness', null);
        expect(result).toHaveProperty('cervix.position', null);
        expect(result).toHaveProperty('cervix.exclude', false);
        expect(result).toHaveProperty('note.value', '');

        expect(Object.keys(result).length).toBe(14);
      });
    })
  });

  describe("getBleedingValue", () => {
    describe("when multiple bleeding values are passed in", () => {
      it("ignores spotting values", () => {
        const input = "bleeding_light,bleeding_heavy,spotting";
        expect(getBleedingValue(input)).not.toBe(0); // 0 === spotting
      });

      it("prioritizes heaviest value", () => {
        const input = "bleeding_light,bleeding_heavy,spotting";
        expect(getBleedingValue(input)).toBe(3); // 3 === bleeding_heavy
      });
    });
  });

  describe("getCervicalFluidVal", () => {
    describe("when multiple mucus values are passed in", () => {
      it("prioritizes 'peak' values over others", () => {
        const input = "non_peak,bleeding_light,dry,peak,spotting";
        expect(getCervicalFluidValue(input)).toBe(2);
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

    describe("when no contraceptive value is selected", () => {
      it('returns null', () => {
        expect(getSexType("")).toBe(null);
      });
    });
  });

  // Write a better test
  describe("getContraceptiveTypes", () => {
    describe("when a supported contraceptive is selected", () => {
      it("returns a list of supported 'drip' types without the need of a note", () => {
        const input = "condom,diaphragm";
        const result = getContraceptiveTypes(input);
        expect(result).toContainEqual(
          expect.objectContaining({ name: "condom", asNote: false })
        );
        expect(result).toContainEqual(
          expect.objectContaining({ name: "diaphragm", asNote: false })
        );
        expect(result.length).toBe(2);
      });

      it("returns a list of unsupported 'drip' types with the need of a note", () => {
        const input = "condom,diaphragm,cervicalCap,withdrawal";
        const result = getContraceptiveTypes(input);
        expect(result).toContainEqual(
          expect.objectContaining({ name: "cervicalCap", asNote: true })
        );
        expect(result).toContainEqual(
          expect.objectContaining({ name: "withdrawal", asNote: true })
        );
        expect(result.length).toBe(4);
      });

      it("excludes the 'solo' option", () => {
        const input = "condom,solo,diaphragm";
        const inputLength = input.split(',').length;
        const result = getContraceptiveTypes(input);

        result.forEach(item => {
          expect(item).not.toHaveProperty('name', 'solo');
        });
        expect(result.length).toBe(inputLength - 1);
      });
    });
  });
});
