import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
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

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onDelete,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo":
        return "bg-slate-100 text-slate-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={`w-80 flex-shrink-0 ${isOver ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge 
            variant="secondary" 
            className={`text-xs ${getStatusColor(id as Task["status"])}`}
          >
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div
          ref={setNodeRef}
          className="min-h-[200px] space-y-3"
        >
          <SortableContext
            items={tasks.map((task) => task.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tasks in {title.toLowerCase()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanColumn;