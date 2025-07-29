import React, { useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Calendar, User, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addTaskAsync, fetchTasksAsync } from "@/store/slices/taskSlice";
import { CreateTaskFormData, TaskFilters } from "@/types/task";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  assignee_id: z.number().min(1, "Please select an assignee"),
  due_date: z.date().optional(),
});

const CreateTaskModal = React.memo(() => {
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const { users, isLoading, filter } = useAppSelector((state) => state.tasks);
  
  // AbortController for cleanup
  const abortControllerRef = useRef<AbortController>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  const watchedDueDate = watch("due_date");

  // Memoized handlers
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  }, [reset]);

  const handlePriorityChange = useCallback((value: string) => {
    setValue("priority", value as "low" | "medium" | "high");
  }, [setValue]);

  const handleAssigneeChange = useCallback((value: string) => {
    setValue("assignee_id", parseInt(value));
  }, [setValue]);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setValue("due_date", date);
  }, [setValue]);

  const onSubmit = useCallback(async (data: CreateTaskFormData) => {
    // Cancel any previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      await dispatch(addTaskAsync(data)).unwrap();
      toast.success("Task created successfully!");
      
      // Refresh tasks with current filters
      const currentFilters: TaskFilters = {};
      if (filter.status) currentFilters.status = filter.status;
      if (filter.priority) currentFilters.priority = filter.priority;
      if (filter.assignee_id) currentFilters.assignee_id = filter.assignee_id;
      if (filter.search) currentFilters.search = filter.search;
      
      dispatch(fetchTasksAsync(currentFilters));
      
      reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to create task:", error);
      toast.error(error.message || "Failed to create task");
    }
  }, [dispatch, filter, reset]);

  // Cleanup on unmount and when modal closes
  useEffect(() => {
    if (!open) {
      // Cancel any pending requests when modal closes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  }, [open]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoize user options
  const userOptions = React.useMemo(() => {
    return users.map((user) => (
      <SelectItem key={user.id} value={user.id.toString()}>
        {user.full_name}
      </SelectItem>
    ));
  }, [users]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-button-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text-primary">Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task for your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Title
            </Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              {...register("title")}
              disabled={isLoading}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter task description..."
              rows={3}
              {...register("description")}
              disabled={isLoading}
            />
          </div>

          {/* Priority and Assignee Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={watch("priority")}
                onValueChange={handlePriorityChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Assignee
              </Label>
              <Select
                value={watch("assignee_id")?.toString() || ""}
                onValueChange={handleAssigneeChange}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.assignee_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions}
                </SelectContent>
              </Select>
              {errors.assignee_id && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.assignee_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date (Optional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watchedDueDate && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {watchedDueDate ? (
                    format(watchedDueDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={watchedDueDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-button-primary"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

CreateTaskModal.displayName = "CreateTaskModal";

export default CreateTaskModal;
