import axiosInstance from './axiosInstance';
import { User } from '../types/auth';

export class UserService {
  /**
   * Get all users
   */
  static async getAllUsers(): Promise<User[]> {
    const response = await axiosInstance.get<User[]>('/users');
    return response.data;
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<User> {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User> {
    const response = await axiosInstance.get<User>(`/users/email/${email}`);
    return response.data;
  }

  /**
   * Create new user
   */
  static async createUser(userData: { email: string; password: string }): Promise<User> {
    const response = await axiosInstance.post<User>('/users', userData);
    return response.data;
  }

  /**
   * Update user
   */
  static async updateUser(id: number, userData: Partial<{ email: string; password: string }>): Promise<User> {
    const response = await axiosInstance.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<string> {
    const response = await axiosInstance.delete<string>(`/users/${id}`);
    return response.data;
  }
}
