export interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface Task {
  id: number | string;
  title: string;
  status: string;
  priority: string;
  category: string;
}

export interface TaskUser {
  _id?: string;
  name: string;
  avatar: string;
}

export interface SubTask {
  _id: string; // From MongoDB
  id?: string; // Some legacy code uses id
  name: string;
  status:
    | 'Pending'
    | 'Done'
    | 'In Progress'
    | 'None'
    | 'Doing'
    | 'Stuck'
    | string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | string;
  parentTask?: string;
  estimated?: string;
  createdBy?: TaskUser | string;
  assignees?: (TaskUser | string)[];
}

export interface ProjectTask extends SubTask {
  subtasks?: SubTask[];
  labels?: string[];
}
