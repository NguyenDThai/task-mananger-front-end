import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { useEffect } from 'react';
import { chat } from '../services/chatService';
import {
  addNewMessage,
  addChat,
  setChats,
  setCurrentUser,
  setMembers,
  updateChat,
  removeChat,
  removeMessage,
} from '../redux/slides/chat/chatSlide';
import type { ISChatEventPayloads, User } from '../types';

export const useChat = () => {
  const dispatch = useDispatch();
  const { currentUser, chats } = useSelector((state: RootState) => state.chat);

  const setChatAuth = async (user: User) => {
    if (!user._id || !user.name) return;
    try {
      const currentUserData = await chat.setAuth({
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
    const fetchInitialData = async () => {
      if (!currentUser?.id) return;

      try {
        const [{ data: chatsData }, { data: membersData }] = await Promise.all([
          chat.getChats(),
          chat.getMembers(),
        ]);

        dispatch(setChats(chatsData));
        dispatch(setMembers(membersData));
      } catch (error) {
        console.error('Failed to fetch initial chat data:', error);
      }
    };

    fetchInitialData();
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    const handleNewMessage = (
      payload: ISChatEventPayloads['chats.message'],
    ) => {
      const { chat, message, type, chat_id, message_id } = payload;
      if (type === 'add') {
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
    };

    chat.addEventListener('chats.message', handleNewMessage);
    return () => chat.removeEventListener('chats.message', handleNewMessage);
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    const handleNewChat = (payload: ISChatEventPayloads['chats.created']) => {
      const { chat } = payload;
      dispatch(addChat(chat));
    };

    chat.addEventListener('chats.created', handleNewChat);
    return () => chat.removeEventListener('chats.created', handleNewChat);
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    const handleUpdateChat = (
      payload: ISChatEventPayloads['chats.updated'],
    ) => {
      const { chat } = payload;
      dispatch(updateChat(chat));
    };

    chat.addEventListener('chats.updated', handleUpdateChat);
    return () => chat.removeEventListener('chats.updated', handleUpdateChat);
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    const handleDeleteChat = (
      payload: ISChatEventPayloads['chats.deleted'],
    ) => {
      const { chat_id } = payload;
      const chat = chats.find((c) => c.id === chat_id);
      if (!chat || chat.type !== 'group') {
        return;
      }

      dispatch(removeChat(chat_id));
    };

    chat.addEventListener('chats.deleted', handleDeleteChat);
    return () => chat.removeEventListener('chats.deleted', handleDeleteChat);
  }, [currentUser?.id, chats, dispatch]);

  useEffect(() => {
    const handleMemberChat = (payload: ISChatEventPayloads['chats.member']) => {
      // const { chat_id, type, member, member_id } = payload;
      console.warn('Chat member event:', payload);
    };

    chat.addEventListener('chats.member', handleMemberChat);
    return () => chat.removeEventListener('chats.member', handleMemberChat);
  }, [currentUser?.id, dispatch]);

  useEffect(() => {
    const handleActionChat = (payload: ISChatEventPayloads['chats.action']) => {
      // const { chat_id, user_id, message_id, action } = payload;
      console.warn('Chat action event:', payload);
    };

    chat.addEventListener('chats.action', handleActionChat);
    return () => chat.removeEventListener('chats.action', handleActionChat);
  }, [currentUser?.id, dispatch]);

  // useEffect(() => {
  //   const handleNewMessage = (payload: ISChatEventPayloads['new_message']) => {
  //     // const { chat_id, user_id, message_id, action } = payload;
  //     console.warn('New message event:', payload);
  //   };

  //   chat.addEventListener('new_message', handleNewMessage);
  //   return () => chat.removeEventListener('new_message', handleNewMessage);
  // }, [currentUser?.id, dispatch]);

  // useEffect(() => {
  //   const handleProjectsMember = (
  //     payload: ISChatEventPayloads['projects.member'],
  //   ) => {
  //     // const { chat_id, user_id, message_id, action } = payload;
  //     console.warn('Projects member event:', payload);
  //   };

  //   chat.addEventListener('projects.member', handleProjectsMember);
  //   return () =>
  //     chat.removeEventListener('projects.member', handleProjectsMember);
  // }, [currentUser?.id, dispatch]);

  return {
    setChatAuth,
  };
};
