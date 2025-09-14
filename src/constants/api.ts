// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/users/login',
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  
  // Clients
  CLIENTS: '/clients',
  CLIENT_BY_ID: (id: string) => `/clients/${id}`,
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  ORDER_LOG: (id: string) => `/orders/${id}/log`,
  EDIT_ORDER: (id: string) => `/orders/${id}`,
  
  // Dashboard
  USER_DASHBOARD: (userId: string) => `/dashboard/user/${userId}`,
  REQUEST_WORK: (userId: string) => `/dashboard/user/${userId}/request-work`,
  COMPLETE_STEP: (stepId: string) => `/dashboard/step/${stepId}/complete`,
  
  // Order Types
  ORDER_TYPES: '/order-types',
  ORDER_TYPE_BY_ID: (id: string) => `/order-types/${id}`,
  ORDER_TYPE_STEPS_MAPPING: (id: string) => `/order-types/${id}/steps_mapping`,
  
  // Steps Library
  STEPS_LIBRARY: '/steps_library',
  STEP_BY_ID: (id: string) => `/steps_library/${id}`,
  
  // Capabilities
  CAPABILITIES: '/capabilities',
  CAPABILITY_BY_ID: (id: string) => `/capabilities/${id}`,
} as const;

// Request Headers
export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Common Request Options
export const getRequestOptions = (token?: string) => ({
  headers: token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' },
  timeout: API_CONFIG.TIMEOUT,
});

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An error occurred on the server. Please try again later.',
  TIMEOUT: 'The request timed out. Please try again.',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;
