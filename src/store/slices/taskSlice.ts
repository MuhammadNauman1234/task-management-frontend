import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Task, User, TaskFilter, CreateTaskFormData } from "@/types/task";
import taskService, { TaskFilters } from "@/services/taskService";
import userService from "@/services/userService";

interface TaskState {
  tasks: Task[];
  users: User[];
  filter: TaskFilter;
  isLoading: boolean;
  error: string | null;
  usersLoading: boolean;
}

const initialState: TaskState = {
  tasks: [],
  users: [],
  filter: {
    search: "",
  },
  isLoading: false,
  error: null,
  usersLoading: false,
};

// Async thunks for tasks
export const fetchTasksAsync = createAsyncThunk(
  "tasks/fetchTasks",
  async (filters: TaskFilters = {}, { rejectWithValue }) => {
    try {
      const tasks = await taskService.getTasks(filters);
      // Convert date strings to Date objects for frontend compatibility
      return tasks.map(task => ({
        ...task,
        due_date: new Date(task.due_date),
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      }));
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch tasks");
    }
  }
);

export const addTaskAsync = createAsyncThunk(
  "tasks/addTask",
  async (taskData: CreateTaskFormData, { rejectWithValue }) => {
    try {
      const apiTaskData = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        assignee_id: taskData.assignee_id,
        due_date: taskData.due_date.toISOString(),
      };

      const task = await taskService.createTask(apiTaskData);
      
      // Convert date strings to Date objects
      return {
        ...task,
        due_date: new Date(task.due_date),
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create task");
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  "tasks/updateTask",
  async (
    { id, updates }: { id: string | number; updates: Partial<Task & { due_date?: Date }> },
    { rejectWithValue }
  ) => {
    try {
      const apiUpdates = {
        ...updates,
        due_date: updates.due_date ? updates.due_date.toISOString() : undefined,
      };
      
      const task = await taskService.updateTask(id, apiUpdates);
      
      // Convert date strings to Date objects
      return {
        ...task,
        due_date: new Date(task.due_date),
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update task");
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  "tasks/deleteTask",
  async (id: string | number, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete task");
    }
  }
);

export const moveTaskAsync = createAsyncThunk(
  "tasks/moveTask",
  async (
    { taskId, newStatus }: { taskId: string | number; newStatus: Task["status"] },
    { dispatch }
  ) => {
    return dispatch(
      updateTaskAsync({ id: taskId, updates: { status: newStatus } })
    );
  }
);

export const assignTaskAsync = createAsyncThunk(
  "tasks/assignTask",
  async (
    { taskId, assigneeId }: { taskId: string | number; assigneeId: number },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskService.assignTask(taskId, assigneeId);
      
      // Convert date strings to Date objects
      return {
        ...task,
        due_date: new Date(task.due_date),
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to assign task");
    }
  }
);

export const uploadAttachmentAsync = createAsyncThunk(
  "tasks/uploadAttachment",
  async (
    { taskId, file }: { taskId: string | number; file: File },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskService.uploadAttachment(taskId, file);
      
      // Convert date strings to Date objects
      return {
        ...task,
        due_date: new Date(task.due_date),
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload attachment");
    }
  }
);

// Async thunks for users
export const fetchUsersAsync = createAsyncThunk(
  "tasks/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const users = await userService.getAllUsers();
      // Return users as-is since User type expects created_at as string
      return users;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch users");
    }
  }
);

// Task slice
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUsers: (state) => {
      state.users = [];
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    // Optimistic update for task status change
    updateTaskStatusOptimistic: (state, action: PayloadAction<{ taskId: string | number; status: Task["status"] }>) => {
      const { taskId, status } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id.toString() === taskId.toString());
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = status;
      }
    },
    // Revert optimistic update on API failure
    revertTaskStatusOptimistic: (state, action: PayloadAction<{ taskId: string | number; originalStatus: Task["status"] }>) => {
      const { taskId, originalStatus } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id.toString() === taskId.toString());
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = originalStatus;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch all tasks
    builder
      .addCase(fetchTasksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add task
    builder
      .addCase(addTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.push(action.payload);
      })
      .addCase(addTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update task
    builder
      .addCase(updateTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const taskIndex = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = action.payload;
        }
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete task
    builder
      .addCase(deleteTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Assign task
    builder
      .addCase(assignTaskAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const taskIndex = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = action.payload;
        }
      })
      .addCase(assignTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload attachment
    builder
      .addCase(uploadAttachmentAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAttachmentAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const taskIndex = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = action.payload;
        }
      })
      .addCase(uploadAttachmentAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch users
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  clearUsers, 
  clearTasks, 
  setFilter,
  updateTaskStatusOptimistic,
  revertTaskStatusOptimistic,
} = taskSlice.actions;
export default taskSlice.reducer;
