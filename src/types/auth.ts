export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface DecodedToken {
  role: string;
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

export interface ApiError {
  error: string;
}
