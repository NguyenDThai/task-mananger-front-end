import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  currentMessages,
  selectChatMembers,
  selectCurrentChatId,
  selectIsChatInitialized,
  selectRecentChats,
  selectSystemUsers,
  setChatMembers,
  setCurrentChatId,
  setRecentChats,
  upsertMessage,
  setChatActivated,
} from '../../../redux/slides/chat/chatSlide';
import type { Chat, Message, User } from '../../../redux/slides/chat/chatSlide';
import { chatSDK } from '../../../services/chat.service';
import useDebounce from '../../../hooks/useDebound';
import { ChatbotSearchList } from './ChatbotSearchList';
import {
  CircleX,
  MessageSquareMore,
  MoveLeft,
  Search,
  User as UserIcon,
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
  const [position, setPosition] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useSelector(selectIsChatInitialized);

  // Xử lý click ngoài để đóng chat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const { user } = useSelector((state: { auth: { user: any } }) => state.auth);

  const dispatch = useDispatch();
  const recentChats = useSelector(selectRecentChats);
  const messages = useSelector(currentMessages);
  const allSystemUsers = useSelector(selectSystemUsers);
  const currentChatMembers = useSelector(selectChatMembers);
  const allChatMembers = useSelector(
    (state: { chat: { chatMembers: Record<number, User[]> } }) =>
      state.chat.chatMembers,
  );

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

  // Xử lý kéo thả icon
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved.current = true;

      setPosition({
        x: Math.max(20, Math.min(window.innerWidth - 70, e.clientX - 30)),
        y: Math.max(20, Math.min(window.innerHeight - 70, e.clientY - 30)),
      });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasMoved.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    document.body.style.userSelect = 'none';
  };

  const handleToggleChat = (open: boolean) => {
    if (hasMoved.current) return;
    if (open) {
      dispatch(setChatActivated(true));
    }
    setIsOpen(open);
  };

  // Hàm gửi tin nhắn
  const handleSendMessage = async (content?: string, files?: FileList) => {
    const textContent = content !== undefined ? content : newMessage;

    const trimmedText = textContent.trim();
    // Gửi null nếu chỉ có file (theo docs)
    const messageToSend = trimmedText || '';

    // Yêu cầu có tin nhắn HOẶC có file
    if (!messageToSend && (!files || files.length === 0)) return;
    if (!currentChat || !isInitialized) return;

    // Lưu lại replyId và reset trạng thái reply ngay
    const replyId = replyMessage?.id;
    setNewMessage('');
    setReplyMessage(null);

    try {
      // Theo docs: addMessage(chatId, content, files, replyId)
      const res = await chatSDK.addMessage(
        currentChat.id,
        messageToSend,
        files,
        replyId,
      );

      if (res.data) {
        dispatch(
          upsertMessage({
            chat: currentChat,
            message: {
              ...(res.data as Message),
              reply: replyMessage, // Đưa hẳn object reply vào để hiện ngay
              reply_id: replyId ? Number(replyId) : undefined,
            },
          }),
        );
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      if (messageToSend) setNewMessage(messageToSend);
      toast.error('Không thể gửi tin nhắn, vui lòng thử lại');
    }
  };

  // Lấy tin nhắn của cuộc trò chuyện hiện tại
  useEffect(() => {
    const fetchMessagesAndMembers = async () => {
      if (!currentChat || !isInitialized) return;
      try {
        // Cập nhật ID vào Redux ngay lập tức để đồng bộ trạng thái
        dispatch(setCurrentChatId(currentChat.id));

        const res = await chatSDK.getMessages(currentChat.id);
        const data = res.data || [];

        // Đẩy toàn bộ tin nhắn vào Redux qua loop (Sau này nên dùng setMessagesHistory để nhanh hơn)
        [...data].reverse().forEach((m: Message) => {
          dispatch(upsertMessage({ chat: currentChat, message: m }));
        });

        // Lấy danh sách thành viên
        if (currentChat.type === 'group') {
          // Ưu tiên sử dụng dữ liệu thành viên từ object chat hiện tại (nếu có)
          if (currentChat.members && currentChat.members.length > 0) {
            dispatch(
              setChatMembers({
                chatId: currentChat.id,
                members: currentChat.members as User[],
              }),
            );
          }

          try {
            // Thử fetch danh sách thành viên đầy đủ từ server
            const resMem = await chatSDK.getMembers(currentChat.id, 100, 1);
            if (resMem && resMem.data) {
              dispatch(
                setChatMembers({
                  chatId: currentChat.id,
                  members: resMem.data,
                }),
              );
            }
          } catch (memError) {
            console.error('Lỗi khi lấy danh sách thành viên nhóm:', memError);
            // Nếu lỗi (như 404), ta vẫn giữ data đã dispatch từ currentChat.members ở trên
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

  const reduxCurrentChatId = useSelector(selectCurrentChatId);
  const prevReduxChatIdRef = useRef(reduxCurrentChatId);

  // Đồng bộ currentChat (local) với currentChatId (Redux)
  // Xử lý trường hợp bị kick khỏi nhóm: ChatGlobalListener sẽ set reduxCurrentChatId = null
  useEffect(() => {
    // Chỉ reset local currentChat nếu reduxCurrentChatId thực sự bị chuyển từ có (non-null) sang không (null)
    // Điều này tránh tranh chấp trạng thái (race condition) khi người dùng vừa mới click vào chat
    if (
      prevReduxChatIdRef.current !== null &&
      reduxCurrentChatId === null &&
      currentChat !== null
    ) {
      setCurrentChat(null);
    }
    prevReduxChatIdRef.current = reduxCurrentChatId;
  }, [reduxCurrentChatId, currentChat]);

  // Hàm hiển thị tên chat không phải tên của mình
  const getChatName = () => {
    if (!currentChat) return 'Tin nhắn';
    if (currentChat.type === 'single') {
      const partner = currentChat.members?.find(
        (m: User) => m.code !== user?._id,
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

  const toggleMemberSelection = (member: User) => {
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
        (c: Chat) => c.name === groupName && c.type === 'group',
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

  const handleOpenAddMemberModal = async (chat?: Chat) => {
    const targetChat = chat?.id ? chat : currentChat;
    if (!targetChat?.id) return;

    if (chat) {
      setCurrentChat(chat);
    }

    try {
      const res = await chatSDK.getMembers(targetChat.id);
      if (res && res.data) {
        dispatch(setChatMembers({ chatId: targetChat.id, members: res.data }));
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thành viên nhóm:', error);
      toast.error('Không thể tải danh sách thành viên');
    } finally {
      setIsAddMemberModalOpen(true);
    }
  };

  // Hàm lấy member trong group
  const handleUpdateGroupName = async (chat: Chat) => {
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
      // Gọi SDK cho tất cả các loại action
      await chatSDK.actionMessage(currentChat.id, messageId, action);

      // Cập nhật UI qua redux ngay lập tức
      const messageToUpdate = messages.find((m) => m.id === messageId);
      if (messageToUpdate) {
        dispatch(
          upsertMessage({
            chat: currentChat,
            message: { ...messageToUpdate, [action]: true },
          }),
        );
      }
    } catch (error) {
      console.error(`Lỗi khi thực hiện action ${action}:`, error);
      toast.error('Không thể thực hiện thao tác này');
    }
  };

  // Hàm thêm thành viên vào nhóm
  const handleAddMember = async (member: User) => {
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
  const handleRemoveMember = async (memberId: number) => {
    if (!editingChat) return;

    const isOwner = memberId === user.id;
    if (
      isOwner &&
      !window.confirm(
        'Rời nhóm đồng nghĩa với việc nhóm sẽ bị xóa. Bạn chắc chứ?',
      )
    )
      return;
    try {
      await chatSDK.removeMember(editingChat.id, memberId);
      toast.success('Đã xóa thành viên khỏi nhóm');

      setSelectedMembers((prev) => prev.filter((m) => m.id !== memberId));

      // Cập nhật danh sách thành viên trong chat trên redux
      const membersForThisChat = allChatMembers[editingChat.id] || [];
      const updateMembers = membersForThisChat.filter(
        (m: User) => m.id !== memberId,
      );
      dispatch(
        setChatMembers({ chatId: editingChat.id, members: updateMembers }),
      );

      if (isOwner) {
        setIsEditModalOpen(false);
        setCurrentChat(null);
      }
    } catch (error) {
      console.error('Lỗi khi xóa thành viên:', error);
      toast.error('Không thể xóa thành viên này');
    }
  };

  const isRightSide = position.x > window.innerWidth / 2;
  const isBottomSide = position.y > window.innerHeight / 2;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 font-sans"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className={`absolute w-[400px] h-[640px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-90 opacity-0 pointer-events-none'
        } ${isRightSide ? 'right-0' : 'left-0'} ${isBottomSide ? 'bottom-full mb-4' : 'top-full mt-4'}`}
        style={{
          transformOrigin: `${isRightSide ? 'bottom right' : 'top left'}`,
          // Giới hạn để không bao giờ tràn màn hình ngang
          marginLeft:
            !isRightSide && position.x + 400 > window.innerWidth
              ? -(position.x + 400 - window.innerWidth + 20)
              : 0,
          marginRight:
            isRightSide && position.x - 400 < 0 ? -(400 - position.x + 20) : 0,
        }}
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
                  <UserIcon size={14} />
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
                    setCurrentChat={setCurrentChat}
                    user={user}
                    onRemoveChat={handleRemoveChat}
                    onUpdateGroupName={handleUpdateGroupName}
                    onAddMember={handleOpenAddMemberModal}
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
            selectedMembers={selectedMembers as any}
            onToggleMember={toggleMemberSelection as any}
            filteredMembers={filteredMembers as any}
            onCreateGroup={handleCreateGroup}
          />

          {/* Màn hình Chat */}
          <ScreenChat
            scrollRef={scrollRef}
            user={user as any}
            currentChat={currentChat}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            onMessageAction={handleMessageAction}
            onAddMemberClick={handleOpenAddMemberModal}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
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
          setEditingChat(null);
        }}
        groupName={groupName}
        setGroupName={setGroupName}
        onSave={handleSaveGroupNam}
        chatId={editingChat?.id}
        onRemoveMember={handleRemoveMember}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        systemMembers={allSystemUsers}
        onAdd={handleAddMember}
      />

      {!isOpen && (
        <button
          onMouseDown={handleMouseDown}
          onClick={() => handleToggleChat(true)}
          className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-linear-to-tr from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 z-50 group cursor-grab active:cursor-grabbing transition-transform will-change-transform ${isDragging ? 'scale-105 opacity-90' : ''}`}
        >
          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping group-hover:hidden pointer-events-none"></div>
          <MessageSquareMore
            size={28}
            className="relative z-10 pointer-events-none"
          />
        </button>
      )}
    </div>
  );
};

export default ChatBot;
