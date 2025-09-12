import axios from 'axios';
import { API_CONFIG } from '@/constants/api';

const BASE_URL = API_CONFIG.BASE_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

export const createCapability = async (capability_name: string) => {
  const response = await axios.post(
    `${BASE_URL}/capabilities`,
    { capability_name },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getAllCapabilities = async () => {
  const response = await axios.get(`${BASE_URL}/capabilities`, { headers: getAuthHeaders() });
  return response.data;
};

export const getCapabilityById = async (capability_id: string) => {
  const response = await axios.get(
    `${BASE_URL}/capabilities/${capability_id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateCapability = async (capability_id: string, capability_name: string) => {
  const response = await axios.put(
    `${BASE_URL}/capabilities/${capability_id}`,
    { capability_name },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteCapability = async (capability_id: string) => {
  const response = await axios.delete(
    `${BASE_URL}/capabilities/${capability_id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
