import { useEffect } from 'react';
import useData from '../hooks/useDataProvider';

export default function useWaterbody() {
  const { data, setData } = useData();

  useEffect(() => {
    console.log('Waterbody: change detected in UTM');

    setData((prevData) => ({
      ...prevData,
    }));
  }, [data.UTM_X, data.UTM_Y, setData]);
}
