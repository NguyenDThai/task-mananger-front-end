import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectChatSDK,
  selectIsChatInitialized,
} from '../../../redux/slides/chat/chatSlide';
import useDebounce from '../../../hooks/useDebound';
import { ChatbotSearchList } from './ChatbotSearchList';

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    type: 'single',
    lastMsg: 'Chào bạn!',
    online: true,
  },
  {
    id: '2',
    name: 'Nhóm Phát Triển',
    type: 'group',
    lastMsg: 'Đã cập nhật code mới',
    online: false,
  },
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemMembers, setSystemMembers] = useState<any[]>([]);
  const chatSDK = useSelector(selectChatSDK);
  const isInitialized = useSelector(selectIsChatInitialized);
  const { user } = useSelector((state: any) => state.auth);

  // Áp dụng debounce cho giá trị search (500ms cho thong thả)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!isInitialized) return;
      if (!debouncedSearchQuery.trim()) {
        setSystemMembers([]);
        return;
      }
      try {
        const res = await chatSDK.getMembers();
        setSystemMembers(res.data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchMembers();
  }, [isInitialized, chatSDK, debouncedSearchQuery]);

  // Hàm hiển thị tên chat không phải tên của mình
  const getChatName = () => {
    if (!currentChat) return 'Tin nhắn';
    if (currentChat.type === 'single') {
      const partner = currentChat.members?.find(
        (m: any) => m.code !== user?._id,
      );
      return partner ? partner.name : 'Người dùng';
    }
    return currentChat.name || 'Nhóm chat';
  };

  // Lọc member: Duy nhất + Không phải là mình + Khớp search query
  const filteredMembers = systemMembers.filter(
    (m, index, self) =>
      // 1. Chỉ lấy những người có tên khớp với tìm kiếm
      m.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
      // 2. Không phải là chính mình
      m.code !== user?._id &&
      // 3. Loại bỏ trùng lặp (chỉ lấy người đầu tiên có code này trong danh sách)
      index === self.findIndex((t) => t.code === m.code),
  );

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <div
        className={`absolute bottom-0 right-0 w-[400px] h-[640px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {currentChat && (
              <button
                onClick={() => {
                  setCurrentChat(null);
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <h3 className="text-lg font-bold">{getChatName()}</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:rotate-90 transition-transform"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 relative flex flex-col bg-slate-50/50">
          {/* Màn hình danh sách & Tìm kiếm */}
          <div
            className={`absolute inset-0 flex flex-col transition-all duration-300 ${currentChat ? '-translate-x-full opacity-0' : 'translate-x-0'}`}
          >
            {/* THIẾT KẾ Ô TÌM KIẾM HÀI HÒA */}
            <div className="p-4 bg-white border-b border-slate-100">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm thành viên hệ thống..."
                  className="w-full bg-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {searchQuery.trim() ? (
                <>
                  <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    Kết quả hệ thống
                  </p>
                  {filteredMembers.map((m) => (
                    <div key={m.id}>
                      <ChatbotSearchList
                        m={m}
                        setCurrentChat={setCurrentChat}
                        setSearchQuery={setSearchQuery}
                      />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    Trò chuyện gần đây
                  </p>
                  {MOCK_CONVERSATIONS.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setCurrentChat(chat)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white cursor-pointer border border-transparent hover:border-slate-100 transition-all"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${chat.type === 'group' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      >
                        {chat.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">{chat.name}</h4>
                        <p className="text-xs text-slate-500 truncate">
                          {chat.lastMsg}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Màn hình Chat - Giữ nguyên mockup cũ */}
          <div
            className={`absolute inset-0 flex flex-col transition-all duration-300 ${currentChat ? 'translate-x-0' : 'translate-x-full opacity-0'}`}
          >
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-sm self-end ml-auto max-w-[80%] text-sm shadow-sm">
                Chào bạn, các bạn có thể trò chuyên với nhau
              </div>
            </div>
            <div className="p-4 bg-white flex gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-slate-50 border-none outline-none px-4 py-2 rounded-xl text-sm"
              />
              <button className="bg-indigo-600 text-white p-2 rounded-xl">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className={`w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-all ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="28"
          height="28"
        >
          <path d="M21 15C21 16.1046 20.1046 17 19 17H7L3 21V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15Z"></path>
        </svg>
      </button>
    </div>
  );
};

export default ChatBot;
