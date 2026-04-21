class ChatService {
  private static instance: ChatService;
  private chatSDK: SChatInstance;
  public EVENTS: SatekChatEvent;

  constructor() {
    this.chatSDK = new initSChat();
    this.chatSDK.setConfig({
      debugMode: false,
      maxRetries: 3,
    });
    this.EVENTS = this.chatSDK.EVENTS;
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public async setAuth(data: SatekChatauthData) {
    return this.chatSDK.setAuth(data);
  }

  public async getAuth() {
    return this.chatSDK.getAuth();
  }

  public async clearAuth() {
    return this.chatSDK.clearAuth();
  }

  public async setReceiver(data: SatekChatauthData) {
    return this.chatSDK.setReceiver(data);
  }

  public async getReceiver() {
    return this.chatSDK.getReceiver();
  }

  public async clearReceiver() {
    return this.chatSDK.clearReceiver();
  }

  public async getMembers(chatId?: number, limit = 100, page = 1) {
    if (!chatId) return this.chatSDK.getMembers();
    return this.chatSDK.getMembers(String(chatId) as any, limit, page);
  }

  public async addMember(chatId: number, memberId: number) {
    return this.chatSDK.addMember(String(chatId) as any, memberId);
  }

  public async removeMember(chatId: number, memberId: number) {
    return this.chatSDK.removeMember(String(chatId) as any, memberId);
  }

  public async getChats(limit?: number, page?: number) {
    return this.chatSDK.getChats(limit, page);
  }

  public async findChatByReceiver(receiverId: number) {
    return this.chatSDK.findChatByReceiver(receiverId);
  }

  public async addChat(receiverId: number, content?: string) {
    return this.chatSDK.addChat(receiverId, content);
  }

  public async addGroup(
    memberIds: number[],
    name: string,
    avatar?: string,
    userId?: number,
  ) {
    return this.chatSDK.addGroup(memberIds, name, avatar, userId);
  }

  public async updateGroup(chatId: number, name: string, avatar?: string) {
    return this.chatSDK.updateGroup(chatId, name, avatar);
  }

  public async removeChat(chatId: number) {
    return this.chatSDK.removeChat(chatId);
  }

  public async readChat(chatId: number) {
    return this.chatSDK.readChat(chatId);
  }

  public async unreadChat(chatId: number) {
    return this.chatSDK.unreadChat(chatId);
  }

  public async getMessages(chatId: number, limit?: number, page?: number) {
    return this.chatSDK.getMessages(chatId, limit, page);
  }

  public async addMessage(
    chatId: number,
    content?: string | null,
    files?: FileList,
    replyId?: number,
  ) {
    return this.chatSDK.addMessage(chatId, content, files, replyId);
  }

  public async actionMessage(
    chatId: number,
    messageId: number,
    action: 'like' | 'love' | 'revoke' | 'remove',
  ) {
    return this.chatSDK.actionMessage(chatId, messageId, action);
  }

  addEventListener(event: string, listener: (data: unknown) => void) {
    this.chatSDK.addEventListener(event, listener);
  }

  removeEventListener(
    event: string,
    listener?: (data: unknown) => void | null,
  ) {
    this.chatSDK.removeEventListener(event, listener);
  }

  runEvent(name: string, data?: unknown) {
    this.chatSDK.runEvent(name, data);
  }

  setConfig(config: {
    debugMode?: boolean;
    maxRetries?: number;
    [key: string]: unknown;
  }) {
    this.chatSDK.setConfig(config);
  }
}

export const chatSDK = ChatService.getInstance();
