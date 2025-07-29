import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TaskCard from "./TaskCard";
import { Task } from "@/types/task";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onDelete: (taskId: number) => void;
}

const KanbanColumn = React.memo<KanbanColumnProps>(({ id, title, tasks, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  // Memoize status color function
  const getStatusColor = React.useCallback((status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "done":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  // Memoize status color class
  const statusColorClass = React.useMemo(() => getStatusColor(id as Task["status"]), [getStatusColor, id]);

  return (
    <Card 
      ref={setNodeRef}
      className={`h-full transition-colors duration-200 ${
        isOver ? "ring-2 ring-primary/50 bg-primary/5" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge className={`text-xs ${statusColorClass}`}>
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3 min-h-[200px]">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDelete={onDelete}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">No tasks in this column</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

KanbanColumn.displayName = "KanbanColumn";

export default KanbanColumn;