import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { ChatItem } from './ChatItem';

interface IChatItem {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount?: number;
  isGroup?: boolean;
}

interface ChatSidebarProps {
  chats: IChatItem[];
  activeChatId?: number;
  isLoading?: boolean;
  onSelectChat: (chatId: number) => void;
  onDeleteChat: (chatId: number) => void;
  onCreateNewChat: () => void;
}

export const ChatSidebar = ({
  chats,
  activeChatId,
  isLoading = false,
  onSelectChat,
  onDeleteChat,
  onCreateNewChat,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }
    const query = searchQuery.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(query) ||
        chat.lastMessage?.toLowerCase().includes(query),
    );
  }, [searchQuery, chats]);

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Tin nhắn</h2>
          <button
            onClick={onCreateNewChat}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
            title="Tạo chat mới"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              <p className="text-gray-600 font-medium">Chưa có chat nào</p>
              <p className="text-sm text-gray-500 mt-1">
                Hãy bắt đầu một cuộc trò chuyện mới
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                {...chat}
                isActive={activeChatId === chat.id}
                onSelect={onSelectChat}
                onDelete={onDeleteChat}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <p>Tổng: {chats.length} cuộc trò chuyện</p>
      </div>
    </div>
  );
};
