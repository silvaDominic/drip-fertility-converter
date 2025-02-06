import { getMilitaryTime } from "../src/utils.js";
import { describe, it, expect } from 'vitest';

describe('utils', () => {
  describe('getLocalTime', () => {
    it('should return the correct local time in military time', () => {
      const input = new Date("2025-02-01T00:00:00.000Z");
      expect(getMilitaryTime(input)).toBe("19:00");
    });
  });
});
