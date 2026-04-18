import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  isInitialized: boolean;
  unreadCount: number;
}

const initialState: ChatState = {
  isInitialized: false,
  unreadCount: 0,
};

const chatSlide = createSlice({
  name: 'chatSlide',
  initialState,
  reducers: {
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setInitialized } = chatSlide.actions;
export default chatSlide.reducer;

/**
 * Selectors for easy access via useSelector
 */
export const selectIsChatInitialized = (state: { chat: any }) =>
  state.chat.isInitialized;
