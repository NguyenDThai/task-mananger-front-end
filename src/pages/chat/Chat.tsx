import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  selectCurrentUser,
  updateChatUnread,
  setMessagesHistory,
  selectChatPagination,
  prependMessages,
} from '../../redux/slides/chat/chatSlide';
import type {
  Chat as ChatType,
  Message,
  User,
} from '../../redux/slides/chat/chatSlide';
import { chatSDK } from '../../services/chat.service';
import useDebounce from '../../hooks/useDebound';
import { ChatbotSearchList } from '../../components/share/chatbot/ChatbotSearchList';
import {
  CircleX,
  MessageSquareMore,
  Search,
  User as UserIcon,
  X,
  Phone,
  Info,
  Plus,
} from 'lucide-react';
import ScreenChat from '../../components/share/chatbot/ScreenChat';
import RecentChat from '../../components/share/chatbot/RecentChat';
import CreateGroupInline from '../../components/share/chatbot/CreateGroupModal';
import { toast } from 'react-toastify';
import EditGroupModal from '../../components/share/chatbot/EditGroupModal';
import AddMemberModal from '../../components/share/chatbot/AddMemberModal';

export const Chat = () => {
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChat, setEditingChat] = useState<ChatType | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Phân trang
  const pagination = useSelector(selectChatPagination);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isPrependingRef = useRef(false);

  const isInitialized = useSelector(selectIsChatInitialized);
  const { user } = useSelector((state: { auth: { user: any } }) => state.auth);
  const dispatch = useDispatch();
  const recentChats = useSelector(selectRecentChats);
  const messages = useSelector(currentMessages);
  const allSystemUsers = useSelector(selectSystemUsers);
  const currentChatMembers = useSelector(selectChatMembers);
  const currentMember = useSelector(selectCurrentUser);
  const allChatMembers = useSelector(
    (state: { chat: { chatMembers: Record<number, User[]> } }) =>
      state.chat.chatMembers,
  );

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Load more messages
  const loadMoreMessages = async () => {
    if (!currentChat?.id || isLoadingMore || !pagination.hasMore) return;

    setIsLoadingMore(true);
    isPrependingRef.current = true;

    const container = scrollContainerRef.current;
    const previousScrollHeight = container ? container.scrollHeight : 0;
    const previousScrollTop = container ? container.scrollTop : 0;

    try {
      const nextPage = pagination.page + 1;
      const res = await chatSDK.getMessages(currentChat.id, 20, nextPage);
      const newMsgs = res.data || [];

      if (newMsgs.length > 0) {
        dispatch(
          prependMessages({
            chatId: currentChat.id,
            messages: newMsgs,
            page: nextPage,
          }),
        );

        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop =
              container.scrollHeight - previousScrollHeight + previousScrollTop;
            setTimeout(() => {
              isPrependingRef.current = false;
            }, 200);
          }
        });
      } else {
        isPrependingRef.current = false;
      }
    } catch {
      isPrependingRef.current = false;
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (isPrependingRef.current) return;
    if (scrollContainerRef.current && !isLoadingMore) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, currentChat?.id, isLoadingMore]);

  // Send message
  const handleSendMessage = async (content?: string, files?: FileList) => {
    const textContent = content !== undefined ? content : newMessage;
    const trimmedText = textContent.trim();
    const messageToSend = trimmedText || '';

    if (!messageToSend && (!files || files.length === 0)) return;
    if (!currentChat || !isInitialized) return;

    const replyId = replyMessage?.id;
    setNewMessage('');
    setReplyMessage(null);

    try {
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
              reply: replyMessage,
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

  const lastFetchedChatIdRef = useRef<number | null>(null);

  // Fetch messages and members
  useEffect(() => {
    const fetchMessagesAndMembers = async () => {
      if (!currentChat || !isInitialized) return;

      if (lastFetchedChatIdRef.current === currentChat.id) return;
      lastFetchedChatIdRef.current = currentChat.id;

      try {
        dispatch(setCurrentChatId(currentChat.id));

        const res = await chatSDK.getMessages(currentChat.id);
        const data = res.data || [];

        dispatch(setMessagesHistory({ chat: currentChat, messages: data }));

        if (currentChat.type === 'group') {
          if (currentChat.members && currentChat.members.length > 0) {
            dispatch(
              setChatMembers({
                chatId: currentChat.id,
                members: currentChat.members as User[],
              }),
            );
          }

          try {
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
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy tin nhắn:', error);
      }
    };

    fetchMessagesAndMembers();
  }, [currentChat, isInitialized, dispatch]);

  // Fetch recent chats
  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!isInitialized) return;
      try {
        const res = await chatSDK.getChats();
        dispatch(setRecentChats(res.data || []));
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chat:', error);
      }
    };

    fetchRecentChats();
  }, [isInitialized, dispatch]);

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

  const filteredMembers = allSystemUsers.filter(
    (m, index, self) =>
      m.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
      m.code !== user?._id &&
      index === self.findIndex((t) => t.code === m.code),
  );

  const toggleMemberSelection = (member: User) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m.id === member.id)
        ? prev.filter((m) => m.id !== member.id)
        : [...prev, member],
    );
  };

  const handleSelectChat = async (chat: ChatType) => {
    setCurrentChat(chat);
    setIsGroupMode(false);
    try {
      await chatSDK.readChat(chat.id);
      if (currentMember?.id) {
        dispatch(
          updateChatUnread({
            chatId: chat.id,
            unreadData: {
              ...((chat.new as any) || {}),
              [currentMember.id]: 0,
            },
          }),
        );
      }
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const memberIds = selectedMembers.map((m) => Number(m.id));

      try {
        await chatSDK.addGroup(
          memberIds,
          groupName,
          undefined,
          currentMember?.id,
        );
      } catch {
        console.warn('SDK gặp lỗi hiển thị nhưng nhóm có thể đã được tạo.');
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      const res = await chatSDK.getChats();
      const chats = res.data || [];
      dispatch(setRecentChats(chats));

      const targetGroup = chats.find(
        (c: ChatType) => c.name === groupName && c.type === 'group',
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

  const handleRemoveChat = async (chatId: number) => {
    if (!window.confirm('Bạn có chắc xóa cuộc trò chuyện này?')) return;

    try {
      await chatSDK.removeChat(chatId);
      const updatedChats = recentChats.filter((chat) => chat.id !== chatId);
      dispatch(setRecentChats(updatedChats));

      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }

      toast.success('Xóa cuộc trò chuyện thành công');
    } catch (error) {
      console.error('Lỗi khi xóa chat:', error);
      toast.error('Không thể xóa cuộc trò chuyện, vui lòng thử lại sau');
    }
  };

  const handleOpenAddMemberModal = async (chat?: ChatType) => {
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

  const handleUpdateGroupName = async (chat: ChatType) => {
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

  const handleSaveGroupName = async () => {
    if (!groupName.trim() || !editingChat) return;

    try {
      await chatSDK.updateGroup(editingChat.id, groupName.trim());

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

  const handleMessageAction = async (
    messageId: number,
    action: 'like' | 'love' | 'revoke' | 'remove',
  ) => {
    if (!currentChat) return;

    try {
      await chatSDK.actionMessage(currentChat.id, messageId, action);

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

  return (
    <div className="h-screen flex gap-0 no-header hidden-y hidden-x">
      {/* Sidebar - Danh sách chat */}
      <div className="w-[25%] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Search & Create Group */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm thành viên..."
                className="w-full bg-white rounded-xl py-2.5 pl-10 pr-4 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <CircleX
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                  size={15}
                />
              )}
            </div>
            <button
              onClick={() => {
                setIsGroupMode(true);
                setGroupName('');
                setSelectedMembers([]);
                setSearchQuery('');
              }}
              className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
              title="Tạo nhóm mới"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Recent chats list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {searchQuery.trim() ? (
            <>
              <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">
                Kết quả hệ thống
              </p>
              {filteredMembers.map((m) => (
                <div key={m.id}>
                  <ChatbotSearchList
                    m={m}
                    setCurrentChat={handleSelectChat}
                    setSearchQuery={setSearchQuery}
                    isGroupMode={isGroupMode}
                    isSelected={selectedMembers.some((sm) => sm.id === m.id)}
                    toggleMemberSelection={toggleMemberSelection}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">
                Trò chuyện gần đây
              </p>
              <RecentChat
                setCurrentChat={handleSelectChat}
                user={user}
                onRemoveChat={handleRemoveChat}
                onUpdateGroupName={handleUpdateGroupName}
                onAddMember={handleOpenAddMemberModal}
              />
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {isGroupMode ? (
          <>
            <div className="h-full flex flex-col ">
              <div className="h-20 px-8 border-b border-slate-200 flex items-center bg-white">
                <button
                  onClick={() => {
                    setIsGroupMode(false);
                    setSelectedMembers([]);
                    setGroupName('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-600" />
                </button>
                <h2 className="text-lg font-bold text-slate-800 ml-4">
                  Tạo nhóm mới
                </h2>
              </div>
              {/* Create Group Screen */}
              <div className="h-full w-full relative">
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
              </div>
            </div>
          </>
        ) : currentChat ? (
          <>
            {/* Chat Header */}
            <div className="h-20 px-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentChat(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-600" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {getChatName()}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <UserIcon size={14} className="text-slate-500" />
                    <p className="text-sm text-slate-500">
                      {currentChat.type === 'group'
                        ? `${currentChatMembers.length} thành viên`
                        : 'Đang hoạt động'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                  <Phone size={20} />
                </button>
                <button
                  onClick={() => {
                    if (currentChat.type === 'group') {
                      handleOpenAddMemberModal(currentChat);
                    }
                  }}
                  className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={() => handleUpdateGroupName(currentChat)}
                  className="p-2.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                >
                  <Info size={20} />
                </button>
              </div>
            </div>

            <div className="relative h-full">
              {currentChat ? (
                <ScreenChat
                  scrollRef={scrollContainerRef}
                  user={user as any}
                  currentChat={currentChat}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  onMessageAction={handleMessageAction}
                  onAddMemberClick={handleOpenAddMemberModal}
                  replyMessage={replyMessage}
                  setReplyMessage={setReplyMessage}
                  onScroll={loadMoreMessages}
                  isLoadingMore={isLoadingMore}
                />
              ) : (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquareMore size={48} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Chọn một cuộc trò chuyện
                  </h3>
                  <p className="text-slate-500 text-center max-w-xs">
                    Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin
                    hoặc tạo một nhóm mới
                  </p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Modals */}
      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setGroupName('');
          setSelectedMembers([]);
          setEditingChat(null);
        }}
        groupName={groupName}
        setGroupName={setGroupName}
        onSave={handleSaveGroupName}
        chatId={editingChat?.id}
        onRemoveMember={handleRemoveMember}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        systemMembers={allSystemUsers}
        onAdd={handleAddMember}
      />
    </div>
  );
};
