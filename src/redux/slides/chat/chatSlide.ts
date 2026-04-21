import { createSlice } from '@reduxjs/toolkit';
import type {
  ISChatUser,
  IChatItem,
  IMessageItem,
  IPaginationInfo,
} from '../../../types';

type ChatState = {
  currentUser: ISChatUser | null;
  chats: IChatItem[];
  currentChat?: IChatItem | null;
  currentChatMessages: IMessageItem[];
  currentReceiver?: ISChatUser | null;
  currentChatMembers: ISChatUser[];
  members: ISChatUser[];
  messagesPagination: IPaginationInfo | null;
};

const initialState: ChatState = {
  currentUser: null,
  chats: [],
  currentChat: null,
  currentChatMessages: [],
  currentChatMembers: [],
  currentReceiver: null,
  members: [],
  messagesPagination: null,
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
    setMessagesPagination: (state, action) => {
      state.messagesPagination = action.payload;
    },
    prependMessages: (state, action) => {
      const messages = action.payload;
      if (Array.isArray(messages) && messages.length > 0) {
        state.currentChatMessages.push(...messages);
      }
    },
    addNewMessage: (state, action) => {
      const { chat, message } = action.payload;

      if (!message || !chat) return;

      const chatIndex = state.chats.findIndex((c) => c.id === chat.id);

      if (chatIndex !== -1) {
        state.chats[chatIndex] = chat;
        const updatedChat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(updatedChat);
      }

      if (!state.currentChat || chat.id !== state.currentChat?.id) return;
      state.currentChatMessages.unshift(message);
      state.currentChat = chat;
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
    updateChatAvatar: (state, action) => {
      const { chatId, avatar } = action.payload;
      const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].avatar = avatar;
      }
    },
    updateMessage: (state, action) => {
      const { chat_id, message } = action.payload;
      if (!message || !chat_id) return;

      if (state.currentChat?.id !== chat_id) {
        return;
      }

      const messageIndex = state.currentChatMessages.findIndex(
        (m) => m.id === message.id,
      );
      if (messageIndex !== -1) {
        state.currentChatMessages[messageIndex] = message;
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
      if (!chat || !chat.message || !message_id) {
        return;
      }

      let content = 'Tin nhắn đã bị xóa';
      if (type === 'revoke') {
        content = 'Tin nhắn đã bị thu hồi';
      }

      if (chat.message.id === message_id) {
        chat.message.content = content;
        chat.message.files = [];
        chat.message.revoked = type === 'revoke';
        chat.message.removed = type === 'remove';
      }

      if (!state.currentChat || chat_id !== state.currentChat?.id) return;
      const message = state.currentChatMessages.find(
        (m) => m.id === message_id,
      );
      if (message) {
        message.content = content;
        message.files = [];
        message.revoked = type === 'revoke';
        message.removed = type === 'remove';
      }
    },
    setCurrentChatMembers: (state, action) => {
      state.currentChatMembers = action.payload;
    },
  },
});

export const {
  setCurrentUser,
  setChats,
  setCurrentChat,
  setCurrentChatMessages,
  setCurrentChatMembers,
  setMembers,
  setCurrentReceiver,
  setMessagesPagination,
  prependMessages,
  addNewMessage,
  removeChat,
  addChat,
  updateChat,
  updateChatAvatar,
  removeMessage,
  updateMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
