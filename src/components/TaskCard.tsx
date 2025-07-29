import React, { useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, User, MoreVertical, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/types/task";
import EditTaskModal from "./EditTaskModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: number) => void;
}

const TaskCard = React.memo<TaskCardProps>(({ task, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Memoize event handlers to prevent unnecessary re-renders
  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    onDelete(task.id);
    setIsDeleteModalOpen(false);
  }, [onDelete, task.id]);

  const getPriorityColor = useCallback((priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  const getPriorityDot = useCallback((priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  }, []);

  // Memoize computed values
  const priorityColorClass = React.useMemo(() => getPriorityColor(task.priority), [getPriorityColor, task.priority]);
  const priorityDotClass = React.useMemo(() => getPriorityDot(task.priority), [getPriorityDot, task.priority]);
  const formattedDueDate = React.useMemo(() => 
    task.due_date ? format(task.due_date, "MMM dd, yyyy") : null, 
    [task.due_date]
  );
  const assigneeInitials = React.useMemo(() => 
    task.assignee?.full_name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "?", 
    [task.assignee?.full_name]
  );

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-500 ${
          isDragging ? "opacity-50 scale-105 shadow-lg" : ""
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs ${priorityColorClass}`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${priorityDotClass}`} />
              {task.priority}
            </Badge>
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {assigneeInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {formattedDueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formattedDueDate}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{format(task.created_at, "MMM dd")}</span>
          </div>
        </CardContent>
      </Card>

      <EditTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={handleEditModalClose}
      />

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        taskTitle={task.title}
      />
    </>
  );
});

TaskCard.displayName = "TaskCard";

export default TaskCard;