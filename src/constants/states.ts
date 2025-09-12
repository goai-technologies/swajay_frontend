export interface StateOption {
  value: string;
  label: string;
  abbreviation: string;
}

export const US_STATES: StateOption[] = [
  { value: 'AL', label: 'Alabama', abbreviation: 'AL' },
  { value: 'AK', label: 'Alaska', abbreviation: 'AK' },
  { value: 'AZ', label: 'Arizona', abbreviation: 'AZ' },
  { value: 'AR', label: 'Arkansas', abbreviation: 'AR' },
  { value: 'CA', label: 'California', abbreviation: 'CA' },
  { value: 'CO', label: 'Colorado', abbreviation: 'CO' },
  { value: 'CT', label: 'Connecticut', abbreviation: 'CT' },
  { value: 'DE', label: 'Delaware', abbreviation: 'DE' },
  { value: 'FL', label: 'Florida', abbreviation: 'FL' },
  { value: 'GA', label: 'Georgia', abbreviation: 'GA' },
  { value: 'HI', label: 'Hawaii', abbreviation: 'HI' },
  { value: 'ID', label: 'Idaho', abbreviation: 'ID' },
  { value: 'IL', label: 'Illinois', abbreviation: 'IL' },
  { value: 'IN', label: 'Indiana', abbreviation: 'IN' },
  { value: 'IA', label: 'Iowa', abbreviation: 'IA' },
  { value: 'KS', label: 'Kansas', abbreviation: 'KS' },
  { value: 'KY', label: 'Kentucky', abbreviation: 'KY' },
  { value: 'LA', label: 'Louisiana', abbreviation: 'LA' },
  { value: 'ME', label: 'Maine', abbreviation: 'ME' },
  { value: 'MD', label: 'Maryland', abbreviation: 'MD' },
  { value: 'MA', label: 'Massachusetts', abbreviation: 'MA' },
  { value: 'MI', label: 'Michigan', abbreviation: 'MI' },
  { value: 'MN', label: 'Minnesota', abbreviation: 'MN' },
  { value: 'MS', label: 'Mississippi', abbreviation: 'MS' },
  { value: 'MO', label: 'Missouri', abbreviation: 'MO' },
  { value: 'MT', label: 'Montana', abbreviation: 'MT' },
  { value: 'NE', label: 'Nebraska', abbreviation: 'NE' },
  { value: 'NV', label: 'Nevada', abbreviation: 'NV' },
  { value: 'NH', label: 'New Hampshire', abbreviation: 'NH' },
  { value: 'NJ', label: 'New Jersey', abbreviation: 'NJ' },
  { value: 'NM', label: 'New Mexico', abbreviation: 'NM' },
  { value: 'NY', label: 'New York', abbreviation: 'NY' },
  { value: 'NC', label: 'North Carolina', abbreviation: 'NC' },
  { value: 'ND', label: 'North Dakota', abbreviation: 'ND' },
  { value: 'OH', label: 'Ohio', abbreviation: 'OH' },
  { value: 'OK', label: 'Oklahoma', abbreviation: 'OK' },
  { value: 'OR', label: 'Oregon', abbreviation: 'OR' },
  { value: 'PA', label: 'Pennsylvania', abbreviation: 'PA' },
  { value: 'RI', label: 'Rhode Island', abbreviation: 'RI' },
  { value: 'SC', label: 'South Carolina', abbreviation: 'SC' },
  { value: 'SD', label: 'South Dakota', abbreviation: 'SD' },
  { value: 'TN', label: 'Tennessee', abbreviation: 'TN' },
  { value: 'TX', label: 'Texas', abbreviation: 'TX' },
  { value: 'UT', label: 'Utah', abbreviation: 'UT' },
  { value: 'VT', label: 'Vermont', abbreviation: 'VT' },
  { value: 'VA', label: 'Virginia', abbreviation: 'VA' },
  { value: 'WA', label: 'Washington', abbreviation: 'WA' },
  { value: 'WV', label: 'West Virginia', abbreviation: 'WV' },
  { value: 'WI', label: 'Wisconsin', abbreviation: 'WI' },
  { value: 'WY', label: 'Wyoming', abbreviation: 'WY' }
];

// Helper function to get state options by abbreviation
export const getStateByAbbreviation = (abbreviation: string): StateOption | undefined => {
  return US_STATES.find(state => state.abbreviation === abbreviation);
};

// Helper function to get state options by value
export const getStateByValue = (value: string): StateOption | undefined => {
  return US_STATES.find(state => state.value === value);
};
