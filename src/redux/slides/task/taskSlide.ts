import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProjectTask } from '../../../types';

type taskState = {
  tasks: ProjectTask[];
};

const initialState: taskState = {
  tasks: [],
};

const taskSlide = createSlice({
  name: 'taskSlide',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<ProjectTask[]>) => {
      state.tasks = action.payload;
    },

    addTaskLocal: (state, action: PayloadAction<ProjectTask[]>) => {
      action.payload.forEach((newTask) => {
        // Kiểm tra xem đã tồn tại chưa (ở cấp gốc)
        const existsRoot = state.tasks.some(
          (t) => (t._id || t.id) === (newTask._id || newTask.id),
        );

        // Có cách viết gọn
        if (newTask.parentTask) {
          // Nếu là subtask, tìm cha và nhét vào
          const parent = state.tasks.find(
            (t) => (t._id || t.id) === newTask.parentTask,
          );
          if (parent) {
            if (!parent.subtasks) parent.subtasks = [];
            const subExists = parent.subtasks.some(
              (st) => (st._id || st.id) === (newTask._id || newTask.id),
            );
            if (!subExists) {
              parent.subtasks.push(newTask);
            }
          }
        } else if (!existsRoot) {
          // Nếu là task cha và chưa tồn tại
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
      const rootIndex = state.tasks.findIndex((t) => (t._id || t.id) === id);
      if (rootIndex !== -1) {
        state.tasks[rootIndex] = { ...state.tasks[rootIndex], ...data };
        return;
      }

      // 2. Nếu không thấy, tìm trong Subtasks của từng task cha
      state.tasks.forEach((parent) => {
        if (parent.subtasks) {
          const subIndex = parent.subtasks.findIndex(
            (st) => (st._id || st.id) === id,
          );
          if (subIndex !== -1) {
            parent.subtasks[subIndex] = {
              ...parent.subtasks[subIndex],
              ...data,
            };
          }
        }
      });
    },

    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      // 1. Xóa ở cấp gốc
      state.tasks = state.tasks.filter((t) => (t._id || t.id) !== id);

      // 2. Xóa trong mảng subtasks của bất kỳ task cha nào
      state.tasks.forEach((parent) => {
        if (parent.subtasks) {
          parent.subtasks = parent.subtasks.filter(
            (st) => (st._id || st.id) !== id,
          );
        }
      });
    },

    bulkDeleteLocal: (state, action: PayloadAction<string[]>) => {
      state.tasks = state.tasks.filter(
        (t) => !action.payload.includes((t._id || t.id) as string),
      );
    },

    clearTasks: (state) => {
      state.tasks = [];
    },
  },
});

export const {
  setTasks,
  addTaskLocal,
  updateTaskLocal,
  deleteTaskLocal,
  bulkDeleteLocal,
  clearTasks,
} = taskSlide.actions;

export default taskSlide.reducer;
