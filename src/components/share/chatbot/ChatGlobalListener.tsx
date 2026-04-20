import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chatSDK } from '../../../services/chat.service';
import {
  selectIsChatInitialized,
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
  const currentChatId = useSelector(selectCurrentChatId);
  const currentChatIdRef = useRef(currentChatId);

  // Luôn cập nhật ref để các handler bất đồng bộ lấy được giá trị mới nhất của chat đang mở
  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    if (!isInitialized) return;

    const fetchSystemUsers = async () => {
      const res = await chatSDK.getMembers();
      dispatch(setSystemUsers((res.data as User[]) || []));
    };
    fetchSystemUsers();

    // Hàm chung để cập nhật danh sách chat và kiểm tra xem có bị kick không
    const refreshChatData = async (chatId?: number) => {
      try {
        // 1. Nếu có chatId, thử cập nhật danh sách thành viên
        if (chatId) {
          try {
            const res = await chatSDK.getMembers(chatId, 100, 1);
            if (res && res.data) {
              dispatch(setChatMembers({ chatId, members: res.data as User[] }));
            }
          } catch (error) {
            console.warn(
              'Không thể lấy thành viên (có thể đã bị xóa khỏi nhóm hoặc lỗi API):',
              chatId,
              error,
            );
          }
        }

        // 2. LUÔN lấy lại danh sách chat mới nhất
        const chatListRes = await chatSDK.getChats();
        const chats = (chatListRes.data as Chat[]) || [];
        dispatch(setRecentChats(chats));

        // 3. Nếu chat đang mở không còn trong danh sách -> Reset màn hình chat
        if (currentChatIdRef.current) {
          const stillExists = chats.some(
            (c) => c.id === currentChatIdRef.current,
          );
          if (!stillExists) {
            dispatch(setCurrentChatId(null));
          }
        }
      } catch (error) {
        console.error('Lỗi khi làm mới dữ liệu chat real-time:', error);
      }
    };

    // 1. Khi có tin nhắn mới hoặc các thao tác tin nhắn (revoke, remove, like...)
    const handleMessage = (data: unknown) => {
      const payload = data as {
        chat?: Chat;
        chat_id?: number;
        message?: Message;
        id?: number;
        message_id?: number;
        type?: string;
      };
      const chat = payload.chat || ({ id: payload.chat_id } as Chat);
      const message = payload.message || (payload as Message);
      if (!message) return;
      // PHIÊN DỊCH: Chuyển 'type' từ SDK sang 'revoke'/'remove' cho Redux hiểu
      const processedMessage: Message = {
        ...message,
        id: message.id || (payload.message_id as number),
        revoke: payload.type === 'revoke',
        remove: payload.type === 'remove',
      };

      // 2. CHỈ cập nhật Like/Love nếu đúng là sự kiện đó
      if (payload.type === 'like') processedMessage.like = true;
      if (payload.type === 'unlike') processedMessage.like = false;
      if (payload.type === 'love') processedMessage.love = true;
      if (payload.type === 'unlove') processedMessage.love = false;

      // data nhận từ SDK thường là { chat: {...}, message: {...} }
      dispatch(
        upsertMessage({
          chat: chat,
          message: processedMessage,
        }),
      );
    };

    // 2. Khi có cuộc trò chuyện mới được tạo (nhóm mới hoặc chat 1-1 mới)
    const handleChatCreated = () => {
      refreshChatData();
    };

    // 3. Khi thành viên thay đổi (Thêm/Xóa/Rời nhóm)
    const handleMemberChange = (data: unknown) => {
      const payload = data as {
        chat_id?: number;
        id?: number;
        chat?: { id: number };
      };
      const chatId = payload.chat_id || payload.id || payload.chat?.id;
      refreshChatData(chatId);
    };

    // 4. Khi một cuộc trò chuyện bị xóa (mình bị kích ra khỏi nhóm thường nhận event này)
    const handleChatDeleted = () => {
      refreshChatData();
    };

    // 5. Khi thông tin nhóm thay đổi (tên, avatar...)
    const handleChatUpdated = () => {
      refreshChatData();
    };

    // ĐĂNG KÝ SỰ KIỆN VỚI SDK
    chatSDK.addEventListener(chatSDK.EVENTS.chats_message, handleMessage);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_created, handleChatCreated);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_member, handleMemberChange);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_deleted, handleChatDeleted);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_updated, handleChatUpdated);

    return () => {
      // HỦY ĐĂNG KÝ KHI UNMOUNT
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
    };
  }, [isInitialized, dispatch]);

  return null;
};

export default ChatGlobalListener;
