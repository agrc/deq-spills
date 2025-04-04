import { useContext } from 'react';
import { DataContext } from '../contexts/DataProvider';

export default function Sidebar() {
  const context = useContext(DataContext);

  if (!context) {
    return null;
  }

  const { data } = context;

  return (
    <aside className="w-96 border-l border-l-slate-300 bg-white p-4 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold">Spill Incident Details</h2>
      <div className="space-y-4">
        {Object.entries(data)
          .filter(([key]) => data[key as keyof typeof data] !== null)
          .map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium text-gray-500">{key}</label>
              <p className="text-gray-900">{String(value)}</p>
            </div>
          ))}
      </div>
    </aside>
  );
}
