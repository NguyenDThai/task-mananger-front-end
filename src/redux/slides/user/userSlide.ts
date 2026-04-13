import { createSlice } from '@reduxjs/toolkit';
import type { User } from '../../../types';

type UserState = {
  users: User[];
};

const initialState: UserState = {
  users: [],
};

const userSlide = createSlice({
  name: 'userSlide',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    updateUserLocal: (state, action) => {
      const updatedUser = action.payload;
      const userIndex = state.users.findIndex(
        (u) => (u._id || u.id) === (updatedUser._id || updatedUser.id),
      );

      if (userIndex !== -1) {
        state.users[userIndex] = { ...state.users[userIndex], ...updatedUser };
      }
    },
  },
});

export const { setUsers, updateUserLocal } = userSlide.actions;

export default userSlide.reducer;
