import { useMemo, useState, useRef } from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { IChatItem, ISChatUser } from '../../types/chat.type';
import { ChatItem } from './ChatItem';

interface ChatSidebarProps {
  chats: IChatItem[];
  activeChat?: IChatItem | null;
  currentUser?: ISChatUser | null;
  isLoading?: boolean;
  onSelectChat: (chatId: number) => void;
  onDeleteChat: (chatId: number) => void;
  onCreateNewChat: () => void;
}

export const ChatSidebar = ({
  chats,
  activeChat,
  currentUser,
  isLoading = false,
  onSelectChat,
  onDeleteChat,
  onCreateNewChat,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      // Search in member names
      const memberNames =
        chat.members?.some((member) =>
          member.name?.toLowerCase().includes(query),
        ) ?? false;

      // Search in message content
      const messageContent =
        typeof chat.message?.content === 'string' &&
        chat.message.content.toLowerCase().includes(query);

      return memberNames || messageContent;
    });
  }, [searchQuery, chats]);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 px-4 py-3 border-b border-gray-100 bg-white">
        {isSearchOpen ? (
          /* Search Bar */
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-gray-50 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-100 focus:ring-1 focus:ring-gray-300 transition-all"
              />
            </div>
            <button
              onClick={handleCloseSearch}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-gray-900"
              title="Đóng tìm kiếm"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          /* Title with buttons */
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Tin nhắn</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSearchClick}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-gray-900"
                title="Tìm chat"
              >
                <Search size={18} />
              </button>
              <button
                onClick={onCreateNewChat}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-gray-900"
                title="Tạo chat mới"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:!w-0 [&::-webkit-scrollbar]:!h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-400">Đang tải...</p>
            </div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-sm font-medium">
                Chưa có chat nào
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Bắt đầu một cuộc trò chuyện mới
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => (
              <ChatItem
                key={`${chat.id}-${chat.code}`}
                chat={chat}
                isActive={activeChat?.id === chat.id}
                currentUser={currentUser}
                onSelect={onSelectChat}
                onDelete={onDeleteChat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
