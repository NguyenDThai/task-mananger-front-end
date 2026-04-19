import { ChatSidebar, ChatWindow, NewChatWindow } from '../../components/chat';
import { chat } from '../../services/chatService';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import {
  setCurrentChat,
  setCurrentChatMessages,
  removeChat,
  addChat,
} from '../../redux/slides/chat/chatSlide';
import type { ISChatUser } from '../../types';

export const Chat = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState({
    sidebar: false,
    chatWindow: false,
  });
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

  const { chats, members, currentUser, currentChat, currentChatMessages } =
    useSelector((state: RootState) => state.chat);

  const handleDeleteChat = async (chatId: number) => {
    if (!chat) return;

    try {
      await chat.removeChat(chatId);
      dispatch(removeChat(chatId));
      toast.success('Đã xóa cuộc trò chuyện');
    } catch (error) {
      console.error('Lỗi khi xóa cuộc trò chuyện:', error);
    }
  };

  const handleSelectReceiver = async (receiver: ISChatUser) => {
    setIsLoading((prev) => ({ ...prev, chatWindow: true }));

    if (!chat || !receiver.id) {
      setIsLoading((prev) => ({ ...prev, chatWindow: false }));
      return;
    }

    try {
      let targetChat = chats.find(
        (c) =>
          c.type === 'single' && c.members?.find((m) => m.id === receiver.id),
      );

      if (!targetChat) {
        const responseTargetChat = await chat.addChat(receiver.id);
        targetChat = responseTargetChat.data;
        toast.success(`Đã tạo cuộc trò chuyện với ${receiver.name}`);
      }

      targetChat = {
        ...targetChat,
        message: {
          id: 0,
          content: '',
          type: 'text',
          action: [],
          member: currentUser as ISChatUser,
          revoke: false,
          remove: false,
          date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      };
      dispatch(addChat(targetChat));
      dispatch(setCurrentChat(targetChat));
    } catch (error) {
      console.error('Lỗi khi tạo cuộc trò chuyện:', error);
      toast.error('Không thể tạo cuộc trò chuyện');
    } finally {
      setIsCreatingNewChat(false);
      setIsLoading((prev) => ({ ...prev, chatWindow: false }));
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading((prev) => ({ ...prev, chatWindow: true }));

      if (!currentChat?.id) {
        dispatch(setCurrentChatMessages([]));
        setIsLoading((prev) => ({ ...prev, chatWindow: false }));
        return;
      }

      try {
        const response = await chat.getMessages(currentChat.id, 20, 1);
        const messagesList = response?.data || [];
        dispatch(setCurrentChatMessages(messagesList.toReversed()));
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
        dispatch(setCurrentChatMessages([]));
      } finally {
        setIsLoading((prev) => ({ ...prev, chatWindow: false }));
      }
    };

    loadMessages();
  }, [currentChat?.id, dispatch]);

  // Get chat name from members or use default
  const getActiveChatName = () => {
    if (!currentChat) return 'Chat';
    if (currentChat.type === 'group') {
      return `${currentChat.name || 'Nhóm trò chuyện'}`;
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

  const handleSelectChat = async (chatId: number) => {
    const selectedChat = chats.find((chat) => chat.id === chatId);
    if (!selectedChat) return;
    dispatch(setCurrentChat(selectedChat));
  };

  const switchToNewChatWindow = () => {
    setIsCreatingNewChat(true);
  };

  const switchBack = () => {
    setIsCreatingNewChat(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser || !chat || !currentChat) return;
    await chat?.addMessage(currentChat.id, content);
  };

  return (
    <div className="h-screen flex gap-0 no-header hidden-y hidden-x">
      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block md:w-64 lg:w-80 flex-shrink-0">
        <ChatSidebar
          chats={chats.filter((c) => c.message !== null)}
          activeChat={currentChat}
          currentUser={currentUser}
          isLoading={isLoading.sidebar}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onCreateNewChat={switchToNewChatWindow}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col">
        {isCreatingNewChat ? (
          <NewChatWindow
            members={members}
            isLoading={isLoading.chatWindow}
            onSelectReceiver={handleSelectReceiver}
            onBack={switchBack}
          />
        ) : (
          <ChatWindow
            chatId={currentChat?.id}
            chatName={getActiveChatName()}
            chatAvatar={getActiveChatAvatar()}
            messages={currentChatMessages}
            isLoading={isLoading.chatWindow}
            currentUserId={currentUser?.id}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};
