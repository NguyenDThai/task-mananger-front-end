import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import type { RootState } from '../../redux/store';
import { LiveChatWidget } from './LiveChatWidget';
import { chat } from '../../services/chatService';
import {
  addChat,
  removeChat,
  removeMessage,
  setCurrentChat,
  setCurrentChatMessages,
  setMessagesPagination,
  prependMessages,
  setCurrentChatMembers,
} from '../../redux/slides/chat/chatSlide';
import type { ISChatUser, TMessageAction } from '../../types/chat.type';

interface LiveChatWidgetContainerProps {
  /**
   * Chỉ hiển thị Live Chat Widget khi đã đăng nhập
   */
  enabledOnlyIfLoggedIn?: boolean;
}

/**
 * Container component để quản lý Live Chat Widget
 * Kết nối Redux store và xử lý các sự kiện chat
 */
export const LiveChatWidgetContainer = ({
  enabledOnlyIfLoggedIn = true,
}: LiveChatWidgetContainerProps) => {
  const dispatch = useDispatch();
  const {
    currentUser,
    chats,
    currentChat,
    currentChatMessages,
    members,
    messagesPagination,
  } = useSelector((state: RootState) => state.chat);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);

  // Lấy messages từ store khi currentChat thay đổi
  useEffect(() => {
    const loadMessages = async () => {
      if (currentChat?.id) {
        // Clear old messages immediately when changing chat
        dispatch(setCurrentChatMessages([]));
        dispatch(setMessagesPagination(null));
        dispatch(setCurrentChatMembers([]));
        setIsLoading(true);

        // Fetch messages for the selected chat
        try {
          const { data: messagesList, pagination } = await chat.getMessages(
            currentChat.id,
            20,
            1,
          );
          if (currentChat.new[currentUser?.id as number]) {
            await chat.readChat(currentChat.id);
          }

          dispatch(setCurrentChatMessages(messagesList));

          if (pagination) {
            dispatch(setMessagesPagination(pagination));
          }

          if (currentChat.type === 'group') {
            const { data: members } = await chat.getMembers(
              currentChat.id,
              20,
              1,
            );
            dispatch(setCurrentChatMembers(members));
          } else {
            dispatch(setCurrentChatMembers(currentChat.members));
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          dispatch(setCurrentChatMessages([]));
          dispatch(setMessagesPagination(null));
          dispatch(setCurrentChatMembers([]));
        } finally {
          setIsLoading(false);
        }
      } else {
        dispatch(setCurrentChatMessages([]));
        dispatch(setMessagesPagination(null));
        dispatch(setCurrentChatMembers([]));
      }
    };

    loadMessages();
  }, [currentChat?.id, dispatch]);

  // Xử lý chọn chat
  const handleSelectChat = async (chatId: number) => {
    const selectedChat = chats.find((c) => c.id === chatId);
    if (!selectedChat) return;

    try {
      dispatch(setCurrentChat(selectedChat));
    } catch (error) {
      console.error('Failed to select chat:', error);
    }
  };

  // Xử lý xóa chat
  const handleDeleteChat = async (chatId: number) => {
    try {
      await chat.removeChat(chatId);
      dispatch(removeChat(chatId));
      if (currentChat?.id === chatId) {
        dispatch(setCurrentChat(null));
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  // Xử lý gửi tin nhắn
  const handleSendMessage = async (
    chatId: number,
    content: string,
    files: File[],
    replyId?: number | null,
  ) => {
    try {
      // Gửi tin nhắn
      await chat.addMessage(
        chatId,
        content,
        files.length > 0 ? files : null,
        replyId,
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Xử lý hành động tin nhắn (like, love, revoke, remove...)
  const handleMessageAction = async (
    messageId: number,
    action: TMessageAction,
  ) => {
    try {
      if (currentChat?.id) {
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
      }
    } catch (error) {
      console.error(`Failed to perform action ${action}:`, error);
    }
  };

  // Xử lý tạo chat mới
  const handleCreateNewChat = async (
    receivers: ISChatUser[],
    groupName?: string,
  ) => {
    try {
      if (receivers.length === 1 && receivers[0].id) {
        // Tạo chat 1-1
        const { data } = await chat.addChat(receivers[0].id);
        dispatch(addChat(data));
        dispatch(setCurrentChat(data));
      } else if (receivers.length > 1) {
        // Tạo nhóm chat
        const memberIds = receivers
          .filter((r) => r.id !== undefined)
          .map((r) => r.id as number);
        const { data } = await chat.addGroup(
          memberIds,
          groupName || `Group ${new Date().toLocaleDateString()}`,
        );
        dispatch(addChat(data));
        dispatch(setCurrentChat(data));
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  // Xử lý load tin nhắn cũ (infinite scroll)
  const handleLoadOldMessages = async () => {
    if (
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
        dispatch(prependMessages(messagesList));
        if (pagination) {
          dispatch(setMessagesPagination(pagination));
        }
      }
    } catch (error) {
      console.error('Failed to load old messages:', error);
    } finally {
      setIsLoadingOldMessages(false);
    }
  };

  // Nếu bật chỉ khi đã đăng nhập và chưa đăng nhập thì không hiển thị
  if (enabledOnlyIfLoggedIn && !currentUser?.id) {
    return null;
  }

  return (
    <LiveChatWidget
      chats={chats}
      members={members}
      isLoading={isLoading}
      isLoadingOldMessages={isLoadingOldMessages}
      currentChat={currentChat}
      currentUser={currentUser}
      messages={currentChatMessages}
      onSelectChat={handleSelectChat}
      onDeleteChat={handleDeleteChat}
      onSendMessage={handleSendMessage}
      onMessageAction={handleMessageAction}
      onCreateNewChat={handleCreateNewChat}
      onLoadOldMessages={handleLoadOldMessages}
    />
  );
};
