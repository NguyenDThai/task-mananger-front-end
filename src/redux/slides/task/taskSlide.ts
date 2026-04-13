import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProjectTask } from '../../../types';

export type PriorityColor = {
  bg: string;
  text: string;
  icon: string;
};

type taskState = {
  tasks: ProjectTask[];
  priorityColors: Record<string, PriorityColor>;
};

const DEFAULT_PRIORITY_COLORS: Record<string, PriorityColor> = {
  Urgent: { bg: '#fee2e2', text: '#991b1b', icon: '#dc2626' },
  High: { bg: '#ffedd5', text: '#9a3412', icon: '#f97316' },
  Medium: { bg: '#fef3c7', text: '#92400e', icon: '#f59e0b' },
  Low: { bg: '#dbeafe', text: '#1e40af', icon: '#2563eb' },
};

// Khi ứng dụng vừa khởi động, kiểm tra xem có dữ liệu màu sắc trong localStorage không
// Nếu có thì lấy dữ liệu đó, nếu không có thì lấy dữ liệu mặc định
const getInitialPriorityColors = (): Record<string, PriorityColor> => {
  const saved = localStorage.getItem('priority_colors');
  if (!saved) return DEFAULT_PRIORITY_COLORS;
  try {
    return { ...DEFAULT_PRIORITY_COLORS, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_PRIORITY_COLORS;
  }
};

const initialState: taskState = {
  tasks: [],
  priorityColors: getInitialPriorityColors(),
};

const taskSlide = createSlice({
  name: 'taskSlide',
  initialState,
  reducers: {
    appendTasks: (state, action: PayloadAction<ProjectTask[]>) => {
      const newTasks = action.payload;
      const filteredTasks = newTasks.filter(
        (newTask) =>
          !state.tasks.some(
            (existing) =>
              (existing._id || existing.id) === (newTask._id || newTask.id),
          ),
      );
      state.tasks = [...state.tasks, ...filteredTasks];
    },
    updatePriorityColor: (
      state,
      action: PayloadAction<{ key: string; color: PriorityColor }>,
    ) => {
      const { key, color } = action.payload;
      state.priorityColors[key] = color;
      localStorage.setItem(
        'priority_colors',
        JSON.stringify(state.priorityColors),
      );
    },
    setTasks: (state, action: PayloadAction<ProjectTask[]>) => {
      state.tasks = action.payload;
    },

    addTaskLocal: (state, action: PayloadAction<ProjectTask[]>) => {
      action.payload.forEach((newTask) => {
        const newId = newTask._id || newTask.id;

        // Trường hợp subtask
        if (newTask.parentTask) {
          const parent = state.tasks.find(
            (t) => (t._id || t.id) === newTask.parentTask,
          );

          if (!parent) return;

          parent.subtasks ??= [];

          const isExisted = parent.subtasks.some(
            (st) => (st._id || st.id) === newId,
          );

          if (!isExisted) parent.subtasks.push(newTask);
          return;
        }

        // Task cha
        const isExistedRoot = state.tasks.some(
          (t) => (t._id || t.id) === newId,
        );

        if (!isExistedRoot) {
          state.tasks.push(newTask);
        }
      });
    },

    updateTaskLocal: (
      state,
      action: PayloadAction<{ id: string; data: Partial<ProjectTask> }>,
    ) => {
      const { id, data } = action.payload;

      // 1. Tìm ở cấp gốc (Task cha)
      const rootTask = state.tasks.find((t) => (t._id || t.id) === id);

      if (rootTask) {
        // Cập nhật trực tiếp vào state
        Object.assign(rootTask, data);

        // Nếu có cập nhật position, sắp xếp lại danh sách
        if (data.position !== undefined) {
          state.tasks.sort((a, b) => {
            // Sắp xếp theo position
            return (a.position || 0) - (b.position || 0);
          });
        }
        return;
      }

      // 2. Tìm trong subtasks
      for (const parent of state.tasks) {
        // Nếu task cha không có subtask thì bỏ qua
        if (!parent.subtasks) continue;

        const subTask = parent.subtasks.find((st) => (st._id || st.id) === id);

        if (subTask) {
          Object.assign(subTask, data);

          // Nếu có cập nhật position, sắp xếp lại subtasks
          if (data.position !== undefined) {
            parent.subtasks.sort(
              (a, b) => (a.position || 0) - (b.position || 0),
            );
          }

          return;
        }
      }
    },

    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      // 1. Xóa ở cấp gốc
      const rootIndex = state.tasks.findIndex((t) => (t._id || t.id) === id);

      // Đã tìm thấy vị trí nào đó trong mảng
      if (rootIndex !== -1) {
        state.tasks.splice(rootIndex, 1);
        return;
      }

      for (const parent of state.tasks) {
        if (!parent.subtasks) continue;

        const subIndex = parent.subtasks.findIndex(
          (t) => (t._id || t.id) === id,
        );

        if (subIndex !== -1) {
          parent.subtasks.splice(subIndex, 1);
          return;
        }
      }
    },

    bulkDeleteLocal: (state, action: PayloadAction<string[]>) => {
      state.tasks = state.tasks.filter(
        (t) => !action.payload.includes((t._id || t.id) as string),
      );
    },

    clearTasks: (state) => {
      state.tasks = [];
    },

    updateAssigneeAvatarLocal: (
      state,
      action: PayloadAction<{ userId: string; avatar: string }>,
    ) => {
      const { userId, avatar } = action.payload;

      // Cập nhật avatar trong tất cả tasks
      state.tasks.forEach((task) => {
        // Cập nhật assignees của task cha
        if (task.assignees && Array.isArray(task.assignees)) {
          task.assignees.forEach((assignee) => {
            if (typeof assignee === 'object' && assignee._id === userId) {
              assignee.avatar = avatar;
            }
          });
        }

        // Cập nhật assignees của subtasks
        if (task.subtasks && Array.isArray(task.subtasks)) {
          task.subtasks.forEach((subtask) => {
            if (subtask.assignees && Array.isArray(subtask.assignees)) {
              subtask.assignees.forEach((assignee) => {
                if (typeof assignee === 'object' && assignee._id === userId) {
                  assignee.avatar = avatar;
                }
              });
            }
          });
        }
      });
    },
  },
});

export const {
  appendTasks,
  updatePriorityColor,
  setTasks,
  addTaskLocal,
  updateTaskLocal,
  deleteTaskLocal,
  bulkDeleteLocal,
  clearTasks,
  updateAssigneeAvatarLocal,
} = taskSlide.actions;

export default taskSlide.reducer;
