import api, { ApiResponse } from '@/lib/api';
import type { User } from '@/services/userService';

// Backend task interface (what API returns)
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id: number;
  assignee?: User;
  due_date: string; // Backend returns ISO string
  attachment_url?: string;
  created_at: string; // Backend returns ISO string
  updated_at: string; // Backend returns ISO string
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: Task['priority'];
  assignee_id: number;
  due_date: string; // ISO string for backend
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignee_id?: number;
  due_date?: string; // ISO string for backend
}

export interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  assignee_id?: number;
  search?: string;
}

// User tasks API response (without pagination)
export interface UserTasksResponse {
  tasks: Task[];
  user: {
    id: number;
    full_name: string;
    email: string;
  };
}

// User tasks filters (without pagination)
export interface UserTasksFilters {
  status?: Task['status'];
  priority?: Task['priority'];
}

class TaskService {
  // Get all tasks with filtering
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignee_id) params.append('assignee_id', filters.assignee_id.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<ApiResponse<Task[]>>(`/tasks?${params.toString()}`);
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch tasks');
  }

  async getTaskById(id: string | number): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch task');
  }

  async createTask(taskData: CreateTaskData): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', taskData);
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create task');
  }

  async updateTask(id: string | number, updates: UpdateTaskData): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, updates);
    
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update task');
  }

  async deleteTask(id: string | number): Promise<void> {
    const response = await api.delete<ApiResponse>(`/tasks/${id}`);
    if (response.data.status !== "success") {
      throw new Error(response.data.message || 'Failed to delete task');
    }
  }

  async assignTask(id: string | number, assignee_id: number): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/assign`, { assignee_id });
    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to assign task');
  }

  async uploadAttachment(id: string | number, file: File): Promise<Task> {
    const formData = new FormData();
    formData.append('attachment', file);

    const response = await api.post<ApiResponse<Task>>(`/tasks/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to upload attachment');
  }
}

export default new TaskService(); 