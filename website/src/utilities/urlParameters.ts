import {
  blankState,
  booleanKeys,
  type DataContextType,
  numericKeys,
  type UrlParamValue,
} from '../contexts/DataProvider';

export function getUrlParam(param: string): UrlParamValue {
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

export function getFlowPathEnabled(): boolean {
  return getUrlParam('flowpath') === 'true';
}

export function getData(): DataContextType['data'] {
  const data: { [key: string]: UrlParamValue } = {};

  for (const key in blankState) {
    data[key] = getUrlParam(key);
    if (!data[key] && blankState[key as keyof typeof blankState] !== null) {
      data[key] = blankState[key as keyof typeof blankState] as UrlParamValue;
    }
  }

  return data as DataContextType['data'];
}
