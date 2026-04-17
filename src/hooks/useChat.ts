import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { chat } from '../services/chatService';
import {
  addNewMessage,
  setChats,
  setCurrentChat,
  setCurrentChatMessages,
  setMembers,
  removeChat,
  addChat,
} from '../redux/slides/chat/chatSlide';
import type { ISChatEventPayloads, ISChatUser } from '../types';

export const useChat = () => {
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
    if (!chat || !receiver.id) return;

    try {
      setIsLoading((prev) => ({ ...prev, chatWindow: true }));
      // Create new chat with receiver
      const newChat = await chat.addChat(receiver.id);
      dispatch(addChat(newChat));
      dispatch(setCurrentChat(newChat));
      setIsCreatingNewChat(false);
      toast.success(`Đã tạo cuộc trò chuyện với ${receiver.name}`);
    } catch (error) {
      console.error('Lỗi khi tạo cuộc trò chuyện:', error);
      toast.error('Không thể tạo cuộc trò chuyện');
    } finally {
      setIsLoading((prev) => ({ ...prev, chatWindow: false }));
    }
  };

  useEffect(() => {
    const loadChats = async () => {
      if (!currentUser) return;

      try {
        setIsLoading((prev) => ({ ...prev, sidebar: true, chatWindow: true }));
        const response = await chat.getChats(10, 1);

        const chatsList = response?.data || [];
        dispatch(setChats(chatsList));
        // Set first chat as active
        if (chatsList.length > 0) {
          dispatch(setCurrentChat(chatsList[0]));
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chat:', error);
      } finally {
        setIsLoading((prev) => ({
          ...prev,
          sidebar: false,
          chatWindow: false,
        }));
      }
    };

    loadChats();
  }, [currentUser, dispatch]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!currentUser) return;

      try {
        const response = await chat.getMembers();
        const membersList = response?.data || [];

        dispatch(setMembers(membersList));
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thành viên:', error);
      }
    };

    loadMembers();
  }, [currentUser, dispatch]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChat?.id) {
        dispatch(setCurrentChatMessages([]));
        return;
      }

      try {
        setIsLoading((prev) => ({ ...prev, chatWindow: true }));
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

  useEffect(() => {
    const handleNewMessage = (
      payload: ISChatEventPayloads['chats.message'],
    ) => {
      const { message } = payload;
      dispatch(addNewMessage(message));
    };

    chat.addEventListener('chats.message', handleNewMessage);
    return () => chat.removeEventListener('chats.message', handleNewMessage);
  }, [currentChat?.id, dispatch]);

  return {
    isLoading,
    isCreatingNewChat,
    setIsCreatingNewChat,
    currentUser,
    chats,
    currentChat,
    currentChatMessages,
    members,
    dispatch,
    handleSelectReceiver,
    handleDeleteChat,
  };
};
