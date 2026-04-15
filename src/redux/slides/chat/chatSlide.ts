import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ISChatInstance } from '../../../types';

type ChatState = {
  instance: ISChatInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
};

const initialState: ChatState = {
  instance: null,
  isInitialized: false,
  isLoading: false,
};

const chatSlice = createSlice({
  name: 'chatSlide',
  initialState,
  reducers: {
    // Action để bắt đầu khởi tạo chat
    initializeChatStart: (state) => {
      state.isLoading = true;
    },
    // Action để set chat instance sau khi khởi tạo thành công
    initializeChatSuccess: (state, action: PayloadAction<ISChatInstance>) => {
      state.instance = action.payload;
      state.isInitialized = true;
      state.isLoading = false;
    },
    // Action để xử lý lỗi khi khởi tạo chat
    initializeChatFailure: (state) => {
      state.isLoading = false;
      state.isInitialized = false;
    },
    // Action để reset chat
    resetChat: (state) => {
      state.instance = null;
      state.isInitialized = false;
      state.isLoading = false;
    },
  },
});

export const {
  initializeChatStart,
  initializeChatSuccess,
  initializeChatFailure,
  resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
