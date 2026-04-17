import { createSlice } from '@reduxjs/toolkit';
import type { ISChatUser, IChatItem, IMessageItem } from '../../../types';

type ChatState = {
  currentUser: ISChatUser | null;
  chats: IChatItem[];
  currentChat?: IChatItem | null;
  currentChatMessages: IMessageItem[];
  currentReceiver?: ISChatUser | null;
  members: ISChatUser[];
};

const initialState: ChatState = {
  currentUser: null,
  chats: [],
  currentChat: null,
  currentChatMessages: [],
  currentReceiver: null,
  members: [],
};

const chatSlice = createSlice({
  name: 'chatSlide',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setCurrentChatMessages: (state, action) => {
      state.currentChatMessages = action.payload;
    },
    setMembers: (state, action) => {
      state.members = action.payload;
    },
    setCurrentReceiver: (state, action) => {
      state.currentReceiver = action.payload;
    },
    addNewMessage: (state, action) => {
      const isExisted = state.currentChatMessages.find(
        (m) => m.id === action.payload.id,
      );
      if (isExisted || !action.payload.id) return;
      const newMessage = action.payload as IMessageItem;
      state.currentChatMessages.push(newMessage);
      if (!state.currentChat) return;

      const chatIndex = state.chats.findIndex(
        (chat) => chat.id === state.currentChat?.id,
      );
      if (chatIndex !== -1) {
        state.chats[chatIndex].message = newMessage;
        const updatedChat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(updatedChat);
      }
    },
    removeChat: (state, action) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);
    },
    addChat: (state, action) => {
      state.chats.unshift(action.payload);
    },
  },
});

export const {
  setCurrentUser,
  setChats,
  setCurrentChat,
  setCurrentChatMessages,
  setMembers,
  setCurrentReceiver,
  addNewMessage,
  removeChat,
  addChat,
} = chatSlice.actions;
export default chatSlice.reducer;
