import type {
  IChatItem,
  IMessageItem,
  ISChatEventPayloads,
  ISChatInstance,
  ISChatUser,
  TMessageAction,
} from '../types';

class ChatService {
  private static instance: ChatService;
  private chatSDK: ISChatInstance;

  private constructor() {
    if (typeof window === 'undefined' || !window.initSChat) {
      throw new Error('SChat SDK is not available');
    }

    this.chatSDK = new window.initSChat();
    this.chatSDK.setConfig({ debugMode: true, maxRetries: 3 });
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Auth methods
  public async setAuth(data: ISChatUser): Promise<ISChatUser> {
    return this.chatSDK.setAuth(data);
  }
  public async getAuth(): Promise<ISChatUser | null> {
    return this.chatSDK.getAuth();
  }
  public async clearAuth(): Promise<void> {
    return this.chatSDK.clearAuth();
  }

  // Receiver methods
  public async setReceiver(receiverData: ISChatUser): Promise<ISChatUser> {
    return this.chatSDK.setReceiver(receiverData);
  }
  public async getReceiver(): Promise<ISChatUser | null> {
    return this.chatSDK.getReceiver();
  }
  public async clearReceiver(): Promise<void> {
    return this.chatSDK.clearReceiver();
  }

  // Manage member methods
  /**
   * Lấy danh sách thành viên
   * @param chatId ID cuộc trò chuyện (tùy chọn, mặc định null lấy tất cả)
   * @param limit Số lượng bản ghi (tùy chọn, mặc định 0 lấy tất cả)
   * @param page Số trang (tùy chọn, mặc định 1)
   * @param include Các trường bổ sung (tùy chọn)
   */
  public async getMembers(
    chatId?: number | null,
    limit?: number,
    page?: number,
    include?: string,
  ): Promise<{
    data: ISChatUser[];
  }> {
    return this.chatSDK.getMembers(chatId, limit, page, include);
  }
  public async addMember(chatId: number, memberId: number): Promise<unknown> {
    return this.chatSDK.addMember(chatId, memberId);
  }

  /**
   * Xóa thành viên khỏi nhóm hoặc rời nhóm.
   * Lưu ý: Nếu xóa chính mình, nhóm sẽ bị xóa hoàn toàn.
   * @param chatId ID cuộc trò chuyện (Number)
   * @param memberId ID thành viên cần xóa (Number)
   */
  public async removeMember(
    chatId: number,
    memberId: number,
  ): Promise<unknown> {
    return this.chatSDK.removeMember(chatId, memberId);
  }

  // Manage chat
  /**
   * Lấy danh sách cuộc trò chuyện của thành viên hiện tại.
   * @param limit Số lượng bản ghi (tùy chọn, mặc định 0 = tất cả)
   * @param page Số trang (tùy chọn, mặc định 1)
   */
  public async getChats(
    limit: number = 0,
    page: number = 1,
  ): Promise<{
    data: IChatItem[];
    pagination: {
      count: number;
      currentPage: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }> {
    return this.chatSDK.getChats(limit, page);
  }

  /**
   * Tìm cuộc trò chuyện 1-1 với một người nhất định.
   * @param receiverId ID người nhận (Number)
   * @returns Promise trả về object cuộc trò chuyện (IChatItem) hoặc null
   */
  public async findChatByReceiver(
    receiverId: number,
  ): Promise<IChatItem | null> {
    return this.chatSDK.findChatByReceiver(receiverId);
  }

  /**
   * Tạo cuộc trò chuyện 1-1 hoặc lấy cuộc trò chuyện cũ nếu đã tồn tại.
   * @param receiverId ID người nhận (Number, bắt buộc)
   * @param content Tin nhắn đầu tiên (String, tùy chọn)
   */
  public async addChat(
    receiverId: number,
    content?: string,
  ): Promise<{
    data: IChatItem;
  }> {
    return this.chatSDK.addChat(receiverId, content);
  }

  /**
   * Tạo nhóm trò chuyện mới.
   * @param memberIds Danh sách ID thành viên (ít nhất 2 thành viên khác)
   * @param name Tên nhóm
   * @param avatar URL ảnh đại diện nhóm (tùy chọn)
   * @returns Promise trả về object nhóm (IChatItem)
   */
  public async addGroup(
    memberIds: number[],
    name: string,
    avatar?: string,
  ): Promise<{
    data: IChatItem;
  }> {
    return this.chatSDK.addGroup(memberIds, name, avatar);
  }
  /**
   * Cập nhật thông tin nhóm (Tên và Ảnh đại diện).
   * @param chatId ID nhóm (Number, bắt buộc)
   * @param name Tên nhóm mới (String, bắt buộc)
   * @param avatar URL ảnh đại diện mới (String, tùy chọn)
   * @returns Promise trả về object nhóm đã được cập nhật
   */
  public async updateGroup(
    chatId: number,
    name: string,
    avatar?: string,
  ): Promise<{
    data: IChatItem;
  }> {
    return this.chatSDK.updateGroup(chatId, name, avatar);
  }
  /**
   * Xóa một cuộc trò chuyện (chat 1-1 hoặc nhóm).
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @returns Promise trả về kết quả thành công/thất bại
   */
  public async removeChat(chatId: number): Promise<unknown> {
    return this.chatSDK.removeChat(chatId);
  }

  /**
   * Đánh dấu cuộc trò chuyện là đã đọc.
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @returns Promise trả về kết quả
   */
  public async readChat(chatId: number): Promise<unknown> {
    return this.chatSDK.readChat(chatId);
  }

  /**
   * Đánh dấu cuộc trò chuyện là chưa đọc.
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @returns Promise trả về kết quả
   */
  public async unreadChat(chatId: number): Promise<unknown> {
    return this.chatSDK.unreadChat(chatId);
  }

  // Manage message
  /**
   * Lấy danh sách tin nhắn trong một cuộc trò chuyện.
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @param limit Số lượng tin nhắn (Number, tùy chọn, mặc định 20)
   * @param page Trang (Number, tùy chọn, mặc định 1)
   */
  public async getMessages(
    chatId: number,
    limit?: number,
    page?: number,
  ): Promise<{
    data: IMessageItem[];
    pagination: {
      count: number;
      currentPage: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }> {
    return this.chatSDK.getMessages(chatId, limit, page);
  }

  /**
   * Gửi tin nhắn với nội dung, tập tin, hoặc trả lời tin nhắn khác.
   * @param chatId ID cuộc trò chuyện (Bắt buộc)
   * @param content Nội dung văn bản (Bắt buộc nếu không có files)
   * @param files Danh sách tập tin (FileList hoặc File[])
   * @param replyId ID tin nhắn cần trả lời
   */
  public async addMessage(
    chatId: number,
    content?: string | null,
    files?: FileList | File[] | null,
    replyId?: number | null,
  ): Promise<IMessageItem> {
    return this.chatSDK.addMessage(chatId, content, files, replyId);
  }

  /**
   * Tương tác với tin nhắn (like, love, revoke, remove).
   * @param chatId ID cuộc trò chuyện (Number, bắt buộc)
   * @param messageId ID tin nhắn (Number, bắt buộc)
   * @param action Kiểu tương tác ('like' | 'love' | 'revoke' | 'remove')
   * @returns Promise trả về kết quả từ SDK
   */
  public async actionMessage(
    chatId: number,
    messageId: number,
    action: TMessageAction,
  ): Promise<unknown> {
    return this.chatSDK.actionMessage(chatId, messageId, action);
  }

  // System Events
  /**
   * Đăng ký lắng nghe sự kiện realtime
   * @param event Tên sự kiện (lấy từ chatSDK.EVENTS)
   * @param listener Hàm callback xử lý dữ liệu trả về
   */
  public addEventListener<K extends keyof ISChatEventPayloads>(
    event: K,
    listener: (
      data: K extends keyof ISChatEventPayloads
        ? ISChatEventPayloads[K]
        : unknown,
    ) => void,
  ): void {
    this.chatSDK.addEventListener(event, listener);
  }

  /**
   * Hủy lắng nghe một sự kiện.
   * @param event Tên sự kiện (String, bắt buộc)
   * @param listener Hàm callback cần xóa (Tùy chọn). Nếu không truyền hoặc truyền null, xóa tất cả listeners của sự kiện này.
   */
  public removeEventListener<K extends keyof ISChatEventPayloads>(
    event: K,
    listener?: (data: ISChatEventPayloads[K]) => void,
  ): void {
    this.chatSDK.removeEventListener(event, listener);
  }

  /**
   * Đẩy một sự kiện cho tất cả listeners (thường dùng cho debug hoặc logic tùy chỉnh).
   * @param name (String, bắt buộc): Tên sự kiện (lấy từ chatSDK.EVENTS)
   * @param data (Object): Dữ liệu đi kèm sự kiện
   */
  public runEvent<K extends keyof ISChatEventPayloads>(
    name: K | string,
    data?: ISChatEventPayloads[K],
  ): void {
    this.chatSDK.runEvent(name, data);
  }
}

export const chat = ChatService.getInstance();
