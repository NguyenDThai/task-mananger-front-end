import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { type ISChatInstance } from '../types';

interface ChatContextValue {
  chat: ISChatInstance | null;
}

const ChatContext = createContext<ChatContextValue>({ chat: null });

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasSDK, setHasSDK] = useState(typeof window.initSChat !== 'undefined');

  useEffect(() => {
    if (!hasSDK) {
      const timer = setInterval(() => {
        if (typeof window.initSChat !== 'undefined') {
          setHasSDK(true);
          clearInterval(timer);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [hasSDK]);

  const chat = useMemo(() => {
    if (!hasSDK) return null;
    return new window.initSChat();
  }, [hasSDK]);

  return (
    <ChatContext.Provider value={{ chat }}>{children}</ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
