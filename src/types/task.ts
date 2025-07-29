import type { User as ServiceUser } from '@/services/userService';
import type { AuthUser as ServiceAuthUser, LoginCredentials, RegisterCredentials } from '@/services/authService';

// Re-export types from services for convenience
export type AuthUser = ServiceAuthUser;
export type User = ServiceUser;
export { LoginCredentials, RegisterCredentials };

// Backend API data types (what the API sends/receives)
export interface BackendTask {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id: number;
  assignee?: User;
  due_date: string; // ISO string from backend
  attachment_url?: string;
  created_at: string; // ISO string from backend
  updated_at: string; // ISO string from backend
}

// Frontend task interface with Date objects for better UX
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id: number;
  assignee?: User;
  due_date: Date; // Date object for frontend
  attachment_url?: string;
  created_at: Date; // Date object for frontend
  updated_at: Date; // Date object for frontend
}

// Task creation data for API
export interface CreateTaskData {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee_id: number;
  due_date: string; // ISO string for API
}

// Form data for creating tasks with Date objects
export interface CreateTaskFormData {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  assignee_id: number;
  due_date: Date; // Date object for forms
  attachment?: File;
}

// Update task data for API
export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee_id?: number;
  due_date?: string; // ISO string for API
}

// Task filters
export interface TaskFilters {
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee_id?: number;
  search?: string;
}

// Frontend-specific filter type
export interface TaskFilter {
  search: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  assignee_id?: number;
}

// Auth state
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
