import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { AuthService } from '../network';
import { LoginCredentials } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import { AxiosError } from 'axios';

interface ApiError {
  error: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => AuthService.login(credentials),
    onSuccess: (data) => {
      // Store auth data
      AuthService.storeAuthData(data);
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Show success notification
      notifications.show({
        title: 'Login Successful',
        message: `Welcome back!`,
        color: 'green',
      });
      
      // Don't navigate here - let AuthContext handle it
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      notifications.show({
        title: 'Login Failed',
        message,
        color: 'red',
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => AuthService.register(credentials),
    onSuccess: (data) => {
      // Store auth data
      AuthService.storeAuthData(data);
      
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Show success notification
      notifications.show({
        title: 'Account Created Successfully',
        message: `Welcome! Your account has been created.`,
        color: 'green',
      });
      
      // Don't navigate here - let AuthContext handle it
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error || 'Registration failed. Please try again.';
      notifications.show({
        title: 'Registration Failed',
        message,
        color: 'red',
      });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async () => {
      // Use AuthContext's logout which clears state and localStorage
      await logout();
      
      // Clear all queries
      queryClient.clear();
    },
    onSettled: () => {
      // Navigate to login
      navigate('/login', { replace: true });
      
      // Show notification
      notifications.show({
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
        color: 'blue',
      });
    },
  });
}

export function useExtendSession({ onSuccess }: { onSuccess: () => void }) {
  return useMutation({
    mutationFn: () => AuthService.ping(),
    onSuccess: () => {
      notifications.show({
        title: 'Session Extended',
        message: 'Your session has been extended successfully.',
        color: 'green',
        autoClose: 3000,
      });
      onSuccess?.();
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error || 'Failed to extend session.';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    },
  });
}
