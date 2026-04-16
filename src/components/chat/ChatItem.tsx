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
        flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200
        ${
          isActive
            ? 'bg-blue-50 border-l-4 border-blue-600'
            : 'hover:bg-gray-50 border-l-4 border-transparent'
        }
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
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Chat info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate text-sm">
            {name}
            {isGroup && (
              <span className="ml-2 text-xs text-gray-500 font-normal">
                (Nhóm)
              </span>
            )}
          </h3>
          {unreadCount && unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-xs text-gray-500 truncate mt-1">{lastMessage}</p>
        )}
      </div>

      {/* Delete button */}
      {showDeleteBtn && onDelete && (
        <button
          onClick={handleDelete}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Xóa chat"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
