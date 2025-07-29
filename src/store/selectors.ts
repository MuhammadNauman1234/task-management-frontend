import { RootState } from "./index";
import { User } from "@/types/task";

// Task selectors
export const selectFilteredTasks = (state: RootState) => {
  const { tasks, filter } = state.tasks;

  return tasks.filter((task) => {
    const matchesSearch =
      !filter.search ||
      task.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      task.description?.toLowerCase().includes(filter.search.toLowerCase());

    const matchesStatus = !filter.status || task.status === filter.status;
    const matchesPriority =
      !filter.priority || task.priority === filter.priority;
    const matchesAssignee =
      !filter.assignee_id || task.assignee_id === filter.assignee_id;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });
};

export const selectTasksByStatus = (state: RootState) => {
  const filteredTasks = selectFilteredTasks(state);

  return {
    todo: filteredTasks.filter((task) => task.status === "todo"),
    in_progress: filteredTasks.filter((task) => task.status === "in_progress"),
    done: filteredTasks.filter((task) => task.status === "done"),
  };
};

export const selectUsersSearch = (state: RootState, query: string) => {
  const { users } = state.tasks;
  if (!query.trim()) return users;

  return users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
  );
};
