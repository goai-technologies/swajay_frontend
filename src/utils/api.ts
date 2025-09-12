import { API_CONFIG, API_ENDPOINTS, getAuthHeaders } from '@/constants/api';

// Utility function to create full API URLs
export const createApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Utility function to create fetch requests with auth headers
export const createFetchRequest = (url: string, token: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...options.headers,
    },
  });
};

// Pre-built API URL functions
export const apiUrls = {
  // Users
  users: (params?: { page?: number; page_size?: number }) => 
    createApiUrl(API_ENDPOINTS.USERS, params),
  userById: (id: string) => 
    createApiUrl(API_ENDPOINTS.USER_BY_ID(id)),
  
  // Clients
  clients: (params?: { page?: number; page_size?: number }) => 
    createApiUrl(API_ENDPOINTS.CLIENTS, params),
  clientById: (id: string) => 
    createApiUrl(API_ENDPOINTS.CLIENT_BY_ID(id)),
  
  // Orders
  orders: (params?: { page?: number; page_size?: number }) => 
    createApiUrl(API_ENDPOINTS.ORDERS, params),
  orderById: (id: string) => 
    createApiUrl(API_ENDPOINTS.ORDER_BY_ID(id)),
  orderLog: (id: string) => 
    createApiUrl(API_ENDPOINTS.ORDER_LOG(id)),
  
  // Dashboard
  userDashboard: (userId: string) => 
    createApiUrl(API_ENDPOINTS.USER_DASHBOARD(userId)),
  requestWork: (userId: string) => 
    createApiUrl(API_ENDPOINTS.REQUEST_WORK(userId)),
  completeStep: (stepId: string) => 
    createApiUrl(API_ENDPOINTS.COMPLETE_STEP(stepId)),
  
  // Order Types
  orderTypes: () => 
    createApiUrl(API_ENDPOINTS.ORDER_TYPES),
  orderTypeById: (id: string) => 
    createApiUrl(API_ENDPOINTS.ORDER_TYPE_BY_ID(id)),
  orderTypeStepsMapping: (id: string) => 
    createApiUrl(API_ENDPOINTS.ORDER_TYPE_STEPS_MAPPING(id)),
  
  // Steps Library
  stepsLibrary: () => 
    createApiUrl(API_ENDPOINTS.STEPS_LIBRARY),
  stepById: (id: string) => 
    createApiUrl(API_ENDPOINTS.STEP_BY_ID(id)),
  
  // Capabilities
  capabilities: () => 
    createApiUrl(API_ENDPOINTS.CAPABILITIES),
  capabilityById: (id: string) => 
    createApiUrl(API_ENDPOINTS.CAPABILITY_BY_ID(id)),
  
  // Auth
  login: () => 
    createApiUrl(API_ENDPOINTS.LOGIN),
};
