import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordRequest {
  new_password: string;
  confirm_password: string;
}

export interface PasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Change password for the current user (self-service)
 */
export const changePassword = async (
  userId: string,
  passwordData: ChangePasswordRequest,
  token: string
): Promise<PasswordResponse> => {
  try {
    // Prepare the API payload (exclude confirm_password as it's only for frontend validation)
    const apiPayload = {
      old_password: passwordData.old_password,
      new_password: passwordData.new_password
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_CHANGE_PASSWORD(userId)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error changing password:', error);
    throw new Error(error.message || 'Failed to change password');
  }
};

/**
 * Reset password for any user (admin/supervisor only)
 */
export const resetPassword = async (
  userId: string,
  passwordData: ResetPasswordRequest,
  token: string
): Promise<PasswordResponse> => {
  try {
    // Prepare the API payload (exclude confirm_password as it's only for frontend validation)
    const apiPayload = {
      new_password: passwordData.new_password
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_RESET_PASSWORD(userId)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(error.message || 'Failed to reset password');
  }
};
