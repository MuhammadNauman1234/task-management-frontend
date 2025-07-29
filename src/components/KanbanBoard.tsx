import React, { useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateTaskAsync, deleteTaskAsync, fetchTasksAsync, updateTaskStatusOptimistic, revertTaskStatusOptimistic } from "@/store/slices/taskSlice";
import { Task } from "@/types/task";
import { toast } from "sonner";

const KanbanBoard = () => {
  const dispatch = useAppDispatch();
  const { tasks, filter } = useAppSelector((state) => state.tasks);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === "todo"),
      "in_progress": tasks.filter((task) => task.status === "in_progress"),
      done: tasks.filter((task) => task.status === "done"),
    };
  }, [tasks]);

  const columns = [
    {
      id: "todo",
      title: "To Do",
      tasks: groupedTasks.todo,
    },
    {
      id: "in_progress", 
      title: "In Progress",
      tasks: groupedTasks.in_progress,
    },
    {
      id: "done",
      title: "Done", 
      tasks: groupedTasks.done,
    },
  ] as const;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id.toString() === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id as Task["status"];
    
    // Validate that newStatus is a valid status value
    const validStatuses: Task["status"][] = ['todo', 'in_progress', 'done'];
    if (!validStatuses.includes(newStatus)) {
      console.error('❌ Invalid status value:', newStatus);
      toast.error(`Invalid status: ${newStatus}`);
      return;
    }
    
    const task = tasks.find((t) => t.id.toString() === taskId);
    if (!task || task.status === newStatus) return;

    const originalStatus = task.status;

    // 1. Immediately update the UI (optimistic update)
    dispatch(updateTaskStatusOptimistic({ taskId, status: newStatus }));

    try {
      // 2. Make the API call in the background
      await dispatch(updateTaskAsync({ 
        id: taskId, 
        updates: { status: newStatus } 
      })).unwrap();
      
      // 3. Show success message
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
      
    } catch (error: any) {
      // 4. Revert the optimistic update on failure
      console.error('❌ Task update failed:', error);
      dispatch(revertTaskStatusOptimistic({ taskId, originalStatus }));
      toast.error(error.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await dispatch(deleteTaskAsync(taskId)).unwrap();
      toast.success("Task deleted successfully");
      
      // Refresh tasks with current filters after deletion
      const currentFilters = {
        ...(filter.status && { status: filter.status }),
        ...(filter.priority && { priority: filter.priority }),
        ...(filter.assignee_id && { assignee_id: filter.assignee_id }),
        ...(filter.search && { search: filter.search }),
      };
      dispatch(fetchTasksAsync(currentFilters));
      
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map((column) => (
          <SortableContext
            key={column.id}
            items={column.tasks.map((task) => task.id.toString())}
          >
            <KanbanColumn
              id={column.id}
              title={column.title}
              tasks={column.tasks}
              onDelete={handleDeleteTask}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard 
            task={activeTask} 
            onDelete={handleDeleteTask}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
