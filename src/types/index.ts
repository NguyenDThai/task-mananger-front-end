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
