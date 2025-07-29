import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { TaskFilter } from '@/types/task';

const TaskFilters = React.memo(() => {
  const { filter, setFilter, users } = useTaskStore();

  const clearFilters = () => {
    setFilter({
      search: '',
      status: undefined,
      priority: undefined,
      assignee_id: undefined,
    });
  };

  const hasActiveFilters = filter.status || filter.priority || filter.assignee_id;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <Select
          value={filter.status || 'all'}
          onValueChange={(value) => setFilter({ status: value === 'all' ? undefined : value as TaskFilter['status'] })}
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
          value={filter.priority || 'all'}
          onValueChange={(value) => setFilter({ priority: value === 'all' ? undefined : value as TaskFilter['priority'] })}
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
          value={filter.assignee_id || 'all'}
          onValueChange={(value) => setFilter({ assignee_id: value === 'all' ? undefined : value })}
        >
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
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
              Status: {filter.status.replace('_', ' ')}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => setFilter({ status: undefined })}
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
                onClick={() => setFilter({ priority: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filter.assignee_id && (
            <Badge variant="secondary" className="text-xs">
              Assignee: {users.find(u => u.id === filter.assignee_id)?.full_name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => setFilter({ assignee_id: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
});

TaskFilters.displayName = 'TaskFilters';

export default TaskFilters;