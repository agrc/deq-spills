import { createContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  setData: React.Dispatch<React.SetStateAction<DataContextType['data']>>;
};
export const numericKeys = ['DD_LAT', 'DD_LONG', 'UTM_X', 'UTM_Y'];
export const booleanKeys = ['INDIAN'];

const isEmbedded = getIsEmbedded();
const urlData = getData();

export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<DataContextType['data']>(!isEmbedded ? urlData : blankState);
  const iframeId = useRef<StringOrNull>(null);
  const salesforceOrigin = useRef<StringOrNull>(null);

  const handleMessageFromSalesforce = (event: MessageEvent) => {
    // ignore messages from other sources
    if (!Object.hasOwn(event.data, 'iframeId') || (iframeId.current && event.data.iframeId !== iframeId.current)) {
      return;
    }

    console.log('website: message received from salesforce', event);

    // remember iframeId so that we can ignore subsequent messages from other sources
    if (!iframeId.current) {
      iframeId.current = event.data.iframeId;
    }
    if (!salesforceOrigin.current) {
      salesforceOrigin.current = event.origin;
    }

    const newData = event.data.data;
    for (const key in newData) {
      if (numericKeys.includes(key) && newData[key] !== null) {
        newData[key] = parseFloat(newData[key]);
      } else if (booleanKeys.includes(key) && typeof newData[key] === 'string') {
        newData[key] = newData[key] === 'true';
      }
    }

    setData((prevValue) => ({
      ...prevValue,
      ...newData,
    }));
  };

  // send data back to salesforce on state change
  useEffect(() => {
    console.log('website: data has changed', data, isEmbedded, salesforceOrigin.current);
    if (isEmbedded && salesforceOrigin.current) {
      window.parent.postMessage(
        {
          data,
          iframeId: iframeId.current,
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
    };
  }, []);

  return <DataContext.Provider value={{ data, setData }}>{children}</DataContext.Provider>;
};
