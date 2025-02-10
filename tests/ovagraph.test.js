import { getTemperature, mapOvagraph } from "../src/mappers/ovagraph.js";
import { expect, describe, it, vi } from "vitest";
import * as ovagraph from '../src/mappers/ovagraph.js';

describe("Ovagraph", () => {
  describe("mapOvagraph", () => {
    it("returns an object with all relevant properties and default values", () => {
      const input = {
        data: [{ d: "2025-01-01" }]
      }
      const result = mapOvagraph(input)[0];
      expect(result).toHaveProperty('date'); // Has no default
      expect(result).toHaveProperty('temperature.time', null);
      expect(result).toHaveProperty('temperature.value', null);
      expect(result).toHaveProperty('temperature.exclude', false);
      expect(result).toHaveProperty('bleeding.value', null);
      expect(result).toHaveProperty('bleeding.exclude', null);
      expect(result).toHaveProperty('mucus.feeling', null);
      expect(result).toHaveProperty('mucus.texture', null);
      expect(result).toHaveProperty('cervix.opening', null);
      expect(result).toHaveProperty('cervix.firmness', null);
      expect(result).toHaveProperty('cervix.position', null);
      expect(result).toHaveProperty('sex.partner', null);
      expect(result).toHaveProperty('note.value', "");

      expect(Object.keys(result).length).toBe(14);
    });

    it("excludes bad entries", () => {
      const input = {
        data: [
          { d: "2025-01-01T00:00:00.000Z" },
          { d: "" },
          { d: " " },
          { d: "2025-01-01T00:00:00.000Z" },
          { d: undefined },
          { d: null },
        ]
      };
      const result = mapOvagraph(input);

      result.forEach(item => {
        expect(item).toHaveProperty('date')
      });
      expect(result.length).toBe(2);
    });

    it("includes unsupported 'sticky' vaginal sensation value as a note", () => {
      const input = {
        data: [{
          d: "2025-01-01",
          vs: "sticky",
        }]
      }
      expect(mapOvagraph(input)[0]).toHaveProperty("note.value", "Vaginal Sensation: sticky\n")
    });

    it("includes unsupported 'sticky' cervical mucus value as a note", () => {
      const input = {
        data: [{
          d: "2025-01-01",
          cm: "sticky",
        }]
      }
      expect(mapOvagraph(input)[0]).toHaveProperty("note.value", "Cervical Mucus: sticky\n");
    });

    it("includes unsupported 'watery' cervical mucus value as a note", () => {
      const input = {
        data: [{
          d: "2025-01-01",
          cm: "watery",
        }]
      }
      expect(mapOvagraph(input)[0]).toHaveProperty("note.value", "Cervical Mucus: watery\n");
    });

    it.skip("calls the 'get temperature' function", () => {
      const getTemperatureSpy = vi.spyOn(ovagraph, 'getTemperature');
      const input = {
        data: [{
          d: "2025-01-01",
          bf: "98.6",
        }]
      }

      ovagraph.mapOvagraph(input);

      // TODO: Find out why this doesn't work
      expect(getTemperatureSpy).toHaveBeenCalledTimes(1);
      expect(getTemperatureSpy).toHaveBeenNthCalledWith("98.6");
    });
  });

  describe('getTemperature', () => {
    describe('when a Celsius value is provided', () => {
      it("returns the same value", () => {
        expect(getTemperature(37)).toBe(37);
      });
    });

    describe("when a Fahrenheit value is provided", () => {
      it("returns the converted Celsius value", () => {
        expect(getTemperature(98.6)).toBe(37);
      });
    });

    describe("when a string value is provided", () => {
      it("still should return a number", () => {
        expect(getTemperature("37")).toBe(37);
      });
    });
  });
});
