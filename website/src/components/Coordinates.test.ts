import { describe, expect, it } from 'vitest';
import { blankValues, getDDCoordinates, hasPopulatedValues } from './Coordinates';

describe('getDDCoordinates', () => {
  it('should return correct coordinates for type "dd"', () => {
    const values = {
      ...blankValues,
      dd: { latitude: '40.7608', longitude: '111.8910' },
    };
    const result = getDDCoordinates('dd', values);
    expect(result).toEqual({ x: -111.891, y: 40.7608 });
  });

  it('should handle negative longitude coordinates for type "dd"', () => {
    const values = {
      ...blankValues,
      dd: { latitude: '40.7608', longitude: '-111.8910' },
    };
    const result = getDDCoordinates('dd', values);
    expect(result).toEqual({ x: -111.891, y: 40.7608 });
  });

  it('should handle negative longitude coordinates for type "dm"', () => {
    const values = {
      ...blankValues,
      dm: { latitudeDegrees: '40', latitudeMinutes: '45.648', longitudeDegrees: '-111', longitudeMinutes: '53.46' },
    };
    const result = getDDCoordinates('dm', values);
    expect(result).toEqual({ x: -110.109, y: 40.7608 });
  });

  it('should handle negative longitude coordinates for type "dms"', () => {
    const values = {
      ...blankValues,
      dms: {
        latitudeDegrees: '40',
        latitudeMinutes: '45',
        latitudeSeconds: '38.88',
        longitudeDegrees: '-111',
        longitudeMinutes: '53',
        longitudeSeconds: '27.6',
      },
    };
    const result = getDDCoordinates('dms', values);
    expect(result).toEqual({ x: -110.109, y: 40.7608 });
  });

  it('should return correct coordinates for type "dm"', () => {
    const values = {
      ...blankValues,
      dm: { latitudeDegrees: '40', latitudeMinutes: '45.648', longitudeDegrees: '111', longitudeMinutes: '53.46' },
    };
    const result = getDDCoordinates('dm', values);
    expect(result).toEqual({ x: -111.891, y: 40.7608 });
  });

  it('should return correct coordinates for type "dms"', () => {
    const values = {
      ...blankValues,
      dms: {
        latitudeDegrees: '40',
        latitudeMinutes: '45',
        latitudeSeconds: '38.88',
        longitudeDegrees: '111',
        longitudeMinutes: '53',
        longitudeSeconds: '27.6',
      },
    };
    const result = getDDCoordinates('dms', values);
    expect(result).toEqual({ x: -111.891, y: 40.7608 });
  });

  it('should throw an error for invalid coordinate type', () => {
    expect(() => getDDCoordinates('utm', blankValues)).toThrow('Invalid coordinate type: utm');
  });
});

describe('hasValidData', () => {
  it('should return true for valid DD coordinates', () => {
    const values = {
      ...blankValues,
      dd: {
        latitude: '40.7608',
        longitude: '-111.8910',
      },
    };
    expect(hasPopulatedValues(values, 'dd')).toBe(true);
  });

  it('should return false for invalid DD coordinates', () => {
    const values = {
      ...blankValues,
      dd: {
        latitude: '',
        longitude: '-111.8910',
      },
    };
    expect(hasPopulatedValues(values, 'dd')).toBe(false);
  });

  it('should return true for valid DM coordinates', () => {
    const values = {
      ...blankValues,
      dm: {
        latitudeDegrees: '40',
        latitudeMinutes: '45.648',
        longitudeDegrees: '-111',
        longitudeMinutes: '53.46',
      },
    };
    expect(hasPopulatedValues(values, 'dm')).toBe(true);
  });

  it('should return false for invalid DM coordinates', () => {
    const values = {
      ...blankValues,
      dm: {
        latitudeDegrees: '40',
        latitudeMinutes: '',
        longitudeDegrees: '-111',
        longitudeMinutes: '53.46',
      },
    };
    expect(hasPopulatedValues(values, 'dm')).toBe(false);
  });

  it('should return true for valid DMS coordinates', () => {
    const values = {
      ...blankValues,
      dms: {
        latitudeDegrees: '40',
        latitudeMinutes: '45',
        latitudeSeconds: '38.88',
        longitudeDegrees: '-111',
        longitudeMinutes: '53',
        longitudeSeconds: '27.6',
      },
    };
    expect(hasPopulatedValues(values, 'dms')).toBe(true);
  });

  it('should return false for invalid DMS coordinates', () => {
    const values = {
      ...blankValues,
      dms: {
        latitudeDegrees: '40',
        latitudeMinutes: '45',
        latitudeSeconds: '',
        longitudeDegrees: '-111',
        longitudeMinutes: '53',
        longitudeSeconds: '27.6',
      },
    };
    expect(hasPopulatedValues(values, 'dms')).toBe(false);
  });

  it('should return true for valid UTM coordinates', () => {
    const values = {
      ...blankValues,
      utm: {
        x: '500000',
        y: '4649776',
      },
    };
    expect(hasPopulatedValues(values, 'utm')).toBe(true);
  });

  it('should return false for invalid UTM coordinates', () => {
    const values = {
      ...blankValues,
      utm: {
        x: '',
        y: '4649776',
      },
    };
    expect(hasPopulatedValues(values, 'utm')).toBe(false);
  });
});
