import { describe, it, expect } from 'vitest';
import { convertToMilitaryTime, formatTemperature, mapPremom } from '../src/mappers/premom.js';
import { mapRYB } from "../src/mappers/ryb.js";

describe("Premom", () => {
  describe("mapPremom", () => {
    describe("when mapping from Premom to drip", () => {
      it("returns an object with all relevant properties and default values", () => {
        const input = {
          data: [
            { Date: "2025-01-01" }
          ]
        };
        const result = mapPremom(input)[0];
        expect(result).toHaveProperty("date");
        expect(result).toHaveProperty("temperature.value", null);
        expect(result).toHaveProperty("temperature.time", null);
        expect(result).toHaveProperty("temperature.exclude", false);

        expect(Object.keys(result).length).toBe(4);
      });
    });

    it('converts the date to ISO-8601 (YYYY-MM-DD)', () => {
      const input = {
        data: [{ date: "2025-01-01" }]
      };
      expect(mapRYB(input)[0].date).toBe("2025-01-01");
    });
  });

  describe("formatTemperature", () => {
    it("removes anything not a number or decimal", () => {
      expect(formatTemperature("98.5�H")).toBe("98.5");
      expect(formatTemperature(" 98.5 ")).toBe("98.5");
      expect(formatTemperature("!@#$%^&*()_+98.5!@#$%^&*()_+")).toBe("98.5");
      expect(formatTemperature("ABC98.5abc")).toBe("98.5");
      expect(formatTemperature("{[98.5]}")).toBe("98.5");
    });
  });

  describe("convertToMilitaryTime", () => {
    describe("when the time is in the afternoon", () => {
      it("adds 12 hours", () => {
        expect(convertToMilitaryTime("11:59", "PM")).toBe("23:59");
      });

      describe("and it's noon", () => {
        it("returns 12:00", () => {
          expect(convertToMilitaryTime("12:00", "PM")).toBe("12:00");
        });
      });
    });

    describe("when the time is in the morning", () => {
      it("returns the same time", () => {
        expect(convertToMilitaryTime("11:59", "AM")).toBe("11:59");
      });

      describe("and it's midnight", () => {
        it("returns 00:00", () => {
          expect(convertToMilitaryTime("12:00", "AM")).toBe("00:00");
        });
      });
    });
  });
});
