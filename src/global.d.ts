import { ISChatConstructor } from './config/chat.config';

declare global {
  interface Window {
    initSChat: ISChatConstructor;
  }
}

export {};
