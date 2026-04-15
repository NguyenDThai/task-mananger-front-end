import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  initializeChatStart,
  initializeChatSuccess,
  initializeChatFailure,
} from '../redux/slides/chat/chatSlide';
import type { RootState } from '../redux/store';

/**
 * Hook để khởi tạo và quản lý chat instance
 * Tự động khởi tạo chat khi window.initSChat có sẵn
 */
export const useInitializeChat = () => {
  const dispatch = useDispatch();
  const { instance, isInitialized, isLoading } = useSelector(
    (state: RootState) => state.chat,
  );

  useEffect(() => {
    // Nếu đã khởi tạo hoặc đang khởi tạo, không làm gì
    if (isInitialized || isLoading) return;

    // Hàm để khởi tạo chat
    const initializeChat = () => {
      if (typeof window.initSChat === 'undefined') {
        return;
      }

      try {
        dispatch(initializeChatStart());
        const chatInstance = new window.initSChat();
        dispatch(initializeChatSuccess(chatInstance));
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        dispatch(initializeChatFailure());
      }
    };

    // Kiểm tra xem window.initSChat có sẵn không
    if (typeof window.initSChat !== 'undefined') {
      initializeChat();
    } else {
      // Nếu chưa có, lắng nghe sự kiện load
      const checkInterval = setInterval(() => {
        if (typeof window.initSChat !== 'undefined') {
          initializeChat();
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [isInitialized, isLoading, dispatch]);

  return { instance, isInitialized, isLoading };
};
