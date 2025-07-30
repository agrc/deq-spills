import { useContext } from 'react';
import { DataContext } from '../contexts/DataProvider';

export default function useData() {
  const context = useContext(DataContext);

  if (context === null) {
    throw new Error('useData must be used within a DataProvider');
  }

  return context;
}
