import React, { useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setFilter, fetchTasksAsync } from "@/store/slices/taskSlice";
import { TaskFilter } from "@/types/task";

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const TaskFilters = React.memo(() => {
  const dispatch = useAppDispatch();
  const { filter, users, isLoading } = useAppSelector((state) => state.tasks);
  
  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(filter.search, 300);

  // Fetch tasks when filters change
  useEffect(() => {
    const filters = {
      ...(filter.status && { status: filter.status }),
      ...(filter.priority && { priority: filter.priority }),
      ...(filter.assignee_id && { assignee_id: filter.assignee_id }),
      ...(debouncedSearch && { search: debouncedSearch }),
    };

    dispatch(fetchTasksAsync(filters));
  }, [dispatch, filter.status, filter.priority, filter.assignee_id, debouncedSearch]);

  const clearFilters = useCallback(() => {
    dispatch(
      setFilter({
        search: "",
        status: undefined,
        priority: undefined,
        assignee_id: undefined,
      })
    );
  }, [dispatch]);

  const hasActiveFilters =
    filter.status || filter.priority || filter.assignee_id;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks by title or description..."
          value={filter.search}
          onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
          className="pl-10"
          disabled={isLoading}
        />
        {debouncedSearch !== filter.search && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <Select
          value={filter.status || "all"}
          onValueChange={(value) =>
            dispatch(
              setFilter({
                status:
                  value === "all" ? undefined : (value as TaskFilter["status"]),
              })
            )
          }
          disabled={isLoading}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filter.priority || "all"}
          onValueChange={(value) =>
            dispatch(
              setFilter({
                priority:
                  value === "all"
                    ? undefined
                    : (value as TaskFilter["priority"]),
              })
            )
          }
          disabled={isLoading}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        <Select
          value={filter.assignee_id ? filter.assignee_id.toString() : "all"}
          onValueChange={(value) =>
            dispatch(
              setFilter({ 
                assignee_id: value === "all" ? undefined : parseInt(value) 
              })
            )
          }
          disabled={isLoading}
        >
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
            disabled={isLoading}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filter.status && (
            <Badge variant="secondary" className="text-xs">
              Status: {filter.status.replace("_", " ")}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => dispatch(setFilter({ status: undefined }))}
                disabled={isLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filter.priority && (
            <Badge variant="secondary" className="text-xs">
              Priority: {filter.priority}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => dispatch(setFilter({ priority: undefined }))}
                disabled={isLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filter.assignee_id && (
            <Badge variant="secondary" className="text-xs">
              Assignee:{" "}
              {users.find((u) => u.id === filter.assignee_id)?.full_name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => dispatch(setFilter({ assignee_id: undefined }))}
                disabled={isLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
          <span className="text-sm text-muted-foreground">Loading tasks...</span>
        </div>
      )}
    </div>
  );
});

TaskFilters.displayName = "TaskFilters";

export default TaskFilters;
