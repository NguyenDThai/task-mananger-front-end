import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  currentMessages,
  selectChatMembers,
  selectIsChatInitialized,
  selectRecentChats,
  selectSystemUsers,
  setChatMembers,
  setCurrentChatId,
  setRecentChats,
  upsertMessage,
} from '../../../redux/slides/chat/chatSlide';
import { chatSDK } from '../../../services/chat.service';
import useDebounce from '../../../hooks/useDebound';
import { ChatbotSearchList } from './ChatbotSearchList';
import {
  CircleX,
  MessageSquare,
  MoveLeft,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';
import ScreenChat from './ScreenChat';
import RecentChat from './RecentChat';
import CreateGroupInline from './CreateGroupModal';
import { toast } from 'react-toastify';
import EditGroupModal from './EditGroupModal';
import { useDispatch } from 'react-redux';
import AddMemberModal from './AddMemberModal';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChat, setEditingChat] = useState<any>(null);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInitialized = useSelector(selectIsChatInitialized);
  const { user } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch();
  const recentChats = useSelector(selectRecentChats);
  const messages = useSelector(currentMessages);
  const allSystemUsers = useSelector(selectSystemUsers);
  const currentChatMembers = useSelector(selectChatMembers);

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

  // Hàm gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat || !isInitialized) return;

    try {
      const res = await chatSDK.addMessage(currentChat.id, newMessage);
      if (res.message) {
        dispatch(upsertMessage({ chat: currentChat, message: res.message }));
        setNewMessage('');
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    }
  };

  // Lấy tin nhắn của cuộc trò chuyện hiện tại
  useEffect(() => {
    const fetchMessagesAndMembers = async () => {
      if (!currentChat || !isInitialized) return;
      try {
        const res = await chatSDK.getMessages(currentChat.id);
        const data = res.data || [];
        dispatch(setCurrentChatId(currentChat.id));
        // Đẩy toàn bộ tin nhắn vào Redux qua loop (Sau này nên dùng setMessagesHistory để nhanh hơn)
        [...data].reverse().forEach((m: any) => {
          dispatch(upsertMessage({ chat: currentChat, message: m }));
        });

        // Lấy danh sách thành viên
        if (currentChat.type === 'group') {
          const resMem = await chatSDK.getMembers(currentChat.id);
          if (resMem && resMem.data) {
            dispatch(
              setChatMembers({ chatId: currentChat.id, members: resMem.data }),
            );
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
      }
    };

    fetchMessagesAndMembers();
  }, [currentChat, isInitialized, chatSDK, dispatch]);

  // Lấy danh sách chat gần đây
  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!isInitialized || !isOpen) return;
      try {
        const res = await chatSDK.getChats();
        dispatch(setRecentChats(res.data || []));
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chat:', error);
      }
    };

    fetchRecentChats();
  }, [isInitialized, isOpen, chatSDK]);

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
  const filteredMembers = allSystemUsers.filter(
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

  // Tạo nhóm chat
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
      dispatch(setRecentChats(chats));

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

  // Hàm xóa cuộc trò chuyện và group
  const handleRemoveChat = async (chatId: number) => {
    if (!window.confirm('Bạn có chắc xóa cuộc trò chuyện này?')) return;

    try {
      await chatSDK.removeChat(chatId);
      const updatedChats = recentChats.filter((chat) => chat.id !== chatId);
      dispatch(setRecentChats(updatedChats));

      // Nếu đang xem tin nhắn của cuộc trò chuyện bị xóa thì chuyển về null
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }

      toast.success('Xóa cuộc trò chuyện thành công');
    } catch (error) {
      console.error('Lỗi khi xóa chat:', error);
      toast.error('Không thể xóa cuộc trò chuyện, vui lòng thử lại sau');
    }
  };

  const handleOpenAddMemberModal = async () => {
    if (!currentChat?.id) return;

    try {
      const res = await chatSDK.getMembers(currentChat.id);
      if (res && res.data) {
        dispatch(setChatMembers({ chatId: currentChat.id, members: res.data }));
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thành viên nhóm:', error);
      toast.error('Không thể tải danh sách thành viên');
    } finally {
      setIsAddMemberModalOpen(true);
    }
  };

  // Hàm lấy member trong group
  const handleUpdateGroupName = async (chat: any) => {
    setEditingChat(chat);
    setIsEditModalOpen(true);
    setGroupName(chat.name || '');

    setSelectedMembers([]);

    try {
      const res = await chatSDK.getMembers(chat.id);

      if (res && res.data) {
        setSelectedMembers(res.data);
        dispatch(setChatMembers({ chatId: chat.id, members: res.data }));
      } else {
        setSelectedMembers([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thành viên nhóm:', error);
      toast.error('Không thể tải danh sách thành viên');
      setSelectedMembers([]);
    }
  };

  const handleSaveGroupNam = async () => {
    if (!groupName.trim() || !editingChat) return;

    try {
      await chatSDK.updateGroup(editingChat.id, groupName.trim());

      // Cập nhật UI
      const updatedChats = recentChats.map((c) =>
        c.id === editingChat.id ? { ...c, name: groupName.trim() } : c,
      );
      dispatch(setRecentChats(updatedChats));

      if (currentChat?.id === editingChat.id) {
        setCurrentChat({ ...currentChat, name: groupName.trim() });
      }

      toast.success('Cập nhật tên nhóm thành công');
      setIsEditModalOpen(false);
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật nhóm');
    }
  };

  // Hàm xử lý tương tác tin nhắn
  const handleMessageAction = async (
    messageId: number,
    action: 'like' | 'love' | 'revoke' | 'remove',
  ) => {
    if (!currentChat) return;

    try {
      await chatSDK.actionMessage(currentChat.id, messageId, action);

      // Cập nhật UI mượt mà qua Redux
      if (action === 'remove' || action === 'revoke') {
        const messageToUpdate = messages.find((m) => m.id === messageId);
        if (messageToUpdate) {
          // Gửi một "giả lập" tin nhắn đã bị thu hồi vào Redux để nó tự xóa
          dispatch(
            upsertMessage({
              chat: currentChat,
              message: { ...messageToUpdate, [action]: true },
            }),
          );
        }
        toast.success(
          action === 'revoke'
            ? 'Thu hồi tin nhắn thành công'
            : 'Xóa tin nhắn thành công',
        );
      } else {
        toast.success(action === 'like' ? 'Đã thích tin nhắn' : 'Đã thả tim');
      }
    } catch (error) {
      console.error(`Lỗi khi thực hiện action ${action}:`, error);
      toast.error('Không thể thực hiện thao tác này');
    }
  };

  // Hàm thêm thành viên vào nhóm
  const handleAddMember = async (member: any) => {
    if (!currentChat || !member.id) return;

    try {
      await chatSDK.addMember(currentChat.id, member.id);

      toast.success(`Đã thêm ${member.name} vào nhóm`);

      const updateMembers = [...currentChatMembers, member];
      dispatch(
        setChatMembers({ chatId: currentChat.id, members: updateMembers }),
      );
    } catch (error) {
      console.error('Lỗi khi thêm thành viên:', error);
      toast.error('Không thể thêm thành viên này vào nhóm');
    }
  };

  // Hàm xóa thành viên khỏi nhóm
  // const handleRemoveMember = async (memberId: number) => {
  //   if (!editingChat) return;

  //   const isOwner = memberId === user.id;
  //   if (
  //     isOwner &&
  //     !window.confirm(
  //       'Rời nhóm đồng nghĩa với việc nhóm sẽ bị xóa. Bạn chắc chứ?',
  //     )
  //   )
  //     return;
  //   try {
  //     await chatSDK.removeMember(editingChat.id, memberId);
  //     toast.success('Đã xóa thành viên khỏi nhóm');

  //     setSelectedMembers((prev) => prev.filter((m) => m.id !== memberId));

  //     if (isOwner) {
  //       setIsEditModalOpen(false);
  //       setCurrentChat((prev: any) =>
  //         prev.filter((c: any) => c.id !== editingChat.id),
  //       );
  //       setCurrentChat(null);
  //     }
  //   } catch (error) {
  //     console.error('Lỗi khi xóa thành viên:', error);
  //     toast.error('Không thể xóa thành viên này');
  //   }
  // };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <div
        className={`absolute bottom-0 right-0 w-[400px] h-[640px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-5 text-white flex justify-between items-center shrink-0">
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
            <div>
              <h3 className="text-lg font-bold">
                {isGroupMode ? 'Tạo nhóm mới' : getChatName()}
              </h3>
              {(isGroupMode || currentChat) && (
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <p className="text-[11px] text-indigo-100/80 font-medium">
                    {isGroupMode
                      ? 'Kết nối với đồng nghiệp của bạn'
                      : currentChat?.type === 'group'
                        ? `${currentChatMembers.length} thành viên`
                        : 'Đang hoạt động'}
                  </p>
                </div>
              )}
            </div>
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
            className={`absolute inset-0 flex flex-col transition-all duration-300 ${currentChat || isGroupMode ? '-translate-x-full opacity-0' : 'translate-x-0'}`}
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
                    onClick={() => {
                      setIsGroupMode(true);
                      setGroupName('');
                      setSelectedMembers([]);
                      setSearchQuery('');
                    }}
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
                </>
              ) : (
                <>
                  <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    Trò chuyện gần đây
                  </p>
                  <RecentChat
                    recentChats={recentChats}
                    setCurrentChat={setCurrentChat}
                    user={user}
                    onRemoveChat={handleRemoveChat}
                    onUpdateGroupName={handleUpdateGroupName}
                  />
                </>
              )}
            </div>
          </div>

          {/* Màn hình Tạo nhóm (Inline) */}
          <CreateGroupInline
            isActive={isGroupMode}
            groupName={groupName}
            setGroupName={setGroupName}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedMembers={selectedMembers}
            onToggleMember={toggleMemberSelection}
            filteredMembers={filteredMembers}
            onCreateGroup={handleCreateGroup}
          />

          {/* Màn hình Chat */}
          <ScreenChat
            scrollRef={scrollRef}
            messages={messages}
            user={user}
            currentChat={currentChat}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            onMessageAction={handleMessageAction}
            onAddMemberClick={handleOpenAddMemberModal}
          />
        </div>
      </div>

      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setGroupName('');
          setSelectedMembers([]);
          setSearchQuery('');
        }}
        groupName={groupName}
        setGroupName={setGroupName}
        onSave={handleSaveGroupNam}
        members={selectedMembers}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        systemMembers={allSystemUsers}
        onAdd={handleAddMember}
        currentMembers={selectedMembers}
      />

      <button
        onClick={() => setIsOpen(true)}
        className={`w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-all ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={20} />
      </button>
    </div>
  );
};

export default ChatBot;
