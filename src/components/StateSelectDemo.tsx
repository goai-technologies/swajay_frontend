import React, { useState } from 'react';
import { MultiSelect } from '@/components/ui/multi-select';
import { US_STATES } from '@/constants/states';

const StateSelectDemo: React.FC = () => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const stateOptions = US_STATES.map(state => ({
    value: state.value,
    label: state.label,
    abbreviation: state.abbreviation
  }));

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">State Selection Demo</h2>
      
      <div className="mb-4">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
          Select States
        </label>
        <MultiSelect
          options={stateOptions}
          selected={selectedStates}
          onChange={setSelectedStates}
          placeholder="Select states..."
          showAbbreviation={true}
          maxDisplay={3}
          className="w-full"
        />
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected States:</h3>
        <div className="text-sm text-gray-600">
          {selectedStates.length > 0 ? selectedStates.join(', ') : 'None selected'}
        </div>
      </div>
    </div>
  );
};

export default StateSelectDemo;
