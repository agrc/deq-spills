import { useContext } from 'react';
import { DataContext, type DataContextType } from '../contexts/DataProvider';

const fieldAliases: Record<keyof DataContextType['data'], string> = {
  SPILL_NUMBER: 'Spill Incident Number',
  ADDRESS: 'Address',
  CITY: 'City',
  COUNTY: 'County',
  DD_LAT: 'Latitude',
  DD_LONG: 'Longitude',
  FLOWPATH_LENGTH: 'Flow Path Length (miles)',
  HIGHWAY: 'Highway',
  INDIAN: 'Tribal Land',
  MILEMARKER: 'Mile Marker',
  OWNER_AGENCY: 'Owner/Agency',
  UTM_X: 'UTM X',
  UTM_Y: 'UTM Y',
};

export default function Sidebar() {
  const context = useContext(DataContext);

  if (!context) {
    return null;
  }

  const { data } = context;
  const spill_number = data.SPILL_NUMBER;
  const otherFields = Object.entries(data).filter(
    ([key]) => key !== 'SPILL_NUMBER' && data[key as keyof typeof data] !== null,
  );

  const getFieldAlias = (fieldName: keyof typeof fieldAliases) => fieldAliases[fieldName] || fieldName;

  return (
    <aside className="w-96 border-l border-l-slate-300 bg-white p-4 shadow-lg">
      {spill_number && (
        <div className="mb-6 rounded-md bg-primary-50 p-3">
          <h3 className="block text-sm font-bold text-primary-700">{getFieldAlias('SPILL_NUMBER')}</h3>
          <p className="text-xl font-semibold text-primary-800">{spill_number}</p>
        </div>
      )}

      <div className="space-y-4">
        {otherFields.map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="text-sm font-medium text-gray-500">{getFieldAlias(key as keyof typeof fieldAliases)}</div>
            <p className="text-gray-900">{String(value === true ? 'Yes' : value === false ? 'No' : value)}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
