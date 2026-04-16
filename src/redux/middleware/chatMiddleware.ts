import type { Middleware } from '@reduxjs/toolkit';
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setCredentials } from '../slides/auth/authSlide';
import {
  initializeChatStart,
  initializeChatSuccess,
  initializeChatFailure,
} from '../slides/chat/chatSlide';
import type { AppDispatch, RootState } from '../store';

/**
 * Middleware để khởi tạo chat instance tự động khi app start
 * Chỉ khởi tạo một lần
 */
let chatInitialized = false;

export const chatMiddleware: Middleware = (store) => (next) => (action) => {
  // Thực hiện action trước
  const result = next(action);

  // Sau khi app khởi động, kiểm tra và khởi tạo chat
  if (!chatInitialized && typeof window !== 'undefined') {
    const state = store.getState();

    // Chỉ khởi tạo nếu window.initSChat đã sẵn sàng
    if (typeof window.initSChat !== 'undefined' && !state.chat.isInitialized) {
      chatInitialized = true;
      initializeChatAsync(store.dispatch as AppDispatch);
    }
  }

  return result;
};

/**
 * Hàm async để khởi tạo chat
 */
async function initializeChatAsync(dispatch: AppDispatch) {
  try {
    dispatch(initializeChatStart());

    // Tạo instance chat
    const chatInstance = new window.initSChat();
    dispatch(initializeChatSuccess(chatInstance));

    await chatInstance.setConfig({ debugMode: true });
  } catch (error) {
    console.error('Failed to initialize chat:', error);
    dispatch(initializeChatFailure());
  }
}

export const authListenerMiddleware = createListenerMiddleware();
authListenerMiddleware.startListening({
  actionCreator: setCredentials,
  effect: async (action, listenerApi) => {
    // 1. Lấy user từ payload của action vừa dispatch
    const user = action.payload.user;

    // 2. Lấy chat instance hiện tại từ state
    const state = listenerApi.getState() as RootState;
    const chatInstance = state.chat.instance;

    // 3. Nếu có chatInstance, tiến hành setAuth
    if (chatInstance && user) {
      await chatInstance.setAuth({
        code: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
      });
    }
  },
});
