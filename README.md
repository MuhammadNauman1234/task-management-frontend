# Sprint Board Hub - Frontend

A modern React-based task management frontend with Kanban board interface, real-time filtering, and comprehensive task management capabilities.

## 🚀 **Features**

### **Core Functionality**
- ✅ **Kanban Board Interface** - Drag & drop tasks between columns (To Do, In Progress, Done)
- ✅ **Real-time Filtering** - Filter by status, priority, assignee with debounced search
- ✅ **Task Management** - Create, edit, delete tasks with full validation
- ✅ **User Authentication** - JWT-based login/register with token persistence
- ✅ **Responsive Design** - Mobile-friendly interface with Tailwind CSS
- ✅ **Task Actions** - Edit and delete via dropdown menus on task cards

### **User Experience**
- ✅ **Loading States** - Visual feedback during API operations
- ✅ **Toast Notifications** - Success and error notifications with Sonner
- ✅ **Dashboard Statistics** - Real-time task counts and overdue indicators
- ✅ **Filter Persistence** - Maintains filters during task operations
- ✅ **Debounced Search** - 300ms delay to prevent excessive API calls

## 🏗️ **Tech Stack**

### **Core Technologies**
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Full type safety and IntelliSense support
- **Vite** - Fast development server and optimized builds
- **Redux Toolkit** - State management with Redux Persist

### **UI & Styling**
- **shadcn/ui** - High-quality accessible components built on Radix UI
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful SVG icons
- **@dnd-kit** - Drag and drop functionality for Kanban board

### **Form & Validation**
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod integration with React Hook Form

### **HTTP & API**
- **Axios** - HTTP client with interceptors for JWT handling
- **React Query** - Server state management (configured but not actively used)

### **Routing & Navigation**
- **React Router DOM** - Client-side routing with protected routes

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### **Installation Steps**

1. **Clone and navigate to the project**
   ```bash
   cd sprint-board-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your backend API URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🔧 **Available Scripts**

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run type-check   # TypeScript type checking
npm run lint         # ESLint code linting
npm run lint:fix     # Auto-fix linting issues

# Maintenance
npm run clean        # Clean build artifacts and cache
npm run update-deps  # Update dependencies and fix security issues
```

## 🏛️ **Project Structure**

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── ui/              # shadcn/ui components
│   ├── CreateTaskModal.tsx
│   ├── EditTaskModal.tsx
│   ├── DeleteConfirmationModal.tsx
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   ├── TaskCard.tsx
│   └── TaskFilters.tsx
├── hooks/               # Custom React hooks
│   ├── redux.ts         # Typed Redux hooks
│   └── use-mobile.tsx   # Mobile detection hook
├── lib/                 # Utility functions
│   ├── api.ts           # Axios configuration
│   └── utils.ts         # General utilities
├── pages/               # Page components
│   ├── AuthPage.tsx     # Login/Register page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Index.tsx        # Landing page
│   └── NotFound.tsx     # 404 page
├── services/            # API service layer
│   ├── authService.ts   # Authentication API calls
│   ├── taskService.ts   # Task management API calls
│   └── userService.ts   # User management API calls
├── store/               # Redux store
│   ├── index.ts         # Store configuration
│   ├── selectors.ts     # Redux selectors
│   └── slices/          # Redux slices
│       ├── authSlice.ts # Authentication state
│       └── taskSlice.ts # Task management state
├── types/               # TypeScript type definitions
│   └── task.ts          # Task and user types
└── main.tsx             # Application entry point
```

## 🔧 **Environment Variables**

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
```

## 🎯 **Key Components**

### **Dashboard (`src/pages/Dashboard.tsx`)**
- Main application page with Kanban board
- Statistics cards showing task counts
- Filter panel for real-time task filtering
- User profile dropdown with logout functionality

### **KanbanBoard (`src/components/KanbanBoard.tsx`)**
- Three-column layout (To Do, In Progress, Done)
- Drag & drop functionality using @dnd-kit
- Real-time task updates and filter maintenance

### **TaskFilters (`src/components/TaskFilters.tsx`)**
- Search input with 300ms debounce
- Status, priority, and assignee dropdown filters
- Active filter badges with individual clear options
- Loading states during API operations

### **Task Modals**
- **CreateTaskModal** - Form for creating new tasks
- **EditTaskModal** - Pre-populated form for editing existing tasks
- **DeleteConfirmationModal** - Safety confirmation for deletions

## 🔒 **Authentication Flow**

1. **Protected Routes** - `ProtectedRoute` component guards authenticated pages
2. **Token Management** - JWT tokens stored in localStorage with Redux Persist
3. **Auto-refresh** - Axios interceptors handle token attachment and errors
4. **Navigation** - Automatic redirection based on authentication state

## 🔄 **State Management**

### **Redux Store Structure**
```typescript
{
  auth: {
    user: AuthUser | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  tasks: {
    tasks: Task[],
    users: User[],
    filter: TaskFilter,
    isLoading: boolean,
    error: string | null,
    usersLoading: boolean
  }
}
```

### **Key Redux Slices**
- **authSlice** - User authentication state and async actions
- **taskSlice** - Task management, filtering, and user data

## 🎨 **UI Components**

Built with **shadcn/ui** components for consistent, accessible design:

- **Buttons** - Various styles and sizes
- **Forms** - Input, textarea, select with validation
- **Modals** - Dialog components for task operations
- **Cards** - Dashboard statistics and task containers
- **Dropdowns** - User profile and task action menus
- **Toasts** - Success and error notifications

## 🚀 **Performance Features**

### **Optimization Techniques**
- ✅ **Debounced Search** - Prevents excessive API calls
- ✅ **Memoized Components** - React.memo for expensive renders
- ✅ **Efficient State Updates** - Normalized Redux state
- ✅ **Code Splitting** - Lazy loading with React Router
- ✅ **Optimized Builds** - Vite's fast bundling and tree shaking

### **Loading & UX**
- ✅ **Loading Spinners** - During API calls and debounce periods
- ✅ **Disabled States** - Form controls during processing
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Responsive Design** - Mobile-first approach

## 🧪 **Development Workflow**

### **Type Safety**
- Full TypeScript integration with strict mode
- Zod schemas for runtime validation
- Typed Redux hooks and selectors

### **Code Quality**
- ESLint configuration with React rules
- Prettier formatting (configured via ESLint)
- TypeScript strict mode enabled

### **Development Tools**
- Vite dev server with hot module replacement
- React Developer Tools support
- Redux DevTools integration

## 📚 **Key Dependencies**

### **Core Libraries**
```json
{
  "@reduxjs/toolkit": "^2.8.2",
  "@dnd-kit/core": "^6.3.1",
  "axios": "^1.11.0",
  "react": "^18.3.1",
  "react-hook-form": "^7.53.0",
  "react-router-dom": "^6.26.2",
  "zod": "^3.23.8"
}
```

### **UI & Styling**
```json
{
  "tailwindcss": "^3.4.11",
  "lucide-react": "^0.462.0",
  "@radix-ui/react-dialog": "^1.1.2",
  "sonner": "^1.5.0"
}
```

## 🔗 **API Integration**

The frontend integrates with the backend API for:

- **Authentication** - Login, register, token verification
- **Task Management** - CRUD operations with filtering
- **User Management** - User listing for task assignment
- **File Upload** - Task attachment handling

All API calls are handled through the service layer with proper error handling and loading states.

## 🚧 **Future Enhancements**

- 📅 **Calendar View** - Alternative task visualization
- 🔔 **Real-time Updates** - WebSocket integration
- 📊 **Advanced Analytics** - Task completion metrics
- 🏷️ **Task Labels** - Additional categorization
- 💬 **Comments** - Task collaboration features
- 🌐 **Internationalization** - Multi-language support

## 📄 **License**

This project is part of the Sprint Board Hub task management system. 