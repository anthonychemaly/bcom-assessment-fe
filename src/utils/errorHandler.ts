import { AxiosError } from 'axios';

export interface ApiError {
  error: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;
    
    // Network errors
    if (error.code === 'ERR_NETWORK') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
    // API errors
    if (apiError?.error) {
      return apiError.error;
    }
    
    // HTTP status errors
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof AxiosError && error.code === 'ERR_NETWORK';
}

export function isAuthError(error: unknown): boolean {
  return error instanceof AxiosError && 
    (error.response?.status === 401 || error.response?.status === 403);
}
