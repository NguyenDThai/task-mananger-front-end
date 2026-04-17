import {
  configureStore,
  combineReducers,
  type AnyAction,
} from '@reduxjs/toolkit';
import authReducer from './slides/auth/authSlide';
import taskReducer from './slides/task/taskSlide';
import userReducer from './slides/user/userSlide';
import chatReducer from './slides/chat/chatSlide';
import { baseApi } from './api/baseApi';

const appReducer = combineReducers({
  auth: authReducer,
  task: taskReducer,
  user: userReducer,
  chat: chatReducer,
  [baseApi.reducerPath]: baseApi.reducer,
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
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['chat.instance'],
      },
    }).concat(baseApi.middleware);
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
