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
        return;
      }

      // 2. Tìm trong subtasks
      for (const parent of state.tasks) {
        // Nếu task cha không có subtask thì bỏ qua
        if (!parent.subtasks) continue;

        const subTask = parent.subtasks.find((st) => (st._id || st.id) === id);

        if (subTask) {
          Object.assign(subTask, data);

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
