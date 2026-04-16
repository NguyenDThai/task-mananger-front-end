import React from 'react';
import type { IMessageItem } from '../../types/chat.type';

interface ChatWindowProps {
  chatId?: number;
  chatName?: string;
  chatAvatar?: string;
  messages: IMessageItem[];
  isLoading?: boolean;
  currentUserId?: number;
  onSendMessage: (content: string) => void;
}

export const ChatWindow = ({
  chatId,
  chatName = 'Chat',
  chatAvatar,
  messages = [],
  isLoading = false,
  currentUserId,
  onSendMessage,
}: ChatWindowProps) => {
  const [messageInput, setMessageInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
      name: member?.name || 'Người dùng',
      avatar: member?.avatar,
    };
  };

  if (!chatId) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-8 h-8 text-gray-300"
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
            Chọn một chat để bắt đầu
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Chọn cuộc trò chuyện từ danh sách bên trái
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-14 bg-white flex items-center gap-3 px-4 py-3 border-b border-gray-100 sticky top-0">
        {chatAvatar ? (
          <img
            src={chatAvatar}
            alt={chatName}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium text-xs">
              {chatName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h2 className="font-medium text-gray-900 text-sm">{chatName}</h2>
          <p className="text-xs text-gray-400">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white flex-1 overflow-y-auto p-4 space-y-3 bg-transparent [&::-webkit-scrollbar]:!w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-gray-400">Đang tải tin nhắn...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
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
            {messages.map((message) => {
              const senderInfo = getSenderInfo(message);
              // Determine if this is a message from current user
              const isCurrentUser =
                currentUserId && message.member?.id === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isCurrentUser && senderInfo.avatar && (
                    <img
                      src={senderInfo.avatar}
                      alt={senderInfo.name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                  )}

                  <div className="flex flex-col gap-1">
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg px-3 py-2 rounded ${
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
                    </div>
                    <p
                      className={`text-xs ${
                        isCurrentUser
                          ? 'text-right text-gray-400'
                          : 'text-left text-gray-500'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            rows={1}
            className="flex-1 px-3 py-2 bg-gray-50 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-100 focus:ring-1 focus:ring-gray-300 resize-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!messageInput.trim() || isLoading}
            className="px-4 py-2 bg-gray-900 text-white rounded font-medium text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            Gửi
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Enter để gửi, Shift+Enter để xuống dòng
        </p>
      </div>
    </div>
  );
};
