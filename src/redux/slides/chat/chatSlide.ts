import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  chatSDK: SChatInstance;
  isInitialized: boolean;
}

/**
 * Initialize the Chat SDK singleton instance.
 * Using the global `initSChat` defined in `global.d.ts`.
 */
const chatSDKInstance = new initSChat();

// Default configuration
chatSDKInstance.setConfig({
  debugMode: true,
  maxRetries: 3,
});

const initialState: ChatState = {
  chatSDK: chatSDKInstance,
  isInitialized: false,
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
export const selectChatSDK = (state: { chat: ChatState }) => state.chat.chatSDK;
export const selectIsChatInitialized = (state: { chat: ChatState }) =>
  state.chat.isInitialized;
