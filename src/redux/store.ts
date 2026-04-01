import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlide';
import { authApi } from './api/authApi';
import { taskApi } from './api/taskApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(
      authApi.middleware,
      taskApi.middleware,
    );
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
