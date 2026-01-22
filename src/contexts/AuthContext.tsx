import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { User, DecodedToken, LoginCredentials } from '../types/auth';
import { AuthService } from '../network';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
      const authData = await AuthService.login(credentials);
      
      // Store auth data
      AuthService.storeAuthData(authData);
      
      // Update state
      setUser(authData.user);
      
      // Decode token to get role
      try {
        const decoded = jwtDecode<DecodedToken>(authData.accessToken);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    
    // Clear state
    setUser(null);
    setUserRole(null);
    
    // Clear localStorage
    AuthService.clearAuthData();
    
    // Navigate to login
    navigate('/login');
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
