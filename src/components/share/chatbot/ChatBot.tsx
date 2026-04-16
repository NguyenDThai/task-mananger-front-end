import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  selectChatSDK,
  selectIsChatInitialized,
} from '../../../redux/slides/chat/chatSlide';
import useDebounce from '../../../hooks/useDebound';
import { ChatbotSearchList } from './ChatbotSearchList';
import { CircleX, MoveLeft, Search, Users, X } from 'lucide-react';
import ScreenChat from './ScreenChat';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemMembers, setSystemMembers] = useState<any[]>([]);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState('');
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatSDK = useSelector(selectChatSDK);
  const isInitialized = useSelector(selectIsChatInitialized);
  const { user } = useSelector((state: any) => state.auth);

  // Áp dụng debounce cho giá trị search (500ms cho thong thả)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Tự động cuộn xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat || !isInitialized) return;

    try {
      const res = await chatSDK.addMessage(currentChat.id, newMessage);
      if (res.message) {
        setMessages((prev) => [...prev, res.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    }
  };

  // Lắng nghe tin nhắn mới Real-time
  useEffect(() => {
    if (!isInitialized || !chatSDK) return;

    const handleReceivedMessage = (data: any) => {
      // Cập nhật khung chat nếu đang mở đúng cuộc hội thoại đó
      if (currentChat && data.chat_id === currentChat.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }

      // Cập nhật danh sách chat bên ngoài (đưa lên đầu)
      setRecentChats((prev) => {
        const targetChat = prev.find((c) => c.id === data.chat_id);
        const others = prev.filter((c) => c.id !== data.chat_id);
        if (targetChat) {
          return [
            { ...targetChat, message: data, updated_at: data.created_at },
            ...others,
          ];
        } else {
          return prev;
        }
      });
    };

    chatSDK.addEventListener(chatSDK.EVENTS.new_message, handleReceivedMessage);

    return () => {
      chatSDK.removeEventListener(
        chatSDK.EVENTS.new_message,
        handleReceivedMessage,
      );
    };
  }, [isInitialized, chatSDK, currentChat]);

  // Lấy tin nhắn của cuộc trò chuyện hiện tại
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat || !isInitialized) {
        setMessages([]);
        return;
      }
      try {
        const res = await chatSDK.getMessages(currentChat.id);
        const data = res.data || [];
        setMessages([...data].reverse());
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
      }
    };

    fetchMessages();
  }, [currentChat, isInitialized, chatSDK]);

  // Lấy danh sách chat gần đây
  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!isInitialized || !isOpen) return;
      try {
        const res = await chatSDK.getChats();
        setRecentChats(res.data || []);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chat:', error);
      }
    };

    fetchRecentChats();
  }, [isInitialized, isOpen, chatSDK]);

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

  const toggleMemberSelection = (member: any) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m.id === member.id)
        ? prev.filter((m) => m.id !== member.id)
        : [...prev, member],
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const memberIds = selectedMembers.map((m) => Number(m.id));

      try {
        // Gọi lệnh tạo nhóm (SDK sẽ crash ở bước nhận phản hồi)
        await chatSDK.addGroup(memberIds, groupName, '');
      } catch {
        // Nếu lỗi đúng là cái lỗi ".map" của SDK, ta sẽ âm thầm xử lý tiếp
        console.warn(
          'SDK gặp lỗi hiển thị nhưng nhóm có thể đã được tạo. Đang kiểm tra...',
        );
      }

      // Đợi một chút để Server đồng bộ dữ liệu (khoảng 800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Gọi lấy danh sách chats để tìm cái group vừa tạo
      const res = await chatSDK.getChats();
      const chats = res.data || [];

      // Tìm group vừa tạo theo tên và type
      const targetGroup = chats.find(
        (c: any) => c.name === groupName && c.type === 'group',
      );

      if (targetGroup) {
        setCurrentChat(targetGroup);
        setIsGroupMode(false);
        setSelectedMembers([]);
        setGroupName('');
        setSearchQuery('');
      } else {
        alert('Không tìm thấy nhóm vừa tạo, bạn hãy thử tải lại trang!');
      }
    } catch (error) {
      console.error('Lỗi hệ thống:', error);
      alert('Có lỗi xảy ra khi tạo nhóm!');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <div
        className={`absolute bottom-0 right-0 w-[400px] h-[640px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {(currentChat || isGroupMode) && (
              <button
                onClick={() => {
                  if (isGroupMode) {
                    setIsGroupMode(false);
                    setSelectedMembers([]);
                    setGroupName('');
                  } else {
                    setCurrentChat(null);
                  }
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <MoveLeft />
              </button>
            )}
            <h3 className="text-lg font-bold">
              {isGroupMode ? 'Tạo nhóm mới' : getChatName()}
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:rotate-90 transition-transform"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 relative flex flex-col bg-slate-50/50">
          {/* Màn hình danh sách & Tìm kiếm */}
          <div
            className={`absolute inset-0 flex flex-col transition-all duration-300 ${currentChat ? '-translate-x-full opacity-0' : 'translate-x-0'}`}
          >
            {/* Ô tìm kiếm */}
            <div className="p-4 bg-white border-b border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm thành viên hệ thống..."
                    className="w-full bg-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  {searchQuery && (
                    <CircleX
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                      size={15}
                    />
                  )}
                </div>
                {!isGroupMode && (
                  <button
                    onClick={() => setIsGroupMode(true)}
                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors tooltip group relative"
                    title="Tạo nhóm mới"
                  >
                    <Users size={20} />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Tạo nhóm mới
                    </span>
                  </button>
                )}
              </div>

              {/* Ô nhập tên nhóm khi ở Group Mode */}
              {isGroupMode && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nhập tên nhóm chat..."
                    className="w-full bg-indigo-50 border-2 border-indigo-100 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold text-indigo-900 placeholder:text-indigo-300"
                    autoFocus
                  />
                </div>
              )}

              {/* Danh sách member đã chọn (Chips) */}
              {isGroupMode && selectedMembers.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {selectedMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex-shrink-0 relative group animate-in zoom-in duration-200"
                    >
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          alt=""
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <button
                        onClick={() => toggleMemberSelection(m)}
                        className="absolute top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                        isGroupMode={isGroupMode}
                        isSelected={selectedMembers.some(
                          (sm) => sm.id === m.id,
                        )}
                        toggleMemberSelection={toggleMemberSelection}
                      />
                    </div>
                  ))}
                  {/* Nút Tạo Nhóm nổi bật ở chân trang */}
                  {isGroupMode && selectedMembers.length >= 2 && (
                    <div className="p-4 bg-white border-t border-slate-100 animate-in slide-in-from-bottom duration-300">
                      <button
                        onClick={handleCreateGroup}
                        disabled={!groupName.trim()}
                        className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                          groupName.trim()
                            ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        Tạo nhóm ngay ({selectedMembers.length})
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    Trò chuyện gần đây
                  </p>
                  {recentChats.length > 0 ? (
                    recentChats.map((chat) => {
                      // Xử lý tên hiển thị cho từng item
                      let displayName = chat.name || 'Nhóm chat';
                      let displayAvatar = chat.avatar;

                      if (chat.type === 'single') {
                        const partner = chat.members?.find(
                          (m: any) => m.code !== user?._id,
                        );
                        displayName = partner ? partner.name : 'Người dùng';
                        displayAvatar = partner ? partner.avatar : null;
                      }

                      return (
                        <div
                          key={chat.id}
                          onClick={() => setCurrentChat(chat)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white cursor-pointer border border-transparent hover:border-slate-100 transition-all group"
                        >
                          <div className="shrink-0 relative">
                            {displayAvatar ? (
                              <img
                                src={displayAvatar}
                                className="w-10 h-10 rounded-full object-cover shadow-sm"
                                alt=""
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${chat.type === 'group' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                              >
                                {displayName.charAt(0)}
                              </div>
                            )}
                            {/* Trạng thái Online (Mockup cho sinh động) */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-800 truncate">
                              {displayName}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              {chat.message?.content ||
                                (chat.type === 'group'
                                  ? 'Bấm để xem nội dung nhóm'
                                  : 'Bấm để bắt đầu trò chuyện')}
                            </p>
                          </div>
                          <div className="text-[10px] text-slate-400 self-start mt-1">
                            {chat.updated_at
                              ? new Date(chat.updated_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  },
                                )
                              : ''}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                        <svg
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">
                        Chưa có cuộc hội thoại nào
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Hãy tìm kiếm bạn bè để bắt đầu nhé!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Màn hình Chat */}
          <ScreenChat
            scrollRef={scrollRef}
            messages={messages}
            user={user}
            currentChat={currentChat}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
          />
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
