import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chatSDK } from '../services/chat.service';
import {
  selectIsChatInitialized,
  selectIsChatActivated,
  upsertMessage,
  setRecentChats,
  setSystemUsers,
  setChatMembers,
  selectCurrentChatId,
  setCurrentChatId,
  selectCurrentUser,
  setUnreadCount,
  setMessagesHistory,
  updateChatUnread,
  updateChat,
  setUserPresence,
} from '../redux/slides/chat/chatSlide';
import type { Chat, Message, User } from '../redux/slides/chat/chatSlide';

interface ChatEventData {
  chat?: Chat;
  chat_id?: number;
  message?: Message;
  id?: number;
  message_id?: number;
  type?: string;
  new?: number | Record<string, number>;
  status?: string;
  member?: User;
  member_id?: number;
}

export const useChatGlobalListener = () => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsChatInitialized);
  const isActivated = useSelector(selectIsChatActivated);
  const currentChatId = useSelector(selectCurrentChatId);
  const currentMember = useSelector(selectCurrentUser);
  const currentChatIdRef = useRef(currentChatId);
  const currentMemberRef = useRef(currentMember);
  const lastRefreshTimeRef = useRef(0);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    currentMemberRef.current = currentMember;
  }, [currentMember]);

  useEffect(() => {
    if (!isInitialized || !isActivated) return;

    const fetchSystemUsers = async () => {
      try {
        const res = await chatSDK.getMembers();
        const users = (res.data as User[]) || [];
        dispatch(setSystemUsers(users));

        users.forEach((u) => {
          if (u.status === 'online') {
            dispatch(setUserPresence({ userId: Number(u.id), isOnline: true }));
          }
        });
      } catch {
        /* silent catch */
      }
    };
    fetchSystemUsers();

    // Hàm làm mới dữ liệu chat
    const refreshChatData = async (
      chatId?: number,
      includeMembers = false,
      force = false,
    ) => {
      const now = Date.now();
      // Chặn nếu các sự kiện bắn ra quá dày đặc (trong vòng 1s) - Trừ khi là lệnh ép buộc (force)
      if (!force && now - lastRefreshTimeRef.current < 1000) return;
      lastRefreshTimeRef.current = now;

      // Khóa trạng thái để tránh gọi API lồng nhau
      if (isRefreshingRef.current && !force) return;
      isRefreshingRef.current = true;

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

              // Sử dụng setMessagesHistory thay vì loop dispatch upsertMessage
              const messages = [...res.data].reverse();
              dispatch(setMessagesHistory({ chat: currentChat, messages }));
            }
          } catch {
            /* ignore */
          }

          if (includeMembers) {
            try {
              const resMem = await chatSDK.getMembers(
                targetId as number,
                100,
                1,
              );
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
        }

        if (currentChatIdRef.current) {
          const stillExists = chats.some(
            (c) => c.id === currentChatIdRef.current,
          );
          if (!stillExists) dispatch(setCurrentChatId(null));
        }
      } catch (error) {
        console.error('Chat Real-time refresh error:', error);
      } finally {
        isRefreshingRef.current = false;
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
        id: Number(message.id || payload.message_id),
        revoke: payload.type === 'revoke',
        remove: payload.type === 'remove',
      };

      if (payload.type === 'love') processedMessage.love = true;
      if (payload.type === 'unlove') processedMessage.love = false;
      if (payload.type === 'like') processedMessage.like = true;
      if (payload.type === 'unlike') processedMessage.like = false;

      // Xử lý unread: Redux upsertMessage sẽ tự động cập nhật dựa trên payload.chat
      dispatch(upsertMessage({ chat: chat, message: processedMessage }));
    };

    const handleChatCreated = () => {
      refreshChatData(undefined, false, true);
    };

    const handleMemberChange = (data: unknown) => {
      const payload = data as ChatEventData;
      const chatId = Number(payload?.chat_id || payload?.id);

      // Ép buộc xóa cache và lấy lại toàn bộ danh sách chat + member
      refreshChatData(chatId, true, true);

      // Gọi thêm một lần sau 2s để chắc chắn server đã hoàn tất mọi tiến trình ngầm (như cập nhật socket)
      setTimeout(() => {
        refreshChatData(chatId, true, true);
      }, 2000);
    };

    const handleChatDeleted = () => {
      refreshChatData(undefined, false, true);
    };

    const handleChatUpdated = () => {
      refreshChatData(); // Bỏ force true để dùng throttle 1s
    };
    const handleChatAction = (data: unknown) => {
      const payload = data as ChatEventData;
      // Nếu payload có object chat (như log bạn cung cấp), cập nhật toàn bộ chat đó
      if (payload?.chat && payload.chat.id) {
        dispatch(updateChat(payload.chat));
      }
      // Fallback cho các cấu trúc khác nếu có
      else {
        const chatId = Number(payload?.chat_id || payload?.id);
        if (chatId && payload?.new && typeof payload.new !== 'number') {
          dispatch(
            updateChatUnread({
              chatId,
              unreadData: payload.new as Record<string, number>,
            }),
          );
        }
      }
    };
    const handleNewMessage = (data: unknown) => {
      const payload = data as ChatEventData;
      if (payload && typeof payload.new === 'number') {
        dispatch(setUnreadCount(payload.new));
      }
    };

    // Lắng nghe sự kiện thay đổi trạng thái trực tuyến của user
    const handlePresenceChange = (data: unknown) => {
      const payload = data as ChatEventData;
      const userId = payload.member?.id || payload.member_id || payload.id;
      if (!userId) {
        console.warn('Không tìm thấy user trong event', payload);
      }
      const isOnline = payload.type
        ? payload.type === 'join'
        : payload.status
          ? payload.status === 'online'
          : !!payload.member;

      dispatch(setUserPresence({ userId: Number(userId), isOnline }));
    };

    chatSDK.addEventListener(chatSDK.EVENTS.chats_message, handleMessage);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_created, handleChatCreated);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_member, handleMemberChange);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_deleted, handleChatDeleted);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_updated, handleChatUpdated);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_action, handleChatAction);
    chatSDK.addEventListener(chatSDK.EVENTS.new_message, handleNewMessage);
    chatSDK.addEventListener(
      chatSDK.EVENTS.projects_member,
      handlePresenceChange,
    );

    return () => {
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
      chatSDK.removeEventListener(
        chatSDK.EVENTS.chats_action,
        handleChatAction,
      );
      chatSDK.removeEventListener(chatSDK.EVENTS.new_message, handleNewMessage);
      chatSDK.removeEventListener(
        chatSDK.EVENTS.projects_member,
        handlePresenceChange,
      );
    };
  }, [isInitialized, isActivated, dispatch]);
};
