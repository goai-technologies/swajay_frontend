import axios from 'axios';
import { API_CONFIG } from '@/constants/api';

const BASE_URL = API_CONFIG.BASE_URL;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

export interface StepMapping {
  step_library_id: string;
  sequence_number: number;
}

export const createOrderTypeStepMappings = async (
  order_type_id: string,
  step_mappings: StepMapping[]
) => {
  const response = await axios.post(
    `${BASE_URL}/order_types/${order_type_id}/steps_mapping`,
    { order_type_id, step_mappings },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const listOrderTypeStepMappings = async (order_type_id: string) => {
  const response = await axios.get(
    `${BASE_URL}/order_types/${order_type_id}/steps_mapping`,
    { 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders()
      }
    }
  );
  return response.data;
};

export const updateOrderTypeStepMapping = async (
  order_type_step_mapping_id: string,
  step_library_id: string,
  sequence_number: number
) => {
  const response = await axios.put(
    `${BASE_URL}/order_types/steps_mapping/${order_type_step_mapping_id}`,
    { step_library_id, sequence_number },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Update only the sequence number for a mapping (used for drag-and-drop reordering)
export const updateOrderTypeStepSequence = async (
  order_type_step_mapping_id: string,
  sequence_number: number
) => {
  const response = await axios.put(
    `${BASE_URL}/order_types/steps_mapping/${order_type_step_mapping_id}`,
    { sequence_number },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const deleteOrderTypeStepMapping = async (order_type_step_mapping_id: string) => {
  const response = await axios.delete(
    `${BASE_URL}/order_types/steps_mapping/${order_type_step_mapping_id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};
