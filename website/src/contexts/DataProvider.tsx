import { createContext, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getData, getIsEmbedded } from '../utilities/urlParameters';

export type UrlParamValue = number | string | boolean | null;
export type StateKey = keyof typeof blankState;
export const blankState = {
  ID: null,
  ADDRESS: null,
  CITY: null,
  COUNTY: null,
  DD_LAT: null,
  DD_LONG: null,
  HIGHWAY: null,
  INDIAN: false,
  MILEMARKER: null,
  OWNER_AGENCY: null,
  SPILL_NUMBER: null,
  UTM_X: null,
  UTM_Y: null,
  ZIP: null,
};

type StringOrNull = string | null;
export type NumberOrNull = number | null;

export const EMBEDDED_MESSAGE_TYPES = {
  DATA_SYNC: 'data-sync',
  FLOWPATH_TOKEN_ERROR: 'flowpath-token-error',
  FLOWPATH_TOKEN_REQUEST: 'flowpath-token-request',
  FLOWPATH_TOKEN_RESPONSE: 'flowpath-token-response',
} as const;

export const FLOWPATH_TOKEN_REQUEST_TIMEOUT_MS = 5000;

export type DataContextType = {
  data: {
    ID: StringOrNull;
    ADDRESS: StringOrNull;
    CITY: StringOrNull;
    COUNTY: StringOrNull;
    DD_LAT: NumberOrNull;
    DD_LONG: NumberOrNull;
    HIGHWAY: StringOrNull;
    INDIAN: boolean;
    MILEMARKER: StringOrNull;
    OWNER_AGENCY: StringOrNull;
    SPILL_NUMBER?: StringOrNull; // this is only used in standalone mode
    UTM_X: NumberOrNull;
    UTM_Y: NumberOrNull;
  };
  requestFlowpathToken: () => Promise<string>;
  setData: React.Dispatch<React.SetStateAction<DataContextType['data']>>;
};
export const numericKeys = ['DD_LAT', 'DD_LONG', 'UTM_X', 'UTM_Y'];
export const booleanKeys = ['INDIAN'];

const isEmbedded = getIsEmbedded();
const urlData = getData();

export const DataContext = createContext<DataContextType | null>(null);

type EmbeddedMessage = {
  data?: Record<string, UrlParamValue>;
  error?: string;
  iframeId?: string;
  requestId?: string;
  token?: string;
  type?: (typeof EMBEDDED_MESSAGE_TYPES)[keyof typeof EMBEDDED_MESSAGE_TYPES];
};

type PendingTokenRequest = {
  reject: (error: Error) => void;
  resolve: (token: string) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

function createRequestId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `flowpath-${Date.now()}`;
}

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<DataContextType['data']>(!isEmbedded ? urlData : blankState);
  const iframeId = useRef<StringOrNull>(null);
  const pendingTokenRequests = useRef<Map<string, PendingTokenRequest>>(new Map());
  const salesforceOrigin = useRef<StringOrNull>(null);

  const clearPendingTokenRequest = useCallback((requestId: string) => {
    const pendingTokenRequest = pendingTokenRequests.current.get(requestId);

    if (!pendingTokenRequest) {
      return null;
    }

    clearTimeout(pendingTokenRequest.timeoutId);
    pendingTokenRequests.current.delete(requestId);

    return pendingTokenRequest;
  }, []);

  const rejectAllPendingTokenRequests = useCallback((message: string) => {
    for (const [requestId, pendingTokenRequest] of pendingTokenRequests.current.entries()) {
      clearTimeout(pendingTokenRequest.timeoutId);
      pendingTokenRequest.reject(new Error(message));
      pendingTokenRequests.current.delete(requestId);
    }
  }, []);

  const requestFlowpathToken = useCallback(() => {
    if (!isEmbedded) {
      return Promise.reject(new Error('Flow path token requests are only available in embedded mode.'));
    }

    if (!iframeId.current || !salesforceOrigin.current) {
      return Promise.reject(new Error('Salesforce connection is not ready yet.'));
    }

    const requestId = createRequestId();
    const targetOrigin = salesforceOrigin.current;
    const currentIframeId = iframeId.current;

    return new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        pendingTokenRequests.current.delete(requestId);
        reject(new Error('Timed out waiting for a flow path token.'));
      }, FLOWPATH_TOKEN_REQUEST_TIMEOUT_MS);

      pendingTokenRequests.current.set(requestId, {
        reject,
        resolve,
        timeoutId,
      });

      window.parent.postMessage(
        {
          iframeId: currentIframeId,
          requestId,
          type: EMBEDDED_MESSAGE_TYPES.FLOWPATH_TOKEN_REQUEST,
        },
        targetOrigin,
      );
    });
  }, []);

  const handleMessageFromSalesforce = useCallback(
    (event: MessageEvent) => {
      if (event.data === null || typeof event.data !== 'object') {
        return;
      }

      const message = event.data as EmbeddedMessage;

      // ignore messages from other sources
      if (!Object.hasOwn(message, 'iframeId') || typeof message.iframeId !== 'string') {
        return;
      }

      if (iframeId.current && message.iframeId !== iframeId.current) {
        return;
      }

      if (salesforceOrigin.current && event.origin !== salesforceOrigin.current) {
        return;
      }

      console.log('website: message received from salesforce', event);

      // remember iframeId so that we can ignore subsequent messages from other sources
      if (!iframeId.current) {
        iframeId.current = message.iframeId;
      }
      if (!salesforceOrigin.current) {
        salesforceOrigin.current = event.origin;
      }

      if (message.type === EMBEDDED_MESSAGE_TYPES.FLOWPATH_TOKEN_RESPONSE) {
        if (!message.requestId || typeof message.token !== 'string') {
          return;
        }

        clearPendingTokenRequest(message.requestId)?.resolve(message.token);

        return;
      }

      if (message.type === EMBEDDED_MESSAGE_TYPES.FLOWPATH_TOKEN_ERROR) {
        if (!message.requestId) {
          return;
        }

        clearPendingTokenRequest(message.requestId)?.reject(
          new Error(message.error ?? 'Unable to retrieve a flow path token.'),
        );

        return;
      }

      if (!message.data || typeof message.data !== 'object') {
        return;
      }

      const newData = { ...message.data };
      for (const key in newData) {
        const value = newData[key];

        if (numericKeys.includes(key) && value !== null && value !== undefined) {
          if (typeof value === 'number') {
            newData[key] = value;
          } else if (typeof value === 'string') {
            newData[key] = parseFloat(value);
          }
        } else if (booleanKeys.includes(key) && typeof value === 'string') {
          newData[key] = value === 'true';
        }
      }

      setData((prevValue) => ({
        ...prevValue,
        ...newData,
      }));
    },
    [clearPendingTokenRequest],
  );

  // send data back to salesforce on state change
  useEffect(() => {
    console.log('website: data has changed', data, isEmbedded, salesforceOrigin.current);
    if (isEmbedded && salesforceOrigin.current) {
      window.parent.postMessage(
        {
          data,
          iframeId: iframeId.current,
          type: EMBEDDED_MESSAGE_TYPES.DATA_SYNC,
        },
        salesforceOrigin.current,
      );
      console.log('posted message');
    }
  }, [data]);

  // listen for messages from salesforce
  useLayoutEffect(() => {
    if (!isEmbedded) return;

    window.addEventListener('message', handleMessageFromSalesforce);

    console.log('website: listening for messages from salesforce');

    if (import.meta.env.DEV) {
      // this is exclusively for tests/*.html
      window.parent.dispatchEvent(new Event('iframe-is-listening'));
    }

    return () => {
      window.removeEventListener('message', handleMessageFromSalesforce);
      rejectAllPendingTokenRequests('Flow path token request was interrupted.');
    };
  }, [handleMessageFromSalesforce, rejectAllPendingTokenRequests]);

  return <DataContext.Provider value={{ data, requestFlowpathToken, setData }}>{children}</DataContext.Provider>;
};
