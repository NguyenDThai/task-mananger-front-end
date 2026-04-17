import type { ISChatInstance } from '../types';

class ChatService {
  private static instance: ChatService;
  private chatSDK: ISChatInstance;

  private constructor() {
    if (typeof window === 'undefined' || !window.initSChat) {
      throw new Error('SChat SDK is not available');
    }

    this.chatSDK = new window.initSChat();
    this.chatSDK.setConfig({ debugMode: true });
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public getSDK(): ISChatInstance {
    return this.chatSDK;
  }
}

export const chat = ChatService.getInstance().getSDK();
