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
      state.tasks.push(...action.payload);
    },

    updateTaskLocal: (
      state,
      action: PayloadAction<{ id: string; data: Partial<ProjectTask> }>,
    ) => {
      const index = state.tasks.findIndex(
        (t) => t._id === action.payload.id || t.id === action.payload.id,
      );
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...action.payload.data,
        };
      }
    },

    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
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
  clearTasks,
} = taskSlide.actions;

export default taskSlide.reducer;
