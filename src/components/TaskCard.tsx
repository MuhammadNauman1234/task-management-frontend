import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/types/task";
import { Clock, Paperclip, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import EditTaskModal from "@/components/EditTaskModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string | number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: Task["priority"]) => {
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
  };

  const getPriorityDot = (priority: Task["priority"]) => {
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
  };

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== "done";

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(task.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md
          ${isDragging ? "opacity-50 rotate-2 shadow-xl" : ""}
          ${isOverdue ? "border-l-4 border-l-red-500" : ""}
        `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight mb-1 truncate">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
            </div>
            
            {/* Three-dots menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="cursor-pointer"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Priority Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs font-medium ${getPriorityColor(task.priority)}`}
            >
              <div className={`w-2 h-2 rounded-full mr-1 ${getPriorityDot(task.priority)}`} />
              {task.priority}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Due Date */}
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            <span>Due {format(new Date(task.due_date), "MMM dd, yyyy")}</span>
          </div>

          {/* Attachment */}
          {task.attachment_url && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Paperclip className="w-3 h-3 mr-1" />
              <span>Has attachment</span>
            </div>
          )}

          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Assigned to:</span>
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" alt={task.assignee.full_name} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate max-w-[100px]">
                  {task.assignee.full_name}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        taskTitle={task.title}
      />
    </>
  );
};

export default TaskCard;