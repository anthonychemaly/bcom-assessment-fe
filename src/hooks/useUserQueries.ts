import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { UserService } from '../network';
import { AxiosError } from 'axios';

interface ApiError {
  error: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => UserService.getAllUsers(),
  });
}

export function useUser(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => UserService.getUserById(id),
    enabled: enabled && !!id,
  });
}

export function useUserByEmail(email: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['users', 'email', email],
    queryFn: () => UserService.getUserByEmail(email),
    enabled: enabled && !!email,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: { email: string; password: string }) =>
      UserService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: 'Success',
        message: 'User created successfully.',
        color: 'green',
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error || 'Failed to create user.';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: Partial<{ email: string; password: string }> }) =>
      UserService.updateUser(id, userData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      notifications.show({
        title: 'Success',
        message: 'User updated successfully.',
        color: 'green',
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error || 'Failed to update user.';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => UserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: 'Success',
        message: 'User deleted successfully.',
        color: 'green',
      });
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.error || 'Failed to delete user.';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    },
  });
}
