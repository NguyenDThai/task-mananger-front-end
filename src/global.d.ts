interface SatekChatauthData {
  code: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
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
  setAuth(data: SatekChatauthData): Promise<any>;
  getAuth(): any;
  clearAuth(): void;

  // Quản lý người nhận
  setReceiver(data: SatekChatauthData): Promise<any>;
  // Tạo thiết lập người nhận
  getReceiver(): any | null;
  clearReceiver(): void;

  // Quản lý thành viên
  getMembers(
    chatId?: number,
    limit?: number,
    page?: number,
    include?: string,
  ): Promise<any>;

  /**
   * Thêm thành viên vào nhóm.
   * @param chatId ID cuộc trò chuyện.
   * @param memberId ID thành viên cần thêm.
   */
  addMember(chatId: number, memberId: number): Promise<any>;

  /**
   * Xóa thành viên khỏi nhóm.
   * @param chatId ID cuộc trò chuyện.
   * @param memberId ID thành viên cần xóa.
   */
  removeMember(chatId: number, memberId: number): Promise<any>;

  // Quản lý cuộc trò chuyện

  /** Lấy danh sách cuộc trò chuyện của thành viên hiện tại */
  getChats(limit?: number, page?: number): Promise<any>;

  /** Tìm cuộc trò chuyện 1-1 với người nhận qua ID */
  findChatByReceiver(receiverId: number): Promise<any>;

  /** Tạo cuộc trò chuyện mới hoặc lấy cuộc trò chuyện cũ 1-1 */
  addChat(receiverId: number, content?: string): Promise<any>;

  /** Tạo nhóm mới */
  addGroup(memberIds: number[], name: string, avatar?: string): Promise<any>;

  // Cập nhật thông tin nhóm
  updateGroup(chatId: number, name: string, avatar?: string): Promise<any>;

  // Xóa cuộc trò chuyện (1-1 hoặc nhóm)
  removeChat(chatId: number): Promise<any>;

  // Đánh dâu cuộc trò chuyện đã đọc
  readChat(chatId: number): Promise<any>;

  // Đánh dấu cuộc trò chuyện chưa đọc
  unreadChat(chatId: number): Promise<any>;

  // Quản lý tin nhắn
  getMessages(chatId: number, limit?: number, page?: number): Promise<any>;

  // Gửi tin nhắn
  addMessage(
    chatId: number,
    content?: string | null,
    files?: FileList | File[] | null,
    replyId?: number,
  ): Promise<any>;

  actionMessage(
    chatId: number,
    messageId: number,
    action: 'like' | 'love' | 'revoke' | 'remove',
  ): Promise<any>;

  EVENTS: SatekChatEvent;

  addEventListener(event: string, listener: (data: any) => void): void;
  removeEventListener(
    event: string,
    listener?: (data: any) => void | null,
  ): void;

  /** Đẩy một sự kiện tự định nghĩa cho tất cả listeners (thường dùng debug) */
  runEvent(name: string, data?: any): void;

  // Cấu hình hệ thống
  // Thiết lập cấu hình tùy chỉnh cho SDK
  setConfig(config: {
    debugMode?: boolean;
    maxRetries?: number;
    [key: string]: any;
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
