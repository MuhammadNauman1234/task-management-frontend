import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import KanbanBoard from "@/components/KanbanBoard";
import TaskFilters from "@/components/TaskFilters";
import CreateTaskModal from "@/components/CreateTaskModal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logoutAsync } from "@/store/slices/authSlice";
import { fetchUsersAsync } from "@/store/slices/taskSlice";
import {
  CheckSquare,
  Clock,
  Users,
  AlertTriangle,
  LogOut,
  Settings,
  User,
} from "lucide-react";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);

  // Load users on component mount (tasks will be loaded by TaskFilters component)
  useEffect(() => {
    dispatch(fetchUsersAsync());
  }, [dispatch]);

  const stats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const overdue = tasks.filter(
      (t) => new Date(t.due_date) < new Date() && t.status !== "done"
    ).length;

    return { total, completed, inProgress, overdue };
  }, [tasks]);

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  return (
    <div className="min-h-screen bg-brand-gradient">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text-primary">
              Task Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Manage your tasks efficiently
              with our kanban board
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CreateTaskModal />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback>
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover-standard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
              <div className="w-8 h-8 icon-gradient-primary rounded-lg flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {isLoading ? "..." : stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                All filtered tasks
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover-standard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <div className="w-8 h-8 icon-gradient-secondary rounded-lg flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? "..." : stats.completed}
              </div>
              <p className="text-xs text-muted-foreground">Tasks completed</p>
            </CardContent>
          </Card>

          <Card className="card-hover-standard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
              <div className="w-8 h-8 icon-gradient-accent rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? "..." : stats.inProgress}
              </div>
              <p className="text-xs text-muted-foreground">
                Tasks being worked on
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover-standard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overdue
              </CardTitle>
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {isLoading ? "..." : stats.overdue}
              </div>
              <p className="text-xs text-muted-foreground">
                Tasks past due date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card-hover-subtle">
          <CardHeader>
            <CardTitle>Filter Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskFilters />
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <Card className="card-hover-subtle min-h-[600px]">
          <CardHeader>
            <CardTitle>Task Board</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <KanbanBoard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
