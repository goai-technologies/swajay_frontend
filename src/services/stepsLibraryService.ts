import axios from 'axios';
import { API_CONFIG } from '@/constants/api';

const BASE_URL = API_CONFIG.BASE_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

export const createStepLibraryItem = async (step_name: string, description: string) => {
  const response = await axios.post(
    `${BASE_URL}/steps_library`,
    { step_name, description },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getAllStepLibraryItems = async () => {
  const response = await axios.get(`${BASE_URL}/steps_library`, { headers: getAuthHeaders() });
  return response.data;
};

export const getStepLibraryItemById = async (step_library_item_id: string) => {
  const response = await axios.get(
    `${BASE_URL}/steps_library/${step_library_item_id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateStepLibraryItem = async (
  step_library_item_id: string,
  step_name: string,
  description: string
) => {
  const response = await axios.put(
    `${BASE_URL}/steps_library/${step_library_item_id}`,
    { step_name, description },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteStepLibraryItem = async (step_library_item_id: string) => {
  const response = await axios.delete(
    `${BASE_URL}/steps_library/${step_library_item_id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
