import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chatSDK } from '../../../services/chat.service';
import {
  selectIsChatInitialized,
  selectIsChatActivated,
  upsertMessage,
  setRecentChats,
  setSystemUsers,
  setChatMembers,
  selectCurrentChatId,
  setCurrentChatId,
} from '../../../redux/slides/chat/chatSlide';
import type { Chat, Message, User } from '../../../redux/slides/chat/chatSlide';

const ChatGlobalListener = () => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsChatInitialized);
  const isActivated = useSelector(selectIsChatActivated);
  const currentChatId = useSelector(selectCurrentChatId);
  const currentChatIdRef = useRef(currentChatId);
  const lastRefreshTimeRef = useRef(0);

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    if (!isInitialized || !isActivated) return;

    const fetchSystemUsers = async () => {
      try {
        const res = await chatSDK.getMembers();
        dispatch(setSystemUsers((res.data as User[]) || []));
      } catch {
        /* silent catch */
      }
    };
    fetchSystemUsers();

    const refreshChatData = async (chatId?: number) => {
      const now = Date.now();
      if (now - lastRefreshTimeRef.current < 1000) return;
      lastRefreshTimeRef.current = now;

      // Đợi server ổn định dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const targetId = chatId || currentChatIdRef.current;
        const chatListRes = await chatSDK.getChats();
        const chats = (chatListRes.data as Chat[]) || [];
        dispatch(setRecentChats(chats));

        if (targetId) {
          try {
            const res = await chatSDK.getMessages(targetId, 50, 1);
            if (res.data) {
              const currentChat =
                chats.find((c) => c.id === targetId) ||
                ({ id: targetId } as Chat);
              [...res.data].reverse().forEach((m: Message) => {
                dispatch(upsertMessage({ chat: currentChat, message: m }));
              });
            }
          } catch {
            /* ignore */
          }

          try {
            const resMem = await chatSDK.getMembers(targetId as number, 100, 1);
            if (resMem?.data) {
              dispatch(
                setChatMembers({
                  chatId: targetId as number,
                  members: resMem.data as User[],
                }),
              );
            }
          } catch {
            /* ignore */
          }
        }

        if (currentChatIdRef.current) {
          const stillExists = chats.some(
            (c) => c.id === currentChatIdRef.current,
          );
          if (!stillExists) dispatch(setCurrentChatId(null));
        }
      } catch (error) {
        console.error('Chat Real-time refresh error:', error);
      }
    };

    const handleMessage = (data: unknown) => {
      const payload = data as {
        chat?: Chat;
        chat_id?: number;
        message?: Message;
        id?: number;
        message_id?: number;
        type?: string;
      };

      const chatId = Number(
        payload.chat_id || payload.chat?.id || payload.message?.chat_id,
      );
      if (!chatId) return;

      const chat = payload.chat || ({ id: chatId } as Chat);
      const message = payload.message || (payload as Message);
      if (!message) return;

      const processedMessage: Message = {
        ...message,
        id: message.id || (payload.message_id as number),
        revoke: payload.type === 'revoke',
        remove: payload.type === 'remove',
      };

      if (payload.type === 'like') processedMessage.like = true;
      if (payload.type === 'unlike') processedMessage.like = false;
      if (payload.type === 'love') processedMessage.love = true;
      if (payload.type === 'unlove') processedMessage.love = false;

      dispatch(upsertMessage({ chat: chat, message: processedMessage }));
    };

    const handleChatCreated = () => {
      refreshChatData();
    };

    const handleMemberChange = (data: any) => {
      const chatId = Number(data?.chat_id || data?.id);
      refreshChatData(chatId);
      setTimeout(() => {
        refreshChatData(chatId);
      }, 2000);
    };

    const handleChatDeleted = (data: any) => {
      const chatId = Number(data?.chat_id || data?.id);
      if (chatId === currentChatIdRef.current) dispatch(setCurrentChatId(null));
      refreshChatData();
    };

    const handleChatUpdated = () => {
      refreshChatData();
    };
    const handleNewMessage = () => {
      refreshChatData();
    };

    chatSDK.addEventListener(chatSDK.EVENTS.chats_message, handleMessage);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_created, handleChatCreated);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_member, handleMemberChange);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_deleted, handleChatDeleted);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_updated, handleChatUpdated);
    chatSDK.addEventListener(chatSDK.EVENTS.new_message, handleNewMessage);

    const handleFocus = () => {
      if (currentChatIdRef.current) refreshChatData();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      chatSDK.removeEventListener(chatSDK.EVENTS.chats_message, handleMessage);
      chatSDK.removeEventListener(
        chatSDK.EVENTS.chats_created,
        handleChatCreated,
      );
      chatSDK.removeEventListener(
        chatSDK.EVENTS.chats_member,
        handleMemberChange,
      );
      chatSDK.removeEventListener(
        chatSDK.EVENTS.chats_deleted,
        handleChatDeleted,
      );
      chatSDK.removeEventListener(
        chatSDK.EVENTS.chats_updated,
        handleChatUpdated,
      );
      chatSDK.removeEventListener(chatSDK.EVENTS.new_message, handleNewMessage);
    };
  }, [isInitialized, isActivated, dispatch]);

  return null;
};

export default ChatGlobalListener;
