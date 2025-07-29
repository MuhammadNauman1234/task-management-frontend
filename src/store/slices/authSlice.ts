import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthState,
} from "@/types/task";
import authService from "@/services/authService";
import { setToken, removeToken, getToken } from "@/lib/api";

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Store token in localStorage
      setToken(response.token);
      
      return {
        user: {
          id: response.user.id, // Keep as number from backend
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        } as AuthUser,
        token: response.token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed. Please try again.");
    }
  }
);

export const registerAsync = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register({
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
        name: credentials.full_name, // Map full_name to name for backend
      });
      
      // Store token in localStorage
      setToken(response.token);
      
      return {
        user: {
          id: response.user.id, // Keep as number from backend
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        } as AuthUser,
        token: response.token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed. Please try again.");
    }
  }
);

export const verifyAuthAsync = createAsyncThunk(
  "auth/verifyAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No token found");
      }

      const response = await authService.verifyAuth();
      
      return {
        user: {
          id: response.user.id, // Keep as number from backend
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        } as AuthUser,
        token,
      };
    } catch (error: any) {
      // Remove invalid token
      removeToken();
      return rejectWithValue(error.message || "Authentication verification failed.");
    }
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      removeToken();
    } catch (error: any) {
      // Even if server logout fails, we should still clear local state
      removeToken();
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      removeToken();
    },
    clearError: (state) => {
      state.error = null;
    },
    checkAuth: (state) => {
      const token = getToken();
      if (token && state.user) {
        state.isAuthenticated = true;
        state.token = token;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginAsync.fulfilled,
        (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerAsync.fulfilled,
        (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify Auth
    builder
      .addCase(verifyAuthAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        verifyAuthAsync.fulfilled,
        (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(verifyAuthAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // Don't set error state for "No token found" - this is expected when user isn't logged in
        const errorMessage = action.payload as string;
        if (errorMessage !== "No token found") {
          state.error = errorMessage;
        }
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, checkAuth } = authSlice.actions;
export default authSlice.reducer;
