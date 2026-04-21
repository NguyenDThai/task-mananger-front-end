import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Chat {
  id: number;
  name?: string;
  type: 'single' | 'group';
  avatar?: string | null;
  message?: Message;
  updated_at?: string;
  members?: User[];
  [key: string]: unknown;
}

export interface Message {
  id: number;
  content: string;
  revoke?: boolean;
  remove?: boolean;
  like?: boolean;
  love?: boolean;
  created_at?: string;
  sender_id?: number;
  sender_code?: string;
  member?: User;
  files?: Array<{ [key: string]: unknown }>;
  reply_id?: number;
  reply?: Message | null;
  [key: string]: unknown;
}

export interface User {
  id: number;
  name: string;
  code: string;
  avatar?: string | null;
  email?: string | null;
  [key: string]: unknown;
}

interface ChatState {
  isInitialized: boolean;
  isActivated: boolean; // Trạng thái đã mở chatbot lần đầu
  unreadCount: number;
  recentChats: Chat[];
  message: Record<number, Message[]>;
  currentChatId: number | null;
  systemUsers: User[]; // Danh bạ toàn hệ thống
  chatMembers: Record<number, User[]>; //Lưu danh sách thành viên trong group
  currentUser: User | null; // Người dùng hiện tại trong Chat
}

const initialState: ChatState = {
  isInitialized: false,
  isActivated: false,
  unreadCount: 0,
  recentChats: [],
  message: {},
  currentChatId: null,
  systemUsers: [],
  chatMembers: {},
  currentUser: null,
};

const chatSlide = createSlice({
  name: 'chatSlide',
  initialState,
  reducers: {
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setChatActivated: (state, action: PayloadAction<boolean>) => {
      state.isActivated = action.payload;
    },
    setCurrentChatId: (state, action: PayloadAction<number | null>) => {
      state.currentChatId = action.payload;
    },
    setRecentChats: (state, action: PayloadAction<Chat[]>) => {
      state.recentChats = action.payload;
    },
    upsertMessage: (
      state,
      action: PayloadAction<{ chat: Chat; message: Message }>,
    ) => {
      const { chat, message } = action.payload;
      const chatId = Number(chat.id);
      if (!state.message[chatId]) {
        state.message[chatId] = [];
      }
      const existingMessages = state.message[chatId];
      const index = existingMessages.findIndex((m) => m.id === message.id);

      if (message.revoke) {
        const oldMessage = index !== -1 ? state.message[chatId][index] : {};
        const revokeMessage: Message = {
          ...oldMessage,
          ...message,
          revoke: true,
          content: 'Tin nhắn đã bị thu hồi',
        } as Message;

        if (index !== -1) {
          state.message[chatId][index] = revokeMessage;
        } else {
          state.message[chatId].push(revokeMessage);
        }
      } else if (message.remove) {
        state.message[chatId] = existingMessages.filter(
          (m) => m.id !== message.id,
        );
      } else {
        // TẠO THAM CHIẾU MẢNG MỚI ĐỂ ÉP RE-RENDER
        const newMessages = [...state.message[chatId]];

        if (index !== -1) {
          // HÒA TRỘN (Merge) dữ liệu thay vì ghi đè để tránh mất content/sender khi Like/Love
          newMessages[index] = {
            ...newMessages[index],
            ...message,
          };
        } else {
          // Nếu là tin nhắn mới, push vào cuối
          newMessages.push(message);
        }

        state.message[chatId] = newMessages;
      }

      const existingChat = state.recentChats.find((c) => c.id === chatId);
      const otherChats = state.recentChats.filter((c) => c.id !== chatId);

      const updatedChat: Chat = {
        ...(existingChat || {}),
        ...chat,
        message: message,
        updated_at: message.created_at,
      };
      state.recentChats = [updatedChat, ...otherChats];
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    setSystemUsers: (state, action: PayloadAction<User[]>) => {
      state.systemUsers = action.payload;
    },
    setChatMembers: (
      state,
      action: PayloadAction<{ chatId: number; members: User[] }>,
    ) => {
      const { chatId, members } = action.payload;
      state.chatMembers[chatId] = members;
    },
    setAuth: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
  },
});

export const {
  setInitialized,
  setChatActivated,
  setCurrentChatId,
  setRecentChats,
  upsertMessage,
  setUnreadCount,
  setSystemUsers,
  setChatMembers,
  setAuth,
} = chatSlide.actions;

export default chatSlide.reducer;

/**
 * Selectors
 */
export const selectIsChatInitialized = (state: { chat: ChatState }) =>
  state.chat.isInitialized;

export const selectIsChatActivated = (state: { chat: ChatState }) =>
  state.chat.isActivated;

export const selectCurrentChatId = (state: { chat: ChatState }) =>
  state.chat.currentChatId;

export const selectRecentChats = (state: { chat: ChatState }) =>
  state.chat.recentChats;

// Hàm lấy tin nhắn hiện tại
export const currentMessages = (state: { chat: ChatState }) => {
  const chatId = state.chat.currentChatId;
  const msgs = chatId ? state.chat.message[chatId] || [] : [];
  return [...msgs].sort((a, b) => {
    // Chuyển đổi created_at thành timestamp để so sánh
    const timesA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timesB = b.created_at ? new Date(b.created_at).getTime() : 0;

    // Sắp xếp tăng dần: Tin nhắn cũ (thời gian nhỏ) ở trên, mới (thời gian lớn) ở dưới
    return timesA - timesB;
  });
};

export const selectUnreadCount = (state: { chat: ChatState }) =>
  state.chat.unreadCount;

export const selectSystemUsers = (state: { chat: ChatState }) =>
  state.chat.systemUsers;

export const selectChatMembers = (state: { chat: ChatState }) => {
  const chatId = state.chat.currentChatId;
  return chatId ? state.chat.chatMembers[chatId] || [] : [];
};

export const selectCurrentUser = (state: { chat: ChatState }) =>
  state.chat.currentUser;
