export interface User {
  id?: string;
  name?: string;
  email?: string;
}

export interface Task {
  id: number | string;
  title: string;
  status: string;
  priority: string;
  category: string;
}

export interface TaskUser {
  name: string;
  avatar: string;
}

export interface SubTask {
  _id: string; // From MongoDB
  id?: string; // Some legacy code uses id
  name: string;
  assignee: TaskUser;
  status: 'Pending' | 'Done' | 'In Progress' | 'None' | 'Doing' | 'Stuck';
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface ProjectTask extends SubTask {
  subtasks?: SubTask[];
  estimated: string;
  labels?: string[];
}
