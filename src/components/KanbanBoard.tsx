import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types/task';

const KanbanBoard = React.memo(() => {
  const { tasksByStatus, moveTask, updateTask } = useTaskStore();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const taskLists = tasksByStatus();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = Object.values(taskLists)
      .flat()
      .find(task => task.id === active.id);
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;
    
    // Handle dropping over a column
    const isOverAColumn = ['todo', 'in_progress', 'done'].includes(overId as string);
    
    if (isOverAColumn) {
      const newStatus = overId as Task['status'];
      const task = Object.values(taskLists)
        .flat()
        .find(task => task.id === activeId);
      
      if (task && task.status !== newStatus) {
        moveTask(task.id, newStatus);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    
    // Handle dropping over a column
    const isOverAColumn = ['todo', 'in_progress', 'done'].includes(overId as string);
    
    if (isOverAColumn) {
      const newStatus = overId as Task['status'];
      const task = Object.values(taskLists)
        .flat()
        .find(task => task.id === activeId);
      
      if (task && task.status !== newStatus) {
        moveTask(task.id, newStatus);
      }
    }
    
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto">
        <KanbanColumn
          status="todo"
          tasks={taskLists.todo}
        />
        <KanbanColumn
          status="in_progress"
          tasks={taskLists.in_progress}
        />
        <KanbanColumn
          status="done"
          tasks={taskLists.done}
        />
      </div>
      
      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 opacity-90">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
});

KanbanBoard.displayName = 'KanbanBoard';

export default KanbanBoard;