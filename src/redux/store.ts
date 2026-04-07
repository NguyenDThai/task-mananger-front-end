import {
  configureStore,
  combineReducers,
  type AnyAction,
} from '@reduxjs/toolkit';
import authReducer from './slides/auth/authSlide';
import taskReducer from './slides/task/taskSlide';
import userReducer from './slides/user/userSlide';
import { authApi } from './api/authApi';
import { taskApi } from './api/taskApi';

const appReducer = combineReducers({
  auth: authReducer,
  task: taskReducer,
  user: userReducer,
  [authApi.reducerPath]: authApi.reducer,
  [taskApi.reducerPath]: taskApi.reducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction,
) => {
  if (action.type === 'authSlide/logout') {
    // Reset toàn bộ store (bao gồm cả Cache của RTK Query) về trạng thái ban đầu
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(
      authApi.middleware,
      taskApi.middleware,
    );
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
