import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';

const BASE_URL = API_CONFIG.BASE_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

export const createStepLibraryItem = async (step_name: string, description?: string) => {
  const response = await axios.post(
    `${BASE_URL}${API_ENDPOINTS.STEPS_LIBRARY}`,
    { step_name, description },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getAllStepLibraryItems = async (params?: { page?: number; page_size?: number; search?: string; sort_by?: string; sort_dir?: 'asc' | 'desc'; }) => {
  const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.STEPS_LIBRARY}`, { headers: getAuthHeaders(), params });
  return response.data;
};

export const getStepLibraryItemById = async (step_id: string) => {
  const response = await axios.get(
    `${BASE_URL}${API_ENDPOINTS.STEP_BY_ID(step_id)}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateStepLibraryItem = async (step_id: string, step_name: string, description?: string) => {
  const response = await axios.put(
    `${BASE_URL}${API_ENDPOINTS.STEP_BY_ID(step_id)}`,
    { step_name, description },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteStepLibraryItem = async (step_id: string) => {
  const response = await axios.delete(
    `${BASE_URL}${API_ENDPOINTS.STEP_BY_ID(step_id)}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};