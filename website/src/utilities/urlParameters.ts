import { blankState, booleanKeys, type DataContextType, numericKeys } from '../contexts/DataProvider';

export function getUrlParam(param: string): number | string | boolean | null {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(param);

  const isBoolean = booleanKeys.includes(param);
  if (value) {
    if (numericKeys.includes(param)) {
      return parseFloat(value);
    } else if (isBoolean) {
      return value === 'true';
    }
    return decodeURIComponent(value);
  }
  return isBoolean ? false : null;
}

export function getIsEmbedded(): boolean {
  return getUrlParam('embedded') === 'true';
}

export function getIsReadOnly(): boolean {
  return getUrlParam('readonly') === 'true';
}

export function getData(): DataContextType['data'] {
  const data: { [key: string]: number | string | boolean | null } = {};

  for (const key in blankState) {
    data[key] = getUrlParam(key);
  }

  return data as DataContextType['data'];
}
