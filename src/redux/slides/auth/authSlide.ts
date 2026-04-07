import { createSlice } from '@reduxjs/toolkit';

type AuthState = {
  user: null | {
    email: string;
    name?: string;
  };
  token: string | null;
};

const savedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user: savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null,
  token: null,
};

const authSlice = createSlice({
  name: 'authSlide',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const user = action.payload.user;

      if (!user) return;

      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;

      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
