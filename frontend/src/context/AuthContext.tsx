import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<any>>;
  registerUser: (data: any) => Promise<ApiResponse<any>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore authentication state from localStorage on startup
    const storedToken = localStorage.getItem('careflow_token');
    const storedUser = localStorage.getItem('careflow_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: jwtToken, user: userData } = response.data.data;
      
      localStorage.setItem('careflow_token', jwtToken);
      localStorage.setItem('careflow_user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
      
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const registerUser = async (data: any): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post('/auth/register', data);
      return { success: true, message: response.data.message || 'Registration successful!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('careflow_token');
    localStorage.removeItem('careflow_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    registerUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
