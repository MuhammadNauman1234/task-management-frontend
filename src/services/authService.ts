import api, { ApiResponse } from '@/lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string; // Backend expects 'name' field
}

export interface AuthUser {
  id: number; // Backend returns number, not string
  email: string;
  name: string; // Backend returns 'name' instead of 'full_name'
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      email: credentials.email,
      password: credentials.password,
      confirmPassword: credentials.confirmPassword,
      name: credentials.name,
    });
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await api.post<ApiResponse>('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, we should remove the token locally
      console.error('Logout failed:', error);
    }
  }

  async verifyAuth(): Promise<{ user: AuthUser }> {
    const response = await api.get<ApiResponse<{ user: AuthUser }>>('/auth/verify');
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Auth verification failed');
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Token refresh failed');
  }
}

export default new AuthService(); 