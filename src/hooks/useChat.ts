import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useEffect } from 'react';
import { chat as chatService } from '../services/chatService';
import {
  addNewMessage,
  addChat,
  setCurrentUser,
  updateChat,
  removeChat,
  removeMessage,
  updateMessage,
} from '../redux/slides/chat/chatSlide';
import type { ISChatEventPayloads, User } from '../types';

export const useChat = () => {
  const dispatch = useDispatch();
  const { currentUser, chats, currentChat } = useSelector(
    (state: RootState) => state.chat,
  );

  const setChatAuth = async (user: User) => {
    if (!user._id || !user.name) return;
    try {
      const currentUserData = await chatService.setAuth({
        code: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
      });

      dispatch(setCurrentUser(currentUserData));
    } catch (error) {
      console.error('Failed to init chat:', error);
    }
  };

  useEffect(() => {
    async function handleNewMessage(
      payload: ISChatEventPayloads['chats.message'],
    ) {
      const { chat, message, type, chat_id, message_id } = payload;
      console.warn('Chat new message event:', payload);
      if (type === 'add') {
        if (currentChat && chat.id === currentChat.id) {
          await chatService.readChat(chat.id);
        }
        dispatch(
          addNewMessage({
            chat,
            message,
          }),
        );
        return;
      }

      if (type === 'remove' || type === 'revoke') {
        dispatch(
          removeMessage({
            chat_id,
            message_id,
            type,
          }),
        );
        return;
      }

      if (type === 'love' || type === 'like') {
        dispatch(updateMessage({ chat_id, message }));
        return;
      }
    }

    chatService.addEventListener('chats.message', handleNewMessage);
    return () =>
      chatService.removeEventListener('chats.message', handleNewMessage);
  }, [currentUser?.id, currentChat?.id, dispatch]);

  useEffect(() => {
    const handleNewChat = (payload: ISChatEventPayloads['chats.created']) => {
      const { chat } = payload;
      console.warn('New chat created:', chat);
      dispatch(addChat(chat));
    };

    chatService.addEventListener('chats.created', handleNewChat);
    return () =>
      chatService.removeEventListener('chats.created', handleNewChat);
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    const handleUpdateChat = (
      payload: ISChatEventPayloads['chats.updated'],
    ) => {
      const { chat } = payload;
      console.warn('Chat updated:', chat);
      dispatch(updateChat(chat));
    };

    chatService.addEventListener('chats.updated', handleUpdateChat);
    return () =>
      chatService.removeEventListener('chats.updated', handleUpdateChat);
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    const handleDeleteChat = (
      payload: ISChatEventPayloads['chats.deleted'],
    ) => {
      const { chat_id } = payload;
      console.warn('Chat deleted:', payload);
      const chat = chats.find((c) => c.id === chat_id);
      if (!chat || chat.type !== 'group') {
        return;
      }

      dispatch(removeChat(chat_id));
    };

    chatService.addEventListener('chats.deleted', handleDeleteChat);
    return () =>
      chatService.removeEventListener('chats.deleted', handleDeleteChat);
  }, [currentUser?.id, chats, dispatch]);

  useEffect(() => {
    const handleMemberChat = (payload: ISChatEventPayloads['chats.member']) => {
      // const { chat_id, type, member, member_id } = payload;
      console.warn('Chat member event:', payload);
    };

    chatService.addEventListener('chats.member', handleMemberChat);
    return () =>
      chatService.removeEventListener('chats.member', handleMemberChat);
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    const handleActionChat = (payload: ISChatEventPayloads['chats.action']) => {
      const { type, chat } = payload;
      console.warn('Chat action event:', payload);
      if (type === 'read') {
        dispatch(updateChat(chat));
      }
    };

    chatService.addEventListener('chats.action', handleActionChat);
    return () =>
      chatService.removeEventListener('chats.action', handleActionChat);
  }, [currentUser?.id, dispatch]);

  // useEffect(() => {
  //   const handleNewMessage = (payload: ISChatEventPayloads['new_message']) => {
  //     // const { chat_id, user_id, message_id, action } = payload;
  //     console.warn('New message event:', payload);
  //   };

  //   chatService.addEventListener('new_message', handleNewMessage);
  //   return () => chatService.removeEventListener('new_message', handleNewMessage);
  // }, [currentUser?.id, dispatch]);

  // useEffect(() => {
  //   const handleProjectsMember = (
  //     payload: ISChatEventPayloads['projects.member'],
  //   ) => {
  //     // const { chat_id, user_id, message_id, action } = payload;
  //     console.warn('Projects member event:', payload);
  //   };

  //   chatService.addEventListener('projects.member', handleProjectsMember);
  //   return () =>
  //     chatService.removeEventListener('projects.member', handleProjectsMember);
  // }, [currentUser?.id, dispatch]);

  return {
    setChatAuth,
  };
};
