import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, DecodedToken, LoginCredentials } from '../types/auth';
import { AuthService } from '../network';

interface RegisterCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = AuthService.getStoredUser();
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          setUser(storedUser);
          
          // Decode JWT to get role
          try {
            const decoded = jwtDecode<DecodedToken>(accessToken);
            setUserRole(decoded.role);
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        AuthService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const authData = await AuthService.login(credentials);
      
      // Store auth data
      AuthService.storeAuthData(authData);
      
      // Update state synchronously
      setUser(authData.user);
      
      // Decode token to get role
      try {
        const decoded = jwtDecode<DecodedToken>(authData.accessToken);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      
      // Navigation will be handled by LoginPage's useEffect
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const authData = await AuthService.register(credentials);
      
      // Store auth data
      AuthService.storeAuthData(authData);
      
      // Update state synchronously
      setUser(authData.user);
      
      // Decode token to get role
      try {
        const decoded = jwtDecode<DecodedToken>(authData.accessToken);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      
      // Navigation will be handled by RegisterPage's useEffect
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Get refresh token before clearing
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Clear state FIRST (synchronously)
    setUser(null);
    setUserRole(null);
    
    // Clear localStorage
    AuthService.clearAuthData();
    
    // Make API call in background (don't wait for it)
    if (refreshToken) {
      AuthService.logout(refreshToken).catch((error) => {
        console.error('Logout API error:', error);
      });
    }
    
    // Don't navigate here - let the caller handle navigation
  };

  const refreshUserData = () => {
    const storedUser = AuthService.getStoredUser();
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
      setUser(storedUser);
      
      try {
        const decoded = jwtDecode<DecodedToken>(accessToken);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
