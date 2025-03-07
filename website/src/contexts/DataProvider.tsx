import { createContext, useEffect, useRef, useState } from 'react';
import { getData, getIsEmbedded } from '../urlParameters';

export const blankState = {
  ADDRESS: null,
  CITY: null,
  COUNTY: null,
  DD_LAT: null,
  DD_LONG: null,
  HIGHWAY: null,
  INDIAN: null,
  MILEMARKER: null,
  OWNER_AGENCY: null,
  UTM_X: null,
  UTM_Y: null,
  ZIP: null,
};

type StringOrNull = string | null;
type DataProp = keyof typeof blankState;
export type DataContext = {
  data: {
    [key in DataProp]: StringOrNull;
  };
  setData: React.Dispatch<React.SetStateAction<DataContext['data']>>;
};

const isEmbedded = getIsEmbedded();
const urlData = getData();

export const DataContext = createContext<DataContext | null>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<DataContext['data']>(!isEmbedded ? urlData : blankState);
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

    setData((prevValue) => ({
      ...prevValue,
      ...event.data.data,
    }));
  };

  // send data back to salesforce on state change
  useEffect(() => {
    if (isEmbedded && salesforceOrigin.current) {
      window.parent.postMessage(data, salesforceOrigin.current);
    }
  }, [data]);

  // listen for messages from salesforce
  useEffect(() => {
    if (!isEmbedded) return;

    window.addEventListener('message', handleMessageFromSalesforce);

    return () => {
      window.removeEventListener('message', handleMessageFromSalesforce);
    };
  }, []);

  return <DataContext.Provider value={{ data, setData }}>{children}</DataContext.Provider>;
};
