export interface ISChatInstance {
  EVENTS: ISChatEvents;

  /**
   * Thiết lập cấu hình tùy chỉnh cho SDK.
   * @param config (Object): Các tùy chọn cấu hình như debugMode, maxRetries...
   */
  setConfig: (config: ISChatConfig) => void;

  // Auth methods
  setAuth: (data: ISChatUser) => Promise<ISChatUser>;
  getAuth: () => Promise<ISChatUser | null>;
  clearAuth: () => Promise<void>;

  // Receiver methods
  setReceiver: (receiverData: ISChatUser) => Promise<ISChatUser>;
  getReceiver: () => Promise<ISChatUser | null>;
  clearReceiver: () => Promise<void>;

  // Manage member methods
  /**
   * Lấy danh sách thành viên
   * @param chatId ID cuộc trò chuyện (tùy chọn, mặc định null lấy tất cả)
   * @param limit Số lượng bản ghi (tùy chọn, mặc định 0 lấy tất cả)
   * @param page Số trang (tùy chọn, mặc định 1)
   * @param include Các trường bổ sung (tùy chọn)
   */
  getMembers: (
    chatId?: number | null,
    limit?: number,
    page?: number,
    include?: string,
  ) => Promise<{
    data: ISChatUser[];
  }>;
  addMember: (chatId: number, memberId: number) => Promise<unknown>;

  /**
   * Xóa thành viên khỏi nhóm hoặc rời nhóm.
   * Lưu ý: Nếu xóa chính mình, nhóm sẽ bị xóa hoàn toàn.
   * @param chatId ID cuộc trò chuyện (Number)
   * @param memberId ID thành viên cần xóa (Number)
   */
  removeMember: (chatId: number, memberId: number) => Promise<unknown>;

  // Manage chat
  /**
   * Lấy danh sách cuộc trò chuyện của thành viên hiện tại.
   * @param limit Số lượng bản ghi (tùy chọn, mặc định 0 = tất cả)
   * @param page Số trang (tùy chọn, mặc định 1)
   */
  getChats: (
    limit?: number,
    page?: number,
  ) => Promise<{
    data: IChatItem[];
    pagination: {
      count: number;
      currentPage: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }>;

  /**
   * Tìm cuộc trò chuyện 1-1 với một người nhất định.
   * @param receiverId ID người nhận (Number)
   * @returns Promise trả về object cuộc trò chuyện (IChatItem) hoặc null
   */
  findChatByReceiver: (receiverId: number) => Promise<IChatItem | null>;

  /**
   * Tạo cuộc trò chuyện 1-1 hoặc lấy cuộc trò chuyện cũ nếu đã tồn tại.
   * @param receiverId ID người nhận (Number, bắt buộc)
   * @param content Tin nhắn đầu tiên (String, tùy chọn)
   */
  addChat: (
    receiverId: number,
    content?: string,
  ) => Promise<{
    data: IChatItem;
  }>;

  /**
   * Tạo nhóm trò chuyện mới.
   * @param memberIds Danh sách ID thành viên (ít nhất 2 thành viên khác)
   * @param name Tên nhóm
   * @param avatar URL ảnh đại diện nhóm (tùy chọn)
   * @returns Promise trả về object nhóm (IChatItem)
   */
  addGroup: (
    memberIds: number[],
    name: string,
    avatar?: string,
  ) => Promise<{
    data: IChatItem;
  }>;

  /**
   * Cập nhật thông tin nhóm (Tên và Ảnh đại diện).
   * @param chatId ID nhóm (Number, bắt buộc)
   * @param name Tên nhóm mới (String, bắt buộc)
   * @param avatar URL ảnh đại diện mới (String, tùy chọn)
   * @returns Promise trả về object nhóm đã được cập nhật
   */
  updateGroup: (
    chatId: number,
    name: string,
    avatar?: string,
  ) => Promise<{
    data: IChatItem;
  }>;

  /**
   * Xóa một cuộc trò chuyện (chat 1-1 hoặc nhóm).
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @returns Promise trả về kết quả thành công/thất bại
   */
  removeChat: (chatId: number) => Promise<unknown>;

  /**
   * Đánh dấu cuộc trò chuyện là đã đọc.
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @returns Promise trả về kết quả
   */
  readChat: (chatId: number) => Promise<unknown>;

  /**
   * Đánh dấu cuộc trò chuyện là chưa đọc.
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @returns Promise trả về kết quả
   */
  unreadChat: (chatId: number) => Promise<unknown>;

  // Manage message
  /**
   * Lấy danh sách tin nhắn trong một cuộc trò chuyện.
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @param limit Số lượng tin nhắn (Number, tùy chọn, mặc định 20)
   * @param page Trang (Number, tùy chọn, mặc định 1)
   */
  getMessages: (
    chatId: number,
    limit?: number,
    page?: number,
  ) => Promise<{
    data: IMessageItem[];
    pagination: {
      count: number;
      currentPage: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }>;

  /**
   * Gửi tin nhắn với nội dung, tập tin, hoặc trả lời tin nhắn khác.
   * @param chatId ID cuộc trò chuyện (Bắt buộc)
   * @param content Nội dung văn bản (Bắt buộc nếu không có files)
   * @param files Danh sách tập tin (FileList hoặc File[])
   * @param replyId ID tin nhắn cần trả lời
   */
  addMessage: (
    chatId: number,
    content?: string | null,
    files?: FileList | File[] | null,
    replyId?: number | null,
  ) => Promise<IMessageItem>;

  /**
   * Tương tác với tin nhắn (like, love, revoke, remove).
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @param messageId ID tin nhắn (Number, bắt buộc)
   * @param action Kiểu tương tác ('like' | 'love' | 'revoke' | 'remove')
   * @returns Promise trả về kết quả từ SDK
   */
  actionMessage: (
    chatId: number,
    messageId: number,
    action: TMessageAction,
  ) => Promise<unknown>;

  // System Events
  /**
   * Đăng ký lắng nghe sự kiện realtime
   * @param event Tên sự kiện (lấy từ chatSDK.EVENTS)
   * @param listener Hàm callback xử lý dữ liệu trả về
   */
  addEventListener<K extends keyof ISChatEventPayloads>(
    event: K,
    listener: (
      data: K extends keyof ISChatEventPayloads
        ? ISChatEventPayloads[K]
        : unknown,
    ) => void,
  ): void;

  /**
   * Hủy lắng nghe một sự kiện.
   * @param event Tên sự kiện (String, bắt buộc)
   * @param listener Hàm callback cần xóa (Tùy chọn). Nếu không truyền hoặc truyền null, xóa tất cả listeners của sự kiện này.
   */
  removeEventListener<K extends keyof ISChatEventPayloads>(
    event: K,
    listener?: (data: ISChatEventPayloads[K]) => void,
  ): void;

  /**
   * Đẩy một sự kiện cho tất cả listeners (thường dùng cho debug hoặc logic tùy chỉnh).
   * @param name (String, bắt buộc): Tên sự kiện (lấy từ chatSDK.EVENTS)
   * @param data (Object): Dữ liệu đi kèm sự kiện
   */
  runEvent<K extends keyof ISChatEventPayloads>(
    name: K | string,
    data?: ISChatEventPayloads[K],
  ): void;
}

export interface ISChatConfig {
  debugMode?: boolean;
  maxRetries?: number;
  [key: string]: unknown;
}

export interface ISChatEvents {
  chats_created: 'chats.created';
  chats_updated: 'chats.updated';
  chats_deleted: 'chats.deleted';
  chats_member: 'chats.member';
  chats_action: 'chats.action';
  chats_message: 'chats.message';
  projects_member: 'projects.member';
  new_message: 'new_message';
}

export interface ISChatUser {
  id?: number; // ID của người dùng
  code: string; // Mã định danh unique (bắt buộc)
  name: string; // Tên thành viên (bắt buộc)
  avatar?: string; // URL ảnh đại diện (tùy chọn)
  phone?: string; // Số điện thoại (tùy chọn)
  email?: string; // Địa chỉ email (tùy chọn)
}

export interface IChatItem {
  id: number;
  code: string;
  name?: string; // Tên cuộc trò chuyện (chỉ có cho nhóm, chat 1-1 sẽ lấy tên từ thành viên)
  avatar?: string | null; // URL ảnh đại diện (chỉ có cho nhóm, chat 1-1 sẽ lấy avatar từ thành viên)
  message: IMessageItem | null;
  members: ISChatUser[];
  type: 'single' | 'group';
  new: {
    [user_id: number]: number; // Số tin nhắn chưa đọc của từng thành viên (key là user_id, value là số lượng)
  };
  updated_at: string;
  create_at: string;
}

export interface IMessageItem {
  id: number;
  type: 'text' | unknown;
  action: string[];
  member: ISChatUser;
  content: string | null; // Nội dung tin nhắn (có thể null nếu chỉ có file đính kèm)
  files?: unknown[]; // Danh sách file gửi kèm (nếu có)
  revoke: boolean; // Trạng thái thu hồi tin nhắn
  remove: boolean; // Trạng thái xóa tin nhắn
  date: string;
  reply?: IMessageItem | null; // Tin nhắn được trả lời (nếu có)
  updated_at: string;
  created_at: string;
}

export interface ISChatEventPayloads {
  'chats.created': { chat: IChatItem };
  'chats.updated': { chat: IChatItem };
  'chats.deleted': { chat_id: number };
  'chats.member': {
    type: 'join' | 'leave';
    chat_id?: number;
    member?: ISChatUser;
    member_id?: number;
  };
  'chats.action': {
    chat_id?: number;
    message_id?: number;
    action?: TMessageAction;
    user_id?: number;
    chat?: IChatItem;
    member_id?: number;
    type: 'read' | 'unread';
  };
  'chats.message': {
    chat: IChatItem;
    message: IMessageItem;
    type: 'add' | 'remove';
    chat_id: number;
    message_id: number;
  };
  'projects.member': unknown; // Định nghĩa thêm
  new_message: { new: number }; // Số tin nhắn chưa đọc
}

export type TMessageAction = 'like' | 'love' | 'revoke' | 'remove';

export interface ISChatConstructor {
  new (): ISChatInstance;
}
