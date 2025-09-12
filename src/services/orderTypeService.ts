import axios from 'axios';
import { API_CONFIG } from '@/constants/api';

const BASE_URL = API_CONFIG.BASE_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

export const createOrderType = async (order_type_name: string) => {
  const response = await axios.post(
    `${BASE_URL}/order_types`,
    { order_type_name },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const getAllOrderTypes = async () => {
  const response = await axios.get(`${BASE_URL}/order_types`, { headers: getAuthHeaders() });
  return response.data;
};

export const getOrderTypeById = async (order_type_id: string) => {
  const response = await axios.get(
    `${BASE_URL}/order_types/${order_type_id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const updateOrderType = async (order_type_id: string, order_type_name: string) => {
  const response = await axios.put(
    `${BASE_URL}/order_types/${order_type_id}`,
    { order_type_name },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteOrderType = async (order_type_id: string) => {
  const response = await axios.delete(
    `${BASE_URL}/order_types/${order_type_id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
