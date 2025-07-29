export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee_id: string;
  assignee?: User;
  due_date: Date;
  attachment_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: Date;
}

export interface TaskFilter {
  search: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignee_id?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: Task['priority'];
  assignee_id: string;
  due_date: Date;
  attachment?: File;
}