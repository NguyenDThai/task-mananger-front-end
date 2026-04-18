import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chatSDK } from '../../../services/chat.service';
import {
  selectIsChatInitialized,
  upsertMessage,
  setRecentChats,
  setSystemUsers,
} from '../../../redux/slides/chat/chatSlide';

const ChatGlobalListener = () => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsChatInitialized);

  useEffect(() => {
    if (!isInitialized) return;

    const fetchSystemUsers = async () => {
      const res = await chatSDK.getMembers();
      dispatch(setSystemUsers(res.data || []));
    };
    fetchSystemUsers();

    // 1. Khi có tin nhắn mới hoặc các thao tác tin nhắn (revoke, remove, like...)
    const handleMessage = (data: any) => {
      // data nhận từ SDK thường là { chat: {...}, message: {...} }
      dispatch(upsertMessage(data));
    };

    // 2. Khi có cuộc trò chuyện mới được tạo (nhóm mới hoặc chat 1-1 mới)
    const handleChatCreated = () => {
      // Reload lại danh sách chat gần đây để người dùng thấy chat mới hiện lên
      (async () => {
        const res = await chatSDK.getChats();
        dispatch(setRecentChats(res.data || []));
      })();
    };

    // ĐĂNG KÝ SỰ KIỆN VỚI SDK
    chatSDK.addEventListener(chatSDK.EVENTS.chats_message, handleMessage);
    chatSDK.addEventListener(chatSDK.EVENTS.chats_created, handleChatCreated);

    return () => {
      // HỦY ĐĂNG KÝ KHI UNMOUNT
      chatSDK.removeEventListener(chatSDK.EVENTS.chats_message, handleMessage);
      chatSDK.removeEventListener(
        chatSDK.EVENTS.chats_created,
        handleChatCreated,
      );
    };
  }, [isInitialized, dispatch]);

  return null; // Component này không hiển thị gì cả, chỉ làm nhiệm vụ lắng nghe
};

export default ChatGlobalListener;
