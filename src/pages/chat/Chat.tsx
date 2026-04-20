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
  removeMessage,
  setMessagesPagination,
  prependMessages,
} from '../../redux/slides/chat/chatSlide';
import type { ISChatUser, TMessageAction } from '../../types';

export const Chat = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState({
    sidebar: false,
    chatWindow: false,
  });
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);

  const {
    chats,
    members,
    currentUser,
    currentChat,
    currentChatMessages,
    messagesPagination,
  } = useSelector((state: RootState) => state.chat);

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

  const handleSelectReceiver = async (
    receivers: ISChatUser[],
    chatName?: string,
  ) => {
    setIsLoading((prev) => ({ ...prev, chatWindow: true }));

    if (!chat) {
      setIsLoading((prev) => ({ ...prev, chatWindow: false }));
      return;
    }

    try {
      if (receivers.length === 0 || receivers.some((r) => !r.id)) {
        setIsLoading((prev) => ({ ...prev, chatWindow: false }));
        return;
      }

      const isGroup = receivers.length > 1;
      let targetChat;
      let isNewChat = false;
      let toastMessage = '';

      if (isGroup) {
        const memberIds = receivers
          .filter((r) => r.id !== undefined)
          .map((r) => r.id as number);

        // Use provided chatName or generate from member names
        const finalGroupName =
          chatName || receivers.map((r) => r.name).join(', ');

        const response = await chat.addGroup(memberIds, finalGroupName);
        targetChat = response.data;
        isNewChat = true;
        toastMessage = `Đã tạo nhóm với ${receivers.length} thành viên`;
      } else {
        const [singleReceiver] = receivers;
        const foundChat = chats.find(
          (c) =>
            c.type === 'single' &&
            c.members?.some((m) => m.id === singleReceiver.id),
        );

        if (foundChat) {
          // Chat đã tồn tại
          targetChat = foundChat;
        } else {
          // Tạo single chat mới
          const { data } = await chat.addChat(singleReceiver.id as number);
          targetChat = data;
          isNewChat = true;
          toastMessage = `Đã tạo cuộc trò chuyện với ${singleReceiver.name}`;
        }
      }

      await chat.readChat(targetChat.id);

      if (isNewChat) {
        const now = new Date().toISOString();
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
            date: now,
            updated_at: now,
            created_at: now,
          },
        };

        dispatch(addChat(targetChat));
        toast.success(toastMessage);
      }

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
        dispatch(setMessagesPagination(null));
        setIsLoading((prev) => ({ ...prev, chatWindow: false }));
        return;
      }

      try {
        const response = await chat.getMessages(currentChat.id, 20, 1);
        const messagesList = response?.data || [];
        const pagination = response?.pagination;
        dispatch(setCurrentChatMessages(messagesList.toReversed()));
        if (pagination) {
          dispatch(setMessagesPagination(pagination));
        }
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
        dispatch(setCurrentChatMessages([]));
        dispatch(setMessagesPagination(null));
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

    await chat.readChat(selectedChat.id);
    dispatch(setCurrentChat(selectedChat));
  };

  const switchToNewChatWindow = () => {
    setIsCreatingNewChat(true);
  };

  const switchBack = () => {
    setIsCreatingNewChat(false);
  };

  const handleSendMessage = async (
    content: string,
    files: File[],
    replyId?: number | null,
  ) => {
    if (!currentUser || !chat || !currentChat) return;
    try {
      // Gửi message với content (bắt buộc), files (có thể rỗng) và replyId (tùy chọn)
      await chat?.addMessage(
        currentChat.id,
        content,
        files.length > 0 ? files : null,
        replyId,
      );
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const handleMessageAction = async (
    messageId: number,
    action: TMessageAction,
  ) => {
    if (!chat || !currentChat?.id) return;

    try {
      await chat.actionMessage(currentChat.id, messageId, action);
      if (action === 'revoke' || action === 'remove') {
        dispatch(
          removeMessage({
            chat_id: currentChat.id,
            message_id: messageId,
            type: action,
          }),
        );
      }

      toast.success(
        `Tin nhắn ${action === 'like' ? 'đã được thích' : action === 'love' ? 'đã được yêu thích' : action === 'revoke' ? 'đã được thu hồi' : 'đã bị xóa'}`,
      );
    } catch (error) {
      console.error(`Lỗi khi ${action}:`, error);
      toast.error(
        `Không thể ${action === 'like' ? 'thích' : action === 'love' ? 'yêu thích' : action === 'revoke' ? 'thu hồi' : 'xóa'} tin nhắn`,
      );
    }
  };

  const handleLoadOldMessages = async () => {
    if (
      !chat ||
      !currentChat?.id ||
      !messagesPagination ||
      isLoadingOldMessages ||
      currentChatMessages.length === 0
    ) {
      return;
    }

    // Check if there are more pages to load
    if (messagesPagination.current_page >= messagesPagination.total_pages) {
      return;
    }

    setIsLoadingOldMessages(true);

    try {
      const nextPage = messagesPagination.current_page + 1;
      const response = await chat.getMessages(currentChat.id, 20, nextPage);
      const messagesList = response?.data || [];
      const pagination = response?.pagination;

      if (messagesList.length > 0) {
        dispatch(prependMessages(messagesList.toReversed()));
        if (pagination) {
          dispatch(setMessagesPagination(pagination));
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn cũ:', error);
      toast.error('Không thể tải tin nhắn cũ');
    } finally {
      setIsLoadingOldMessages(false);
    }
  };

  return (
    <div className="h-screen flex gap-0 no-header hidden-y hidden-x">
      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block md:w-64 lg:w-80 flex-shrink-0">
        <ChatSidebar
          chats={chats.filter((c) => c.message !== null || c.type === 'group')}
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
            chatUnread={currentChat?.new}
            chatName={getActiveChatName()}
            chatAvatar={getActiveChatAvatar()}
            messages={currentChatMessages}
            isLoading={isLoading.chatWindow}
            isLoadingOldMessages={isLoadingOldMessages}
            currentUserId={currentUser?.id}
            onSendMessage={handleSendMessage}
            onMessageAction={handleMessageAction}
            onLoadOldMessages={handleLoadOldMessages}
          />
        )}
      </div>
    </div>
  );
};
