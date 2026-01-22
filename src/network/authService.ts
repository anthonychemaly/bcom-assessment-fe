import axiosInstance from './axiosInstance';
import { AuthResponse, LoginCredentials } from '../types/auth';

interface RegisterCredentials {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Login user with username and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Register new user
   */
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  }

  /**
   * Logout user and invalidate refresh token
   */
  static async logout(refreshToken: string): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  }

  /**
   * Ping endpoint to extend session
   */
  static async ping(): Promise<{ message: string; timestamp: string }> {
    const response = await axiosInstance.get('/health/ping');
    return response.data;
  }

  /**
   * Store authentication data in localStorage
   */
  static storeAuthData(authData: AuthResponse): void {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  /**
   * Clear authentication data from localStorage
   */
  static clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Get stored user data
   */
  static getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
