import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { blankState } from '../contexts/DataProvider';
import { getData, getIsEmbedded, getUrlParam } from './urlParameters';

describe('urlParameters', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url.toString());
  });

  afterEach(() => {
    window.history.pushState({}, '', originalLocation.href);
  });

  describe('getUrlParam', () => {
    it('should return the correct parameter value', () => {
      window.location.search = '?test=123';
      expect(getUrlParam('test')).toBe('123');
    });

    it('should return null if the parameter does not exist', () => {
      window.location.search = '?test=123';
      expect(getUrlParam('nonexistent')).toBeNull();
    });

    it('should return a number if the parameter is numeric', () => {
      window.location.search = '?UTM_X=123';
      expect(getUrlParam('UTM_X')).toBe(123);
    });

    it('should return decoded value for non-numeric parameters', () => {
      window.location.search = '?name=John%20Doe';
      expect(getUrlParam('name')).toBe('John Doe');
    });

    it('should handle empty URL searches correctly', () => {
      window.location.search = '';
      expect(getUrlParam('param')).toBeNull();
    });

    it('should parse boolean values correctly', () => {
      window.location.search = '?INDIAN=true';
      expect(getUrlParam('INDIAN')).toBe(true);
    });

    it('should parse boolean values correctly when set to false', () => {
      window.location.search = '?INDIAN=false';
      expect(getUrlParam('INDIAN')).toBe(false);
    });
  });

  describe('getIsEmbedded', () => {
    it('should return true if embedded parameter is true', () => {
      window.location.search = '?embedded=true';
      expect(getIsEmbedded()).toBe(true);
    });

    it('should return false if embedded parameter is not true', () => {
      window.location.search = '?embedded=false';
      expect(getIsEmbedded()).toBe(false);
    });
  });

  describe('getData', () => {
    it('should return data with URL parameters', () => {
      window.location.search = '?UTM_X=1&UTM_Y=2';
      const data = getData();
      expect(data.UTM_X).toBe(1);
      expect(data.UTM_Y).toBe(2);
    });

    it('should return blankState if no URL parameters', () => {
      window.location.search = '';
      const data = getData();
      expect(data).toEqual(blankState);
    });
  });
});
