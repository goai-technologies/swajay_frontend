// Order Types used throughout the application
export const ORDER_TYPES = [
  'COS',
  'Commitment Review',
  'TOS',
  'FS',
  'Document Retrieval',
  'Update',
  'AVR'
] as const;

export type OrderType = typeof ORDER_TYPES[number];

// Order Type descriptions for better UX
export const ORDER_TYPE_DESCRIPTIONS = {
  'COS': 'Certificate of Satisfaction',
  'Commitment Review': 'Title Commitment Review',
  'TOS': 'Title Opinion Search',
  'FS': 'Full Search',
  'Document Retrieval': 'Document Retrieval Service',
  'Update': 'Title Update',
  'AVR': 'Automated Valuation Report'
} as const;
