import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateTaskAsync, fetchUsersAsync } from "@/store/slices/taskSlice";
import { Task } from "@/types/task";
import { toast } from "sonner";

const editTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assignee_id: z.number().min(1, "Please select an assignee"),
  due_date: z.date({ required_error: "Please select a due date" }),
});

type EditTaskForm = z.infer<typeof editTaskSchema>;

interface EditTaskModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  open,
  onOpenChange,
}) => {
  const [userSearch, setUserSearch] = useState("");

  const dispatch = useAppDispatch();
  const { users, isLoading, usersLoading } = useAppSelector((state) => state.tasks);

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditTaskForm>({
    resolver: zodResolver(editTaskSchema),
  });

  const watchedAssigneeId = watch("assignee_id");
  const watchedDueDate = watch("due_date");
  const watchedStatus = watch("status");
  const watchedPriority = watch("priority");

  const selectedUser = users.find((u) => u.id === watchedAssigneeId);

  // Fetch users when modal opens
  useEffect(() => {
    if (open && users.length === 0 && !usersLoading) {
      dispatch(fetchUsersAsync());
    }
  }, [open, users.length, usersLoading, dispatch]);

  // Pre-fill form with task data when modal opens
  useEffect(() => {
    if (open && task) {
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee_id,
        due_date: new Date(task.due_date),
      });
      setUserSearch("");
    }
  }, [open, task, reset]);

  const onSubmit = async (data: EditTaskForm) => {
    try {
      await dispatch(
        updateTaskAsync({
          id: task.id,
          updates: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            assignee_id: data.assignee_id,
            due_date: data.due_date,
          },
        })
      ).unwrap();
      toast.success("Task updated successfully!");
      onOpenChange(false);
      setUserSearch("");
    } catch (error: any) {
      console.error("Failed to update task:", error);
      toast.error(error.message || "Failed to update task");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setUserSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter task title..."
              className={errors.title ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter task description..."
              className="min-h-[80px]"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value as any)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span>To Do</span>
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>In Progress</span>
                  </div>
                </SelectItem>
                <SelectItem value="done">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Done</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority *</Label>
            <Select
              value={watchedPriority}
              onValueChange={(value) => setValue("priority", value as any)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.priority ? "border-destructive" : ""}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Low Priority</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Medium Priority</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>High Priority</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-destructive">{errors.priority.message}</p>
            )}
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label>Assignee *</Label>
            {usersLoading ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading users...</span>
              </div>
            ) : (
              <Select
                value={watchedAssigneeId?.toString()}
                onValueChange={(value) => setValue("assignee_id", parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.assignee_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select assignee">
                    {selectedUser && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="" alt={selectedUser.full_name} />
                          <AvatarFallback className="text-xs">
                            {selectedUser.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedUser.full_name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="" alt={user.full_name} />
                            <AvatarFallback className="text-xs">
                              {user.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm">{user.full_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      {userSearch ? "No users found" : "No users available"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
            {errors.assignee_id && (
              <p className="text-sm text-destructive">{errors.assignee_id.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !watchedDueDate ? "text-muted-foreground" : ""
                  } ${errors.due_date ? "border-destructive" : ""}`}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedDueDate ? (
                    format(watchedDueDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watchedDueDate}
                  onSelect={(date) => setValue("due_date", date!)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.due_date && (
              <p className="text-sm text-destructive">{errors.due_date.message}</p>
            )}
          </div>

          {/* Attachment Upload */}
          <div className="space-y-2">
            <Label>Attachment (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop files here, or click to browse
              </p>
              <Button type="button" variant="outline" size="sm" disabled={isLoading}>
                Choose File
              </Button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || usersLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              ) : (
                "Update Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal; 