import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import type {
  IChatItem,
  IMessageItem,
  ISChatEventPayloads,
  ISChatUser,
} from '../../types/chat.type';
import { ChatSidebar, ChatWindow, NewChatWindow } from '../../components/chat';
import { toast } from 'react-toastify';

export const Chat = () => {
  const chat = useSelector((state: RootState) => state.chat.instance);
  const [chats, setChats] = useState<IChatItem[]>([]);
  const [currentChat, setCurrentChat] = useState<IChatItem | null>(null);
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<ISChatUser | null>(null);
  const [, setReceiver] = useState<ISChatUser | null>(null);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [members, setMembers] = useState<ISChatUser[]>([]);

  // Load chats from chat SDK
  useEffect(() => {
    const loadChats = async () => {
      if (!chat) return;

      try {
        setIsLoading(true);
        // Get current user
        const user = await chat.getAuth();
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

    const timer = setTimeout(() => {
      loadChats();
    }, 1000);
    return () => clearTimeout(timer);
  }, [chat]);

  // Load members for new chat window
  useEffect(() => {
    const loadMembers = async () => {
      if (!chat) return;

      try {
        const response = await chat.getMembers(null, 0, 1);
        const membersList = response?.data || [];

        setMembers(membersList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thành viên:', error);
      }
    };

    if (isCreatingNewChat && currentUser?.code) {
      loadMembers();
    }
  }, [isCreatingNewChat, chat, currentUser?.code, chats]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!chat || !currentChat?.id) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await chat.getMessages(currentChat.id, 20, 1);

        if (isMounted) {
          const messagesList = response?.data || [];
          setMessages(messagesList.toReversed());
        }
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
        setMessages([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [currentChat?.id, chat]);

  useEffect(() => {
    if (!chat || !currentChat) return;

    const setupReceiver = async () => {
      try {
        chat.clearReceiver();

        if (currentChat.type !== 'single') {
          setReceiver(null);
          return;
        }

        const otherMember = currentChat.members?.find(
          (member) => member.code !== currentUser?.code,
        );

        if (otherMember) {
          await chat.setReceiver(otherMember);
          setReceiver(otherMember);
        }
      } catch (error) {
        console.error('Lỗi khi thiết lập receiver:', error);
      }
    };

    setupReceiver();
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

  const handleDeleteChat = async (chatId: number) => {
    if (!chat) return;

    try {
      await chat.removeChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (currentChat?.id === chatId) {
        const remainingChat = chats.find((chat) => chat.id !== chatId);
        setCurrentChat(remainingChat || null);
      }
      toast.success('Đã xóa cuộc trò chuyện');
    } catch (error) {
      console.error('Lỗi khi xóa cuộc trò chuyện:', error);
    }
  };

  const handleCreateNewChat = () => {
    setIsCreatingNewChat(true);
  };

  const handleSelectReceiver = async (receiver: ISChatUser) => {
    if (!chat || !receiver.id) return;

    try {
      setIsLoading(true);
      // Create new chat with receiver
      const newChat = await chat.addChat(receiver.id);
      setCurrentChat(newChat.data);
      setChats((prev) => [newChat.data, ...prev]);
      setIsCreatingNewChat(false);
      toast.success(`Đã tạo cuộc trò chuyện với ${receiver.name}`);
    } catch (error) {
      console.error('Lỗi khi tạo cuộc trò chuyện:', error);
      toast.error('Không thể tạo cuộc trò chuyện');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromNewChat = () => {
    setIsCreatingNewChat(false);
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
          activeChat={currentChat}
          currentUser={currentUser}
          isLoading={isLoading}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onCreateNewChat={handleCreateNewChat}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col">
        {isCreatingNewChat ? (
          <NewChatWindow
            members={members}
            isLoading={isLoading}
            onSelectReceiver={handleSelectReceiver}
            onBack={handleBackFromNewChat}
          />
        ) : (
          <ChatWindow
            chatId={currentChat?.id}
            chatName={getActiveChatName()}
            chatAvatar={getActiveChatAvatar()}
            messages={messages}
            isLoading={isLoading}
            currentUserId={currentUser?.id}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};
