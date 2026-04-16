import { useState } from 'react';
import { ChatSidebar, ChatWindow } from '../../components/chat';
import { toast } from 'react-toastify';

interface IChatItem {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount?: number;
  isGroup?: boolean;
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isCurrentUser?: boolean;
}

const getInitialMessages = (): Message[] => [
  {
    id: 1,
    senderId: 2,
    senderName: 'Nguyễn Văn A',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    content: 'Xin chào bạn!',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isCurrentUser: false,
  },
  {
    id: 2,
    senderId: 1,
    senderName: 'Bạn',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
    content: 'Xin chào! Bạn khỏe không?',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    isCurrentUser: true,
  },
  {
    id: 3,
    senderId: 2,
    senderName: 'Nguyễn Văn A',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    content: 'Tôi khỏe, cảm ơn bạn nhé!',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    isCurrentUser: false,
  },
];

export const Chat = () => {
  const [chats, setChats] = useState<IChatItem[]>([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      lastMessage: 'Cảm ơn bạn nhé!',
      unreadCount: 2,
      isGroup: false,
    },
    {
      id: 2,
      name: 'Project Team',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      lastMessage: 'Cuộc họp diễn ra lúc 3 giờ chiều',
      unreadCount: 5,
      isGroup: true,
    },
    {
      id: 3,
      name: 'Lê Thị B',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      lastMessage: 'OK, tôi sẽ làm ngay',
      unreadCount: 0,
      isGroup: false,
    },
  ]);

  const [activeChatId, setActiveChatId] = useState<number | undefined>(
    chats[0]?.id,
  );
  const [messages, setMessages] = useState<Message[]>(getInitialMessages());

  const [isLoading, setIsLoading] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    // Simulate loading messages
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteChat = (chatId: number) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      const remainingChat = chats.find((chat) => chat.id !== chatId);
      setActiveChatId(remainingChat?.id);
    }
    toast.success('Đã xóa cuộc trò chuyện');
  };

  const handleCreateNewChat = () => {
    toast.info('Tính năng tạo chat mới sẽ sớm được cập nhật');
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      senderId: 1,
      senderName: 'Bạn',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
      content,
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
    };

    setMessages((prev) => [...prev, newMessage]);

    // Update last message in chat list
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, lastMessage: content, unreadCount: 0 }
          : chat,
      ),
    );

    // Simulate reply
    setTimeout(() => {
      const reply: Message = {
        id: messages.length + 2,
        senderId: activeChatId || 2,
        senderName: activeChat?.name || 'Người dùng',
        senderAvatar: activeChat?.avatar,
        content: 'Cảm ơn bạn đã gửi tin nhắn!',
        timestamp: new Date().toISOString(),
        isCurrentUser: false,
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  return (
    <div className="h-screen flex gap-0 bg-white no-header hidden-y hidden-x">
      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block md:w-80 lg:w-96 flex-shrink-0">
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          isLoading={isLoading}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onCreateNewChat={handleCreateNewChat}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow
          chatId={activeChatId}
          chatName={activeChat?.name}
          chatAvatar={activeChat?.avatar}
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};
