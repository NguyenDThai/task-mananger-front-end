import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  isInitialized: boolean;
  unreadCount: number;
  recentChats: any[];
  message: Record<number, any[]>;
  currentChatId: number | null;
  systemUsers: any[]; // Danh bạ toàn hệ thống
  chatMembers: Record<number, any[]>; //Lưu danh sách thành viên trong group
}

const initialState: ChatState = {
  isInitialized: false,
  unreadCount: 0,
  recentChats: [],
  message: {},
  currentChatId: null,
  systemUsers: [],
  chatMembers: {},
};

const chatSlide = createSlice({
  name: 'chatSlide',
  initialState,
  reducers: {
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },

    setCurrentChatId: (state, action: PayloadAction<number | null>) => {
      state.currentChatId = action.payload;
    },

    setRecentChats: (state, action: PayloadAction<any[]>) => {
      state.recentChats = action.payload;
    },

    upsertMessage: (
      state,
      action: PayloadAction<{ chat: any; message: any }>,
    ) => {
      const { chat, message } = action.payload;
      const chatId = chat.id;
      // --- A. Cập nhật mảng tin nhắn (state.message) ---
      if (!state.message[chatId]) {
        state.message[chatId] = [];
      }
      const existingMessages = state.message[chatId];
      const index = existingMessages.findIndex((m) => m.id === message.id);

      if (message.revoke) {
        // Tìm tin nhắn cũ đang có trong Store
        const oldMessage = index !== -1 ? state.message[chatId][index] : {};
        // Neu la thu hoi, cap nhat object tin nhan trang thai da thu hoi
        const revokeMessage = {
          ...oldMessage,
          ...message,
          revoke: true,
          content: 'Tin nhắn đã bị thu hồi',
        };

        if (index !== -1) {
          state.message[chatId][index] = revokeMessage;
        } else {
          state.message[chatId].push(revokeMessage);
        }
      } else if (message.remove) {
        // Loai bo tin nhan ra khoi danh sach
        state.message[chat.id] = existingMessages.filter(
          (m) => m.id !== message.id,
        );
      } else {
        // Nếu là TIN NHẮN BÌNH THƯỜNG hoặc CẬP NHẬT (Like/Love)
        if (index !== -1) {
          state.message[chatId][index] = message;
        } else {
          state.message[chatId].push(message);
        }
      }
      // --- B. Cập nhật danh sách chat gần đây (state.recentChats) ---
      // Đưa chat vừa có tin nhắn lên đầu danh sách
      const otherChats = state.recentChats.filter((c) => c.id !== chatId);
      const updatedChat = {
        ...chat,
        message: message,
        updated_at: message.created_at,
      };
      state.recentChats = [updatedChat, ...otherChats];
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    setSystemUsers: (state, action: PayloadAction<any[]>) => {
      state.systemUsers = action.payload;
    },
    // Lưu danh sách thành viên trong group
    setChatMembers: (
      state,
      action: PayloadAction<{ chatId: number; members: any[] }>,
    ) => {
      const { chatId, members } = action.payload;
      state.chatMembers[chatId] = members;
    },
  },
});

export const {
  setInitialized,
  setCurrentChatId,
  setRecentChats,
  upsertMessage,
  setUnreadCount,
  setSystemUsers,
  setChatMembers,
} = chatSlide.actions;

export default chatSlide.reducer;

/**
 * Selectors for easy access via useSelector
 */
// Kiểm tra xem chat đã được khởi tạo chưa
export const selectIsChatInitialized = (state: { chat: ChatState }) =>
  state.chat.isInitialized;

// Lấy ID của cuộc trò chuyện hiện tại
export const selectCurrentChatId = (state: { chat: ChatState }) =>
  state.chat.currentChatId;

// Lấy danh sách chat gần đây
export const selectRecentChats = (state: { chat: ChatState }) =>
  state.chat.recentChats;

// Lấy tin nhắn của cuộc trò chuyện hiện tại
export const currentMessages = (state: { chat: ChatState }) => {
  const chatId = state.chat.currentChatId;
  return chatId ? state.chat.message[chatId] || [] : [];
};

export const selectUnreadCount = (state: { chat: ChatState }) =>
  state.chat.unreadCount;

// Lấy danh bạ toàn hệ thống
export const selectSystemUsers = (state: { chat: ChatState }) =>
  state.chat.systemUsers;
// Lấy danh sách thành viên trong group
export const selectChatMembers = (state: { chat: ChatState }) => {
  const chatId = state.chat.currentChatId;
  return chatId ? state.chat.chatMembers[chatId] || [] : [];
};
