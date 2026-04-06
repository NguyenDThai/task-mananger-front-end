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
  },
});

export const { setUsers } = userSlide.actions;

export default userSlide.reducer;
