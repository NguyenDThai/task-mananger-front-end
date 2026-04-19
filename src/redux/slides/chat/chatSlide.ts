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
      const { chat, message } = action.payload;

      if (!message || !chat) return;

      const chatIndex = state.chats.findIndex((c) => c.id === chat.id);

      if (chatIndex !== -1) {
        state.chats[chatIndex].message = message;
        const updatedChat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(updatedChat);
      }

      if (!state.currentChat || chat.id !== state.currentChat?.id) return;
      state.currentChatMessages.push(message);
    },
    addChat: (state, action) => {
      const chatIndex = state.chats.findIndex(
        (c) => c.id === action.payload.id,
      );
      if (chatIndex !== -1) {
        return;
      }

      state.chats.unshift(action.payload);
    },
    updateChat: (state, action) => {
      const updatedChat = action.payload;
      const chatIndex = state.chats.findIndex(
        (chat) => chat.id === updatedChat.id,
      );
      if (chatIndex !== -1) {
        state.chats[chatIndex] = updatedChat;
      }
      if (state.currentChat?.id === updatedChat.id) {
        state.currentChat = updatedChat;
      }
    },
    removeChat: (state, action) => {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload);
      if (state.currentChat?.id === action.payload) {
        state.currentChat = null;
        state.currentChatMessages = [];
      }
    },
    removeMessage: (state, action) => {
      const { chat_id, message_id, type } = action.payload;
      const chat = state.chats.find((c) => c.id === chat_id);
      if (
        !chat ||
        !chat.message ||
        !message_id ||
        chat.message.id !== message_id
      )
        return;

      let content = 'Tin nhắn đã bị xóa';
      if (type === 'revoke') {
        content = 'Tin nhắn đã bị thu hồi';
      }

      chat.message.content = content;

      if (!state.currentChat || chat_id !== state.currentChat?.id) return;
      const message = state.currentChatMessages.find(
        (m) => m.id === message_id,
      );
      if (message) {
        message.content = content;
      }
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
  updateChat,
  removeMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
