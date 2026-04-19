import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chatSDK } from '../../../services/chat.service';
import {
  selectIsChatInitialized,
  upsertMessage,
  setRecentChats,
  setSystemUsers,
  setChatMembers,
} from '../../../redux/slides/chat/chatSlide';
import type { Chat, Message, User } from '../../../redux/slides/chat/chatSlide';

const ChatGlobalListener = () => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsChatInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const fetchSystemUsers = async () => {
      const res = await chatSDK.getMembers();
      dispatch(setSystemUsers((res.data as User[]) || []));
    };
    fetchSystemUsers();

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
      // Reload lại danh sách chat gần đây để người dùng thấy chat mới hiện lên
      (async () => {
        const res = await chatSDK.getChats();
        dispatch(setRecentChats((res.data as Chat[]) || []));
      })();
    };

    // Xử lý khi thành viên thay đổi (Thêm/Xóa/Rời nhóm)
    const handleMemberChange = (data: unknown) => {
      const payload = data as {
        chat_id?: number;
        id?: number;
        chat?: { id: number };
      };
      const chatId = payload.chat_id || payload.id || payload.chat?.id;
      if (chatId) {
        (async () => {
          try {
            // Lấy lại danh sách thành viên mới nhất
            const res = await chatSDK.getMembers(chatId);
            if (res && res.data) {
              dispatch(setChatMembers({ chatId, members: res.data as User[] }));
            }
            // Lấy lại danh sách chat để số lượng thành viên ở Sidebar nhảy số
            const chatListRes = await chatSDK.getChats();
            dispatch(setRecentChats((chatListRes.data as Chat[]) || []));
          } catch (error) {
            console.error('Lỗi cập nhật thành viên real-time:', error);
          }
        })();
      }
    };

    // ĐĂNG KÝ SỰ KIỆN VỚI SDK
    chatSDK.addEventListener(chatSDK.EVENTS.chats_message, handleMessage);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_created, handleChatCreated);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_member, handleMemberChange);

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
    };
  }, [isInitialized, dispatch]);

  return null; // Component này không hiển thị gì cả, chỉ làm nhiệm vụ lắng nghe
};

export default ChatGlobalListener;
