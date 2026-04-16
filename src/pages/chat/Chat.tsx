import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import type {
  IChatItem,
  IMessageItem,
  ISChatEventPayloads,
  ISChatUser,
} from '../../types/chat.type';
import { ChatSidebar, ChatWindow } from '../../components/chat';
import { toast } from 'react-toastify';

export const Chat = () => {
  const chat = useSelector((state: RootState) => state.chat.instance);
  const [chats, setChats] = useState<IChatItem[]>([]);
  const [currentChat, setCurrentChat] = useState<IChatItem | null>(null);
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<ISChatUser | null>(null);
  const [, setReceiver] = useState<ISChatUser | null>(null);

  // Load chats from chat SDK
  useEffect(() => {
    const loadChats = async () => {
      if (!chat) return;

      try {
        setIsLoading(true);

        // Get current user
        const user = chat.getAuth();
        setCurrentUser(user);

        const response = await chat.getChats(10, 1);

        const chatsList = response?.data || [];

        setChats(chatsList);
        // Set first chat as active
        if (chatsList.length > 0) {
          setCurrentChat(chatsList[0]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chat:', error);
        toast.error('Không thể tải danh sách chat');
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(() => {
      loadChats();
    }, 1000);
  }, [chat]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!currentChat || !chat) return;

    const loadMessages = async () => {
      try {
        setIsLoading(true);

        chat.clearReceiver();

        // Set new receiver for single chat
        if (currentChat.type === 'single') {
          const otherMember = currentChat.members?.find(
            (member) => member.code !== currentUser?.code,
          );
          if (otherMember) {
            await chat.setReceiver(otherMember);
            setReceiver(otherMember);
          }
        } else {
          setReceiver(null);
        }

        // console.log('Thông tin cuộc trò chuyện:', currentChat);

        // const receiverInfo = await chat.getReceiver();
        // console.log('Thông tin người nhận:', receiverInfo);

        const response = await chat.getMessages(currentChat.id, 20, 1);

        const messagesList = response?.data || [];
        // console.log('Tin nhắn đã được tải:', messagesList);

        setMessages(messagesList.toReversed());
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [currentChat, chat, currentUser?.code]);

  useEffect(() => {
    if (!chat) return;

    const handleNewMessage = (
      payload: ISChatEventPayloads['chats.message'],
    ) => {
      const { chat: chatInfo, message } = payload;

      setMessages((prev) => {
        const isExisted = prev.find((m) => m.id === message.id);
        if (isExisted) return prev;
        return Number(chatInfo.id) === Number(currentChat?.id)
          ? [...prev, message]
          : prev;
      });
    };

    chat.addEventListener('chats.message', handleNewMessage);
    return () => chat.removeEventListener('chats.message', handleNewMessage);
  }, [chat, currentChat?.id]);

  // Get chat name from members or use default
  const getActiveChatName = () => {
    if (!currentChat) return 'Chat';
    if (currentChat.type === 'group') {
      return `Nhóm (${currentChat.members?.length || 0} thành viên)`;
    }
    // For single chat, get the other member's name
    const otherMember = currentChat.members?.find(
      (member) => member.code !== currentUser?.code,
    );
    return otherMember?.name || 'Chat';
  };

  // Get chat avatar from first member
  const getActiveChatAvatar = () => {
    const otherMember = currentChat?.members?.find(
      (member) => member.code !== currentUser?.code,
    );
    return otherMember?.avatar;
  };

  const handleSelectChat = (chatId: number) => {
    const selectedChat = chats.find((chat) => chat.id === chatId);
    if (selectedChat) {
      setCurrentChat(selectedChat);
    }
  };

  const handleDeleteChat = (chatId: number) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChat?.id === chatId) {
      const remainingChat = chats.find((chat) => chat.id !== chatId);
      setCurrentChat(remainingChat || null);
    }
    toast.success('Đã xóa cuộc trò chuyện');
  };

  const handleCreateNewChat = () => {
    toast.info('Tính năng tạo chat mới sẽ sớm được cập nhật');
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser || !chat || !currentChat) return;
    const newMessageResponse = await chat?.addMessage(currentChat.id, content);
    console.warn('Tin nhắn mới đã được gửi:', newMessageResponse);
  };

  return (
    <div className="h-screen flex gap-0 no-header hidden-y hidden-x">
      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block md:w-64 lg:w-80 flex-shrink-0">
        <ChatSidebar
          chats={chats}
          activeChatId={currentChat?.id}
          isLoading={isLoading}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onCreateNewChat={handleCreateNewChat}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow
          chatId={currentChat?.id}
          chatName={getActiveChatName()}
          chatAvatar={getActiveChatAvatar()}
          messages={messages}
          isLoading={isLoading}
          currentUserId={currentUser?.id}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};
