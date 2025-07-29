import React, { useEffect, useCallback, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setFilter, fetchTasksAsync } from "@/store/slices/taskSlice";
import { Task, TaskFilters as TaskFiltersType } from "@/types/task";

// Custom hook for debouncing with cleanup
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedValue;
};

const TaskFilters = React.memo(() => {
  const dispatch = useAppDispatch();
  const { filter, users, isLoading } = useAppSelector((state) => state.tasks);
  
  // Use AbortController for API request cleanup
  const abortControllerRef = useRef<AbortController>();
  
  // Debounce search input
  const debouncedSearch = useDebounce(filter.search, 300);

  // Memoize filter change handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter({ search: e.target.value }));
  }, [dispatch]);

  const handleStatusChange = useCallback((value: string) => {
    const status = value === "all" ? undefined : (value as Task["status"]);
    dispatch(setFilter({ status }));
  }, [dispatch]);

  const handlePriorityChange = useCallback((value: string) => {
    const priority = value === "all" ? undefined : (value as Task["priority"]);
    dispatch(setFilter({ priority }));
  }, [dispatch]);

  const handleAssigneeChange = useCallback((value: string) => {
    const assignee_id = value === "all" ? undefined : parseInt(value);
    dispatch(setFilter({ assignee_id }));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    dispatch(setFilter({ 
      search: "", 
      status: undefined, 
      priority: undefined, 
      assignee_id: undefined 
    }));
  }, [dispatch]);

  // Effect to fetch tasks with current filters (with cleanup)
  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    const filters: TaskFiltersType = {};
    
    if (filter.status) filters.status = filter.status;
    if (filter.priority) filters.priority = filter.priority;
    if (filter.assignee_id) filters.assignee_id = filter.assignee_id;
    if (debouncedSearch) filters.search = debouncedSearch;

    // Dispatch with current AbortController
    const currentController = abortControllerRef.current;
    dispatch(fetchTasksAsync(filters));

    // Cleanup function
    return () => {
      if (currentController) {
        currentController.abort();
      }
    };
  }, [dispatch, filter.status, filter.priority, filter.assignee_id, debouncedSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoize filter status check
  const hasActiveFilters = React.useMemo(() => {
    return filter.status || filter.priority || filter.assignee_id || filter.search.length > 0;
  }, [filter.status, filter.priority, filter.assignee_id, filter.search]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={isLoading}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filter.search}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select 
              value={filter.status || "all"} 
              onValueChange={handleStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select 
              value={filter.priority || "all"} 
              onValueChange={handlePriorityChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Assignee</label>
            <Select 
              value={filter.assignee_id ? filter.assignee_id.toString() : "all"} 
              onValueChange={handleAssigneeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Applying filters...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TaskFilters.displayName = "TaskFilters";

export default TaskFilters;
