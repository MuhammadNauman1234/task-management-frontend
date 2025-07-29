import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TaskCard from './TaskCard';
import { Task } from '@/types/task';

interface KanbanColumnProps {
  status: Task['status'];
  tasks: Task[];
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (id: string) => void;
}

const getColumnConfig = (status: Task['status']) => {
  switch (status) {
    case 'todo':
      return {
        title: 'To Do',
        badgeClass: 'bg-todo text-todo-foreground',
        borderClass: 'border-todo/20',
      };
    case 'in_progress':
      return {
        title: 'In Progress',
        badgeClass: 'bg-in-progress text-in-progress-foreground',
        borderClass: 'border-in-progress/20',
      };
    case 'done':
      return {
        title: 'Done',
        badgeClass: 'bg-done text-done-foreground',
        borderClass: 'border-done/20',
      };
  }
};

const KanbanColumn = React.memo(({ status, tasks, onTaskEdit, onTaskDelete }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const config = getColumnConfig(status);

  return (
    <div className="flex-1 min-w-0">
      <Card 
        className={`h-full transition-all duration-200 ${
          isOver ? `ring-2 ${config.borderClass} shadow-lg` : ''
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-card-foreground">
              {config.title}
            </CardTitle>
            <Badge className={`text-xs ${config.badgeClass}`}>
              {tasks.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <div
            ref={setNodeRef}
            className="space-y-3 min-h-[200px]"
          >
            <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onTaskEdit}
                  onDelete={onTaskDelete}
                />
              ))}
            </SortableContext>
            
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Drop tasks here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;