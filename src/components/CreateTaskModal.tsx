import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Calendar as CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useTaskStore } from '@/store/taskStore';
import { CreateTaskData } from '@/types/task';

const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  assignee_id: z.string().min(1, 'Please select an assignee'),
  due_date: z.date({ required_error: 'Please select a due date' }),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  children?: React.ReactNode;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const { addTask, users, searchUsers, isLoading } = useTaskStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
  });

  const watchedAssigneeId = watch('assignee_id');
  const watchedDueDate = watch('due_date');

  const filteredUsers = searchUsers(userSearch);
  const selectedUser = users.find(u => u.id === watchedAssigneeId);

  const onSubmit = async (data: CreateTaskForm) => {
    try {
      await addTask(data as CreateTaskData);
      setOpen(false);
      reset();
      setUserSearch('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
    setUserSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter task title..."
              className={errors.title ? 'border-destructive' : ''}
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
              {...register('description')}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority *</Label>
            <Select onValueChange={(value) => setValue('priority', value as CreateTaskForm['priority'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    Low
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning"></div>
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                    High
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-destructive">{errors.priority.message}</p>
            )}
          </div>

          {/* Assignee with Search */}
          <div className="space-y-2">
            <Label>Assignee *</Label>
            <div className="space-y-2">
              <Input
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              
              <div className="max-h-32 overflow-y-auto border rounded-md">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-accent ${
                      watchedAssigneeId === user.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setValue('assignee_id', user.id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      <AvatarFallback className="text-xs">
                        {user.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedUser && (
                <div className="flex items-center gap-2 p-2 bg-accent rounded-md">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedUser.avatar_url} alt={selectedUser.full_name} />
                    <AvatarFallback className="text-xs">
                      {selectedUser.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Selected: {selectedUser.full_name}</span>
                </div>
              )}
            </div>
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
                    !watchedDueDate && 'text-muted-foreground'
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watchedDueDate ? format(watchedDueDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watchedDueDate}
                  onSelect={(date) => setValue('due_date', date!)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.due_date && (
              <p className="text-sm text-destructive">{errors.due_date.message}</p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attachment</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-muted-foreground transition-colors">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images up to 5MB
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;