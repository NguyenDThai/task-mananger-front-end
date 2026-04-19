import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import type { IChatItem, ISChatUser } from '../../types/chat.type';

interface ChatItemProps {
  chat: IChatItem;
  unreadCount?: number;
  isActive?: boolean;
  currentUser?: ISChatUser | null;
  onSelect: (chatId: number) => void;
  onDelete?: (chatId: number) => void;
}

// Utility function to format time
const formatMessageTime = (time?: string): string => {
  if (!time) return '';

  const messageDate = new Date(time);
  const now = new Date();
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return messageDate.toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
  });
};

// Get chat display name based on type
const getChatDisplayName = (
  chat: IChatItem,
  currentUser?: ISChatUser | null,
): string => {
  if (chat.type === 'group' && chat.name) {
    return chat.name;
  }
  // For single chat, get the other member's name
  if (currentUser) {
    const otherMember = chat.members?.find(
      (member) => member.code !== currentUser.code,
    );
    if (otherMember) {
      return otherMember.name;
    }
  }
  return chat.members?.[0]?.name || 'Chat';
};

// Get chat avatar from other member (for single chat) or first member (for group)
const getChatAvatar = (
  chat: IChatItem,
  currentUser?: ISChatUser | null,
): string | undefined => {
  if (chat.type === 'group' && chat.avatar) {
    return chat.avatar;
  }
  // For single chat, get the other member's avatar
  if (currentUser) {
    const otherMember = chat.members?.find(
      (member) => member.code !== currentUser.code,
    );
    if (otherMember) {
      return otherMember.avatar;
    }
  }
  return chat.members?.[0]?.avatar;
};

export const ChatItem = ({
  chat,
  unreadCount,
  isActive,
  currentUser,
  onSelect,
  onDelete,
}: ChatItemProps) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const chatName = getChatDisplayName(chat, currentUser);
  const avatar = getChatAvatar(chat, currentUser);
  const lastMessageContent = chat.message?.content;
  const lastMessageTime = chat.message?.created_at || chat.updated_at;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(chat.id);
    }
  };

  return (
    <div className="relative group" onMouseLeave={() => setShowMoreMenu(false)}>
      {/* Main item */}
      <div
        className={`
          flex items-center gap-4 px-3 py-2.5 cursor-pointer transition-all duration-200
          border-b border-gray-50/50 last:border-b-0 h-16 relative z-10
          ${isActive ? 'bg-white' : 'hover:bg-gray-50/50'}
        `}
        onClick={() => onSelect(chat.id)}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={chatName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 font-medium text-xs">
                {chatName ? chatName.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
          )}
        </div>

        {/* Chat info */}
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <div className="flex flex-col items-start justify-start w-40">
            <h3 className="font-medium text-gray-900 truncate text-sm w-full">
              {chatName}
            </h3>
            {lastMessageContent && (
              <p className="text-xs text-gray-400 truncate mt-1 w-full">
                {lastMessageContent}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start justify-start">
            {unreadCount && unreadCount > 0 && (
              <span className="flex-shrink-0 inline-flex items-center justify-center min-w-7 h-5 bg-gray-900 text-white text-xs font-semibold rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {lastMessageTime && (
              <span className="text-xs text-gray-400 mt-1">
                {formatMessageTime(lastMessageTime)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gradient Scrim + Blur Overlay (Combined) */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 
          flex items-center justify-end
          /* Hiệu ứng nền: Mờ + Gradient đen nhạt mượt */
          backdrop-blur-sm 
          bg-gradient-to-l from-black/20 via-black/10 to-transparent
          /* Hiệu ứng chuyển động*/
          opacity-0 translate-x-2 
          /* Trạng thái Hover: Hiện + Trượt vào đúng vị trí */
          group-hover:opacity-100 group-hover:translate-x-0 
          transition-all duration-300 ease-out z-20
          /* Quản lý click */
          pointer-events-none group-hover:pointer-events-auto"
      >
        {/* More menu button */}
        <div className="relative mr-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMoreMenu(!showMoreMenu);
            }}
            className="p-1.5 text-white bg-white/20 hover:text-black hover:bg-white/60 rounded transition-colors"
            title="Thêm tùy chọn"
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown menu */}
          {showMoreMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement pin/unpin functionality
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ghim chat
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement mute functionality
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Tắt thông báo
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(e);
                  setShowMoreMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Xóa chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
