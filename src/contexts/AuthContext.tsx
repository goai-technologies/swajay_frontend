import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';

interface User {
  id: string;
  username: string;
  role: 'Admin' | 'Supervisor' | 'Processor' | 'QC' | 'Typist' | 'Auditor';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  axiosInstance: any;
  isLoading: boolean;
  setResetViewCallback: (callback: () => void) => void;
}

// Create an axios instance with interceptors
const createAxiosInstance = (token: string | null, logoutCallback?: () => void) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers
    });

    // Add a response interceptor
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // If the error status is 401 (Unauthorized), trigger logout
        if (error.response && error.response.status === 401) {
          if (logoutCallback) {
            logoutCallback();
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  } catch (error) {
    console.error('Error creating axios instance:', error);
    // Return a basic axios instance as fallback
    return axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const Authprovider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [axiosInstance, setAxiosInstance] = useState(() => {
    try {
      return createAxiosInstance(null);
    } catch (error) {
      console.error('Error creating initial axios instance:', error);
      return axios.create({
        baseURL: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resetViewCallback, setResetViewCallback] = useState<(() => void) | null>(null);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Reset axios instance
    try {
      setAxiosInstance(createAxiosInstance(null));
    } catch (error) {
      console.error('Error resetting axios instance:', error);
      setAxiosInstance(axios.create({
        baseURL: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    // Reset view to dashboard
    if (resetViewCallback) {
      resetViewCallback();
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        username,
        password
      }, {
        timeout: API_CONFIG.TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Check the response data for success
      if (response.data.success) {
        const authToken = response.data.data.token;
        const userData = response.data.data.user;
        
        // Store both token and user data in localStorage for persistence first
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Then update state
        setToken(authToken);
        setUser(userData);
        
        // Create a new axios instance with the token
        try {
          const newAxiosInstance = createAxiosInstance(authToken, logout);
          setAxiosInstance(newAxiosInstance);
        } catch (error) {
          console.error('Error creating axios instance with token:', error);
          setAxiosInstance(axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          }));
        }
        
        setIsLoading(false);
        return true;
      } else {
        // If success is false, log the error message and return false
        console.error('Login failed:', response.data.message);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Login error', error);
      setIsLoading(false);
      return false;
    }
  };

  // Check for existing token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate user object has required properties
        if (parsedUser && parsedUser.id && parsedUser.username && parsedUser.role) {
          setToken(storedToken);
          setUser(parsedUser);
          
          // Create axios instance with stored token
          try {
            const newAxiosInstance = createAxiosInstance(storedToken, logout);
            setAxiosInstance(newAxiosInstance);
          } catch (error) {
            console.error('Error creating axios instance with stored token:', error);
            setAxiosInstance(axios.create({
              baseURL: API_CONFIG.BASE_URL,
              timeout: API_CONFIG.TIMEOUT,
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${storedToken}`
              }
            }));
          }
        } else {
          console.error('Invalid user data structure:', parsedUser);
          // Clear invalid data
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Expose axiosInstance if needed in other components
  const contextValue = {
    user,
    token,
    login,
    logout,
    axiosInstance,
    isLoading,
    setResetViewCallback
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an Authprovider');
  }
  return context;
};

