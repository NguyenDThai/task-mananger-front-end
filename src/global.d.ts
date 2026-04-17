import { ISChatConstructor } from './types';

declare global {
  interface Window {
    initSChat: ISChatConstructor;
  }
}

export {};
