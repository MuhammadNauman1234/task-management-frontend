import api, { ApiResponse } from '@/lib/api';

export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

// Users response without pagination
export interface UsersResponse {
  users: User[];
}

export interface SearchUsersResponse extends UsersResponse {
  searchQuery: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    usersPerPage: number;
  };
}

class UserService {
  async getUsers(): Promise<UsersResponse> {
    const response = await api.get<ApiResponse<UsersResponse>>('/users');
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch users');
  }

  async searchUsers(query: string, page: number = 1, limit: number = 100): Promise<SearchUsersResponse> {
    const response = await api.get<ApiResponse<SearchUsersResponse>>(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to search users');
  }

  async getUserById(id: string | number): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch user');
  }

  // Get all users without pagination (for dropdowns/selects)
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.getUsers();
      return response.users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }
}

export default new UserService(); 