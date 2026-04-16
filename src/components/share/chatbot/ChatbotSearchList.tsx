import { selectChatSDK } from '../../../redux/slides/chat/chatSlide';
import { useSelector } from 'react-redux';

export const ChatbotSearchList = ({
  m,
  setCurrentChat,
  setSearchQuery,
  isGroupMode,
  isSelected,
  toggleMemberSelection,
}: any) => {
  const chatSDK = useSelector(selectChatSDK);

  const handleSelectMember = async () => {
    if (isGroupMode) {
      toggleMemberSelection(m);
      return;
    }

    try {
      await chatSDK.setReceiver({
        code: m.code,
        name: m.name,
        avatar: m.avatar,
        phone: m.phone,
        email: m.email,
      });

      // Tạo hoặc lấy cuộc trò chuyện
      const chatResponse = await chatSDK.addChat(m.id);

      setCurrentChat(chatResponse.data);
      setSearchQuery('');
    } catch (error) {
      console.error('Không thể khởi tạo chat', error);
    }
  };

  return (
    <div
      onClick={handleSelectMember}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-indigo-50/50 border-indigo-100' : 'hover:bg-white border-transparent hover:border-slate-100'}`}
    >
      <div className="relative">
        {m.avatar ? (
          <img
            src={m.avatar}
            alt={m.name}
            className="w-10 h-10 rounded-full object-cover shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
            {m.name.charAt(0)}
          </div>
        )}
        {/* Trạng thái online (Mockup) */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-800">{m.name}</h4>
        <p className="text-xs text-slate-500">
          {m.email || 'Thành viên hệ thống'}
        </p>
      </div>

      {isGroupMode && (
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}
        >
          {isSelected && (
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="white"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
