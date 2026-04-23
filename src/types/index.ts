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
  description?: string;
  position?: number;
  prevPos?: number | null;
  nextPos?: number | null;
}

export interface ProjectTask extends SubTask {
  subtasks?: SubTask[];
  labels?: string[];
  position?: number;
  prevPos?: number | null;
  nextPos?: number | null;
}

// Type into chatSlide
export interface ChatFile {
  id: number;
  link: string;
  name: string;
  ext: string;
  [key: string]: unknown;
}

export interface Chat {
  id: number;
  name?: string;
  type: 'single' | 'group';
  avatar?: string | null;
  message?: Message;
  updated_at?: string;
  members?: UserChat[];
  new?: Record<number, number>;
  [key: string]: unknown;
}

export interface Message {
  id: number;
  content: string;
  revoke?: boolean;
  remove?: boolean;
  like?: boolean;
  love?: boolean;
  created_at?: string;
  sender_id?: number;
  sender_code?: string;
  member?: UserChat;
  files?: ChatFile[];
  reply_id?: number;
  reply?: Message | null;
  [key: string]: unknown;
}

export interface UserChat {
  id: number;
  name: string;
  code: string;
  avatar?: string | null;
  email?: string | null;
  [key: string]: unknown;
}

export interface PaginationInfo {
  page: number;
  hasMore: boolean;
}
