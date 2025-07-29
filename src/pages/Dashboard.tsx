import React, { useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  LogOut,
  User
} from "lucide-react";
import KanbanBoard from "@/components/KanbanBoard";
import TaskFilters from "@/components/TaskFilters";
import CreateTaskModal from "@/components/CreateTaskModal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logoutAsync } from "@/store/slices/authSlice";
import { fetchTasksAsync, fetchUsersAsync } from "@/store/slices/taskSlice";
import { toast } from "sonner";

const Dashboard = React.memo(() => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tasks, isLoading } = useAppSelector((state) => state.tasks);
  
  // AbortController for cleanup
  const abortControllerRef = useRef<AbortController>();

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  }, [dispatch]);

  // Effect to fetch initial data with cleanup
  useEffect(() => {
    // Cancel previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(fetchTasksAsync({})).unwrap(),
          dispatch(fetchUsersAsync()).unwrap()
        ]);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Failed to fetch initial data:", error);
        }
      }
    };

    fetchInitialData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized stats calculations
  const stats = React.useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "done").length;
    const inProgressTasks = tasks.filter(task => task.status === "in_progress").length;
    const todoTasks = tasks.filter(task => task.status === "todo").length;
    const highPriorityTasks = tasks.filter(task => task.priority === "high").length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks, 
      todoTasks,
      highPriorityTasks,
      completionRate
    };
  }, [tasks]);

  // Memoized user initials
  const userInitials = React.useMemo(() => {
    return user?.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "U";
  }, [user?.name]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 icon-gradient-primary rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text-primary">
                  Kanban Board Hub
                </h1>
                <p className="text-sm text-muted-foreground">
                  Task Management Dashboard
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name || "User"}! 
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening with your projects today.
              </p>
            </div>
            <CreateTaskModal />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover-enhanced">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active tasks in the system
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover-enhanced">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover-enhanced">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgressTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently being worked on
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover-enhanced">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.highPriorityTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Urgent tasks requiring attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <TaskFilters />

        {/* Kanban Board */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Task Board</h3>
            <Badge variant="outline" className="text-xs">
              {stats.totalTasks} {stats.totalTasks === 1 ? 'task' : 'tasks'}
            </Badge>
          </div>
          <KanbanBoard />
        </div>
      </main>
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
