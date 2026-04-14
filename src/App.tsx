import { useEffect, useRef } from 'react';
import type { ISChatInstance } from './config/chat.config';

const ChatComponent = () => {
  // Dùng useRef để lưu trữ instance, tránh việc khởi tạo lại khi component re-render
  const chatRef = useRef<ISChatInstance | null>(null);

  useEffect(() => {
    if (typeof window.initSChat !== 'undefined') {
      // Khởi tạo
      chatRef.current = new window.initSChat();
    }
  }, []);

  const handleSendMessage = async () => {
    if (chatRef.current) {
      // Bây giờ bạn gõ chatRef.current. là nó sẽ gợi ý các hàm như addMessage, setAuth...
      await chatRef.current.addMessage(123, 'hello world');
    }
  };

  return (
    <div>
      {/* Giao diện chat của bạn */}
      <button onClick={handleSendMessage}>Gửi tin nhắn</button>
    </div>
  );
};

const App = () => {
  return <ChatComponent />;
};

export default App;
