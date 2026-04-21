import { memo, useMemo } from 'react';
import type { IMessageItem, ISChatUser, TMessageAction } from '../../types';
import type { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import {
  Heart,
  MoreVertical,
  Reply,
  RotateCcw,
  Smile,
  ThumbsUp,
  Trash2,
} from 'lucide-react';

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua';
  } else {
    return date.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
    });
  }
};

// Helper function to get member avatar and name
const getSenderInfo = (message: IMessageItem) => {
  const member = message.member;
  return {
    code: member.code,
    name: member?.name || 'Người dùng',
    avatar: member?.avatar,
  };
};

// Component để render từng message item
const MessageItem = memo(
  ({
    message,
    isCurrentUser,
    hoveredId,
    openMenuId: menuId,
    shouldShowAvatar,
    seenBy,
    onHover,
    onHoverLeave,
    onMenuToggle,
    onAction,
    onReply,
    onScroll,
  }: {
    message: IMessageItem;
    index: number;
    isCurrentUser: boolean;
    hoveredId: number | null;
    openMenuId: { messageId: number | null; type: 'reaction' | 'more' | null };
    shouldShowAvatar: boolean;
    seenBy: ISChatUser[];
    onHover: (id: number) => void;
    onHoverLeave: () => void;
    onMenuToggle: (id: number, type: 'reaction' | 'more') => void;
    onAction: (id: number, action: TMessageAction) => void;
    onReply: (msg: IMessageItem) => void;
    onScroll: (id: number) => void;
  }) => {
    const senderInfo = getSenderInfo(message);
    const isHovered = hoveredId === message.id;
    const showReactions = isHovered && !message.revoke && !message.remove;

    return (
      <div
        key={message.id}
        id={`message-${message.id}`}
        className={`flex gap-2 justify-start items-center relative ${
          isCurrentUser ? 'flex-row-reverse' : ''
        } transition-colors duration-300`}
        onMouseEnter={() => onHover(message.id)}
        onMouseLeave={onHoverLeave}
      >
        {senderInfo.avatar && shouldShowAvatar ? (
          <img
            src={senderInfo.avatar}
            alt={senderInfo.name}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 self-end"
          />
        ) : (
          !isCurrentUser && <div className="w-7 h-7"></div>
        )}

        <div className="flex flex-col gap-1">
          <div
            className={`max-w-xs lg:max-w-md xl:max-w-lg px-3 py-2 rounded relative group ${
              isCurrentUser
                ? 'bg-blue-900 text-white'
                : 'bg-blue-100 text-gray-900'
            }`}
          >
            {!isCurrentUser && (
              <p className="text-xs font-medium mb-0.5 opacity-70">
                {senderInfo.name}
              </p>
            )}
            {/* Reply Preview */}
            {message.reply && (
              <div
                onClick={() => onScroll(message.reply!.id)}
                className={`mb-2 p-2 rounded text-xs border-l-2 cursor-pointer transition-all hover:opacity-80 ${
                  isCurrentUser
                    ? 'bg-blue-800 border-blue-400'
                    : 'bg-white/30 border-blue-300'
                }`}
              >
                <p className="font-medium opacity-80">
                  {message.reply.member?.name || 'Người dùng'}
                </p>
                <p className="opacity-70 truncate">{message.reply.content}</p>
              </div>
            )}
            <p className="text-sm break-words">{message.content}</p>
            {message.revoke && (
              <p className="text-xs italic opacity-50 mt-1">
                Tin nhắn đã được thu hồi
              </p>
            )}
            {message.remove && (
              <p className="text-xs italic opacity-50 mt-1">
                Tin nhắn đã bị xóa
              </p>
            )}
            <div
              className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}`}
            >
              <p
                className={`text-xs mt-1 ${
                  isCurrentUser ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {formatTime(message.created_at)}
              </p>
              {seenBy.length > 0 && (
                <div className="seen-status-container flex flex-row gap-1 mt-2">
                  {seenBy.slice(0, 3).map((user) => (
                    <img
                      key={user.id}
                      src={user.avatar || 'default-avatar.png'}
                      title={`Đã xem bởi ${user.name}`}
                      className="w-4 h-4 rounded-full"
                      alt={user.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reaction Button and Menu */}
        {showReactions && (
          <div
            className={`
              flex items-center gap-2 relative
              ${isCurrentUser ? 'flex-row-reverse' : ''}  
            `}
            data-reaction-menu
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle(
                  message.id,
                  menuId.messageId === message.id && menuId.type === 'reaction'
                    ? ('reaction' as const)
                    : ('reaction' as const),
                );
              }}
              className="p-1 text-white bg-gray-400 hover:bg-gray-500 rounded-full transition-all duration-200"
              title="Phản ứng"
            >
              <Smile size={16} />
            </button>

            {/* Reaction Actions Menu */}
            {menuId.messageId === message.id && menuId.type === 'reaction' && (
              <div
                className={`absolute bottom-full mb-2 flex gap-1 bg-white rounded-xl shadow-lg border border-gray-200 p-2
                    ${isCurrentUser ? '-left-8' : 'left-0'}
                  `}
                data-reaction-menu
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(message.id, 'like');
                  }}
                  title="Thích"
                  className="p-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <ThumbsUp size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(message.id, 'love');
                  }}
                  title="Yêu thích"
                  className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <Heart size={18} />
                </button>
              </div>
            )}

            {/* More Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle(
                  message.id,
                  menuId.messageId === message.id && menuId.type === 'more'
                    ? ('more' as const)
                    : ('more' as const),
                );
              }}
              className="p-1 text-white bg-gray-400 hover:bg-gray-500 rounded-full transition-all duration-200"
              title="Thêm tùy chọn"
              data-more-menu
            >
              <MoreVertical size={16} />
            </button>

            {/* More Menu */}
            {menuId.messageId === message.id && menuId.type === 'more' && (
              <div
                className={`absolute bottom-full mb-2 flex gap-1 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-50
            ${isCurrentUser ? '-left-26' : 'left-7'}
          `}
                data-more-menu
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply(message);
                  }}
                  title="Trả lời"
                  className="p-2 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <Reply size={18} />
                </button>

                {isCurrentUser && (
                  <>
                    <div className="w-px bg-gray-200"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(message.id, 'revoke');
                      }}
                      title="Thu hồi"
                      className="p-2 hover:bg-amber-50 text-gray-600 hover:text-amber-600 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction(message.id, 'remove');
                      }}
                      title="Xóa"
                      className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-all duration-200 hover:scale-110"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

// Component để render danh sách messages
const MessagesList = memo(
  ({
    messages: msgList,
    isLoading,
    isLoadingOldMessages,
    hoveredId,
    openMenuId: menuId,
    onHover,
    onHoverLeave,
    onMenuToggle,
    onAction,
    onReply,
    onScroll,
    messagesStartRef: startRef,
    messagesEndRef: endRef,
  }: {
    messages: IMessageItem[];
    isLoading: boolean;
    isLoadingOldMessages: boolean;
    hoveredId: number | null;
    openMenuId: { messageId: number | null; type: 'reaction' | 'more' | null };
    onHover: (id: number) => void;
    onHoverLeave: () => void;
    onMenuToggle: (id: number, type: 'reaction' | 'more') => void;
    onAction: (id: number, action: TMessageAction) => void;
    onReply: (msg: IMessageItem) => void;
    onScroll: (id: number) => void;
    messagesStartRef: React.RefObject<HTMLDivElement | null>;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
  }) => {
    const { currentChatMembers, currentUser, currentChat } = useSelector(
      (state: RootState) => state.chat,
    );

    const seenMap = useMemo(() => {
      if (!currentChat?.id || !msgList.length) return {};

      const newSeenMap: { [messageId: number]: ISChatUser[] } = {};

      currentChatMembers.forEach((member) => {
        if (!member?.id || member.id === currentUser?.id) return;

        const unreadCount = currentChat.new[member.id] || 0;
        let targetMessage: IMessageItem | null =
          unreadCount === 0 ? msgList[0] : null;

        if (unreadCount > 0) {
          let otherMsgCount = 0;
          for (let i = 0; i < msgList.length - 1; i++) {
            if (msgList[i].member?.id !== member.id) {
              otherMsgCount++;
            }
            if (otherMsgCount === unreadCount) {
              targetMessage = msgList[i + 1];
              break;
            }
          }
        }

        if (targetMessage) {
          if (!newSeenMap[targetMessage.id]) {
            newSeenMap[targetMessage.id] = [];
          }
          newSeenMap[targetMessage.id].push(member);
        }
      });

      return newSeenMap;
    }, [currentChat, currentChatMembers, msgList, currentUser]);

    return (
      <>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-400">Đang tải tin nhắn...</p>
            </div>
          </div>
        ) : msgList.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">
                Chưa có tin nhắn nào
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Hãy gửi tin nhắn đầu tiên
              </p>
            </div>
          </div>
        ) : (
          <>
            <div ref={startRef} />
            {isLoadingOldMessages && (
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin mx-auto mb-1"></div>
                  <p className="text-xs text-gray-400">
                    Đang tải tin nhắn cũ...
                  </p>
                </div>
              </div>
            )}
            {msgList.toReversed().map((message, index, list) => {
              const isCurrentUser =
                currentUser && message.member?.id === currentUser.id;

              const shouldShowAvatar =
                !isCurrentUser &&
                (index === list.length - 1 ||
                  list.at(index + 1)?.member?.id !== message.member?.id);

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  index={index}
                  isCurrentUser={isCurrentUser || false}
                  shouldShowAvatar={shouldShowAvatar}
                  hoveredId={hoveredId}
                  openMenuId={menuId}
                  onHover={onHover}
                  onHoverLeave={onHoverLeave}
                  onMenuToggle={onMenuToggle}
                  onAction={onAction}
                  onReply={onReply}
                  onScroll={onScroll}
                  seenBy={seenMap[message.id] || []}
                />
              );
            })}
            <div ref={endRef} />
          </>
        )}
      </>
    );
  },
);

MessagesList.displayName = 'MessagesList';
MessageItem.displayName = 'MessageItem';

export { MessagesList };
