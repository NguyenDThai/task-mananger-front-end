import { X } from 'lucide-react';
import { useState } from 'react';

interface ChatItemProps {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount?: number;
  isActive?: boolean;
  isGroup?: boolean;
  onSelect: (chatId: number) => void;
  onDelete?: (chatId: number) => void;
}

export const ChatItem = ({
  id,
  name,
  avatar,
  lastMessage,
  unreadCount,
  isActive,
  isGroup = false,
  onSelect,
  onDelete,
}: ChatItemProps) => {
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div
      className={`
        flex items-center gap-4 px-3 py-2.5 cursor-pointer transition-all duration-200
        border-b border-gray-100 last:border-b-0
        ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50/50'}
      `}
      onClick={() => onSelect(id)}
      onMouseEnter={() => setShowDeleteBtn(true)}
      onMouseLeave={() => setShowDeleteBtn(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-600 font-medium text-xs">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Chat info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-gray-900 truncate text-sm">
            {name}
            {isGroup && (
              <span className="ml-1.5 text-xs text-gray-400 font-normal">
                Nhóm
              </span>
            )}
          </h3>
          {unreadCount && unreadCount > 0 && (
            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-5 h-5 bg-gray-900 text-white text-xs font-semibold rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-xs text-gray-400 truncate mt-1">{lastMessage}</p>
        )}
      </div>

      {/* Delete button */}
      {showDeleteBtn && onDelete && (
        <button
          onClick={handleDelete}
          className="flex-shrink-0 p-1 text-gray-300 hover:text-gray-600 transition-colors"
          title="Xóa chat"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
