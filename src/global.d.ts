interface SatekChatauthData {
  code: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

interface SatekChatResponse<T = unknown> {
  data?: T;
  message?: string;
  statusCode?: number;
  statusText?: string;
  [key: string]: unknown;
}

interface SatekChatUser {
  id: number;
  name: string;
  code: string;
  avatar?: string | null;
  [key: string]: unknown;
}

interface SatekChatMessage {
  id: number;
  content: string;
  chat_id: number;
  sender_id: number;
  revoke?: boolean;
  remove?: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface SatekChatConversation {
  id: number;
  name?: string;
  type: 'single' | 'group';
  avatar?: string | null;
  message?: SatekChatMessage;
  updated_at: string;
  members?: SatekChatUser[];
  [key: string]: unknown;
}

interface SatekChatEvent {
  chats_created: 'chats.created'; // Cuộc trò chuyện mới được tạo
  chats_updated: 'chats.updated'; // Cuộc trò chuyện được cập nhật
  chats_deleted: 'chats.deleted'; // Cuộc trò chuyện bị xóa
  chats_member: 'chats.member'; // Thành viên tham gia/rời nhóm
  chats_action: 'chats.action'; // Đánh dấu đọc/chưa đọc
  chats_message: 'chats.message'; // Tin nhắn mới hoặc thao tác
  projects_member: 'projects.member'; // Thành viên dự án
  new_message: 'new_message'; // Tin nhắn mới
}

interface SChatInstance {
  // Quản lý xác thực
  setAuth(data: SatekChatauthData): Promise<SatekChatResponse>;
  getAuth(): SatekChatauthData | null;
  clearAuth(): void;

  // Quản lý người nhận
  setReceiver(data: SatekChatauthData): Promise<SatekChatResponse>;
  // Tạo thiết lập người nhận
  getReceiver(): SatekChatauthData | null;
  clearReceiver(): void;

  // Quản lý thành viên
  getMembers(
    chatId?: number,
    limit?: number,
    page?: number,
    include?: string,
  ): Promise<SatekChatResponse<SatekChatUser[]>>;

  /**
   * Thêm thành viên vào nhóm.
   * @param chatId ID cuộc trò chuyện.
   * @param memberId ID thành viên cần thêm.
   */
  addMember(chatId: number, memberId: number): Promise<SatekChatResponse>;

  /**
   * Xóa thành viên khỏi nhóm.
   * @param chatId ID cuộc trò chuyện.
   * @param memberId ID thành viên cần xóa.
   */
  removeMember(chatId: number, memberId: number): Promise<SatekChatResponse>;

  // Quản lý cuộc trò chuyện

  /** Lấy danh sách cuộc trò chuyện của thành viên hiện tại */
  getChats(
    limit?: number,
    page?: number,
  ): Promise<SatekChatResponse<SatekChatConversation[]>>;

  /** Tìm cuộc trò chuyện 1-1 với người nhận qua ID */
  findChatByReceiver(
    receiverId: number,
  ): Promise<SatekChatResponse<SatekChatConversation>>;

  /** Tạo cuộc trò chuyện mới hoặc lấy cuộc trò chuyện cũ 1-1 */
  addChat(
    receiverId: number,
    content?: string,
  ): Promise<SatekChatResponse<SatekChatConversation>>;

  /** Tạo nhóm mới */
  addGroup(
    memberIds: number[],
    name: string,
    avatar?: string,
    userId?: number,
  ): Promise<SatekChatResponse<SatekChatConversation>>;

  // Cập nhật thông tin nhóm
  updateGroup(
    chatId: number,
    name: string,
    avatar?: string,
  ): Promise<SatekChatResponse<SatekChatConversation>>;

  // Xóa cuộc trò chuyện (1-1 hoặc nhóm)
  removeChat(chatId: number): Promise<SatekChatResponse>;

  // Đánh dâu cuộc trò chuyện đã đọc
  readChat(chatId: number): Promise<SatekChatResponse>;

  // Đánh dấu cuộc trò chuyện chưa đọc
  unreadChat(chatId: number): Promise<SatekChatResponse>;

  // Quản lý tin nhắn
  getMessages(
    chatId: number,
    limit?: number,
    page?: number,
  ): Promise<SatekChatResponse<SatekChatMessage[]>>;

  // Gửi tin nhắn
  addMessage(
    chatId: number,
    content?: string | null,
    files?: FileList | File[] | null,
    replyId?: number,
  ): Promise<SatekChatResponse<SatekChatMessage>>;

  actionMessage(
    chatId: number,
    messageId: number,
    action: 'like' | 'love' | 'revoke' | 'remove',
  ): Promise<SatekChatResponse>;

  EVENTS: SatekChatEvent;

  addEventListener(event: string, listener: (data: unknown) => void): void;
  removeEventListener(
    event: string,
    listener?: (data: unknown) => void | null,
  ): void;

  /** Đẩy một sự kiện tự định nghĩa cho tất cả listeners (thường dùng debug) */
  runEvent(name: string, data?: unknown): void;

  // Cấu hình hệ thống
  // Thiết lập cấu hình tùy chỉnh cho SDK
  setConfig(config: {
    debugMode?: boolean;
    maxRetries?: number;
    [key: string]: unknown;
  }): void;
}

interface Window {
  initSChat: {
    new (): SChatInstance;
    (): SChatInstance;
  };
}

declare const initSChat: {
  new (): SChatInstance;
  (): SChatInstance;
};
