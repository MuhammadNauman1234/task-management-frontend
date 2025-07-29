import { create } from 'zustand';
import { Task, User, TaskFilter, CreateTaskData } from '@/types/task';

interface TaskStore {
  tasks: Task[];
  users: User[];
  filter: TaskFilter;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: CreateTaskData) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: Task['status']) => Promise<void>;
  setFilter: (filter: Partial<TaskFilter>) => void;
  setUsers: (users: User[]) => void;
  searchUsers: (query: string) => User[];
  
  // Computed
  filteredTasks: () => Task[];
  tasksByStatus: () => Record<Task['status'], Task[]>;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    full_name: 'John Doe',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    created_at: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    full_name: 'Jane Smith',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    created_at: new Date('2024-01-01'),
  },
  {
    id: '3',
    email: 'mike.wilson@example.com',
    full_name: 'Mike Wilson',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    created_at: new Date('2024-01-01'),
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new dashboard layout',
    description: 'Create a modern and intuitive dashboard layout for the task management system',
    status: 'in_progress',
    priority: 'high',
    assignee_id: '1',
    assignee: mockUsers[0],
    due_date: new Date('2024-02-15'),
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20'),
  },
  {
    id: '2',
    title: 'Implement authentication system',
    description: 'Set up JWT-based authentication with login and registration',
    status: 'todo',
    priority: 'high',
    assignee_id: '2',
    assignee: mockUsers[1],
    due_date: new Date('2024-02-10'),
    created_at: new Date('2024-01-19'),
    updated_at: new Date('2024-01-19'),
  },
  {
    id: '3',
    title: 'Write unit tests',
    description: 'Add comprehensive unit tests for all components',
    status: 'todo',
    priority: 'medium',
    assignee_id: '3',
    assignee: mockUsers[2],
    due_date: new Date('2024-02-20'),
    created_at: new Date('2024-01-18'),
    updated_at: new Date('2024-01-18'),
  },
  {
    id: '4',
    title: 'Deploy to production',
    description: 'Set up CI/CD pipeline and deploy to production environment',
    status: 'done',
    priority: 'high',
    assignee_id: '1',
    assignee: mockUsers[0],
    due_date: new Date('2024-01-25'),
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-24'),
  },
];

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,
  users: mockUsers,
  filter: {
    search: '',
  },
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),
  
  addTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTask: Task = {
        id: Date.now().toString(),
        ...taskData,
        status: 'todo',
        assignee: get().users.find(u => u.id === taskData.assignee_id),
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      set(state => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create task', isLoading: false });
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                ...updates, 
                updated_at: new Date(),
                assignee: updates.assignee_id ? state.users.find(u => u.id === updates.assignee_id) : task.assignee
              }
            : task
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update task', isLoading: false });
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete task', isLoading: false });
    }
  },

  moveTask: async (taskId, newStatus) => {
    const { updateTask } = get();
    await updateTask(taskId, { status: newStatus });
  },

  setFilter: (newFilter) => 
    set(state => ({ filter: { ...state.filter, ...newFilter } })),

  setUsers: (users) => set({ users }),

  searchUsers: (query) => {
    const { users } = get();
    if (!query.trim()) return users;
    
    return users.filter(user => 
      user.full_name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  },

  filteredTasks: () => {
    const { tasks, filter } = get();
    
    return tasks.filter(task => {
      const matchesSearch = !filter.search || 
        task.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filter.search.toLowerCase());
      
      const matchesStatus = !filter.status || task.status === filter.status;
      const matchesPriority = !filter.priority || task.priority === filter.priority;
      const matchesAssignee = !filter.assignee_id || task.assignee_id === filter.assignee_id;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  },

  tasksByStatus: () => {
    const filteredTasks = get().filteredTasks();
    
    return {
      todo: filteredTasks.filter(task => task.status === 'todo'),
      in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
      done: filteredTasks.filter(task => task.status === 'done'),
    };
  },
}));