import { blankState, DataContext } from './contexts/DataProvider';

let params: URLSearchParams | undefined;

export function getUrlParam(param: string): string | null {
  if (!params) {
    params = new URLSearchParams(window.location.search);
  }
  const value = params.get(param);

  return value ? decodeURIComponent(value) : null;
}

export function getIsEmbedded(): boolean {
  return getUrlParam('embedded') === 'true';
}

export function getData(): DataContext['data'] {
  const data: Partial<DataContext['data']> = {};
  for (const key in blankState) {
    data[key as keyof typeof blankState] = getUrlParam(key) ?? null;
  }

  return { ...blankState, ...data };
}
