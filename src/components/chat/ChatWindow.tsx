import React from 'react';
import type { IMessageItem, TMessageAction } from '../../types/chat.type';
import { Smile, X, ChevronLeft } from 'lucide-react';
import { MessagesList } from './MessageList';

interface ChatWindowProps {
  chatId?: number;
  chatUnread?: {
    [user_id: number]: number;
  };
  chatName?: string;
  chatAvatar?: string;
  messages: IMessageItem[];
  isLoading?: boolean;
  isLoadingOldMessages?: boolean;
  onSendMessage: (
    content: string,
    files: File[],
    replyId?: number | null,
  ) => Promise<void>;
  onMessageAction?: (messageId: number, action: TMessageAction) => void;
  onLoadOldMessages?: () => void;
  onBack?: () => void;
}

export const ChatWindow = React.memo(
  ({
    chatId,
    chatName = 'Chat',
    chatAvatar,
    messages = [],
    isLoading = false,
    isLoadingOldMessages = false,
    onSendMessage,
    onMessageAction,
    onLoadOldMessages,
    onBack,
  }: ChatWindowProps) => {
    const [messageInput, setMessageInput] = React.useState('');
    const [isSendingMessage, setIsSendingMessage] = React.useState(false);
    const [hoveredMessageId, setHoveredMessageId] = React.useState<
      number | null
    >(null);
    const [openMenuId, setOpenMenuId] = React.useState<{
      messageId: number | null;
      type: 'reaction' | 'more' | null;
    }>({
      messageId: null,
      type: null,
    });
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = React.useState(false);
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const [replyingTo, setReplyingTo] = React.useState<IMessageItem | null>(
      null,
    );
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const emojiPickerRef = React.useRef<HTMLDivElement>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const messagesStartRef = React.useRef<HTMLDivElement>(null);
    const intersectionObserverRef = React.useRef<IntersectionObserver | null>(
      null,
    );

    const [isReadyForInfiniteScroll, setIsReadyForInfiniteScroll] =
      React.useState(false);
    const lastMessageIdRef = React.useRef<number | null>(null);
    const wasSendingMessageRef = React.useRef(isSendingMessage);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Popular emojis
    const emojis = [
      '😀',
      '😂',
      '😍',
      '🥰',
      '😭',
      '😢',
      '😡',
      '🤔',
      '👍',
      '👎',
      '❤️',
      '🔥',
      '🎉',
      '🎊',
      '✨',
      '🚀',
    ];

    const scrollToBottom = React.useCallback(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      });
    }, []);

    const scrollToMessage = (messageId: number) => {
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the message briefly
        element.classList.add('bg-yellow-100');
        setTimeout(() => {
          element.classList.remove('bg-yellow-100');
        }, 2000);
      }
    };

    React.useEffect(() => {
      lastMessageIdRef.current = null;
      setIsReadyForInfiniteScroll(false);
    }, [chatId]);

    React.useEffect(() => {
      if (!isLoading && messages.length > 0 && !isReadyForInfiniteScroll) {
        // Đợi một khoảng ngắn để trình duyệt hoàn tất việc scroll xuống dưới
        const timer = setTimeout(() => {
          setIsReadyForInfiniteScroll(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [messages, isLoading, isReadyForInfiniteScroll]);

    React.useEffect(() => {
      if (isLoading || messages.length === 0) return;

      const currentLastMessage = messages[0];
      const prevLastMessageId = lastMessageIdRef.current;

      let timer: number;
      if (
        prevLastMessageId === null ||
        currentLastMessage.id !== prevLastMessageId
      ) {
        scrollToBottom();
        timer = setTimeout(() => {
          scrollToBottom();
        }, 300);
      }

      lastMessageIdRef.current = currentLastMessage.id;

      return () => clearTimeout(timer);
    }, [messages, isLoading]);

    // Infinity scroll: Load old messages when user scrolls to top
    React.useEffect(() => {
      if (
        !messagesStartRef.current ||
        !onLoadOldMessages ||
        isLoadingOldMessages ||
        !isReadyForInfiniteScroll
      ) {
        return;
      }

      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingOldMessages) {
          onLoadOldMessages();
        }
      };

      intersectionObserverRef.current = new IntersectionObserver(
        handleIntersection,
        {
          root: messagesStartRef.current.parentElement,
          rootMargin: '20px 0px',
          threshold: 0.1,
        },
      );

      intersectionObserverRef.current.observe(messagesStartRef.current);

      return () => {
        if (intersectionObserverRef.current) {
          intersectionObserverRef.current.disconnect();
        }
      };
    }, [onLoadOldMessages, isLoadingOldMessages, isReadyForInfiniteScroll]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        // Chỉ đóng menu nếu click vào element không phải là phần của reaction menu
        if (!target.closest('[data-reaction-menu]')) {
          if (openMenuId.type === 'reaction') {
            setOpenMenuId({ messageId: null, type: null });
          }
          setHoveredMessageId(null);
        }
        // Đóng more menu nếu click ngoài
        if (!target.closest('[data-more-menu]')) {
          if (openMenuId.type === 'more') {
            setOpenMenuId({ messageId: null, type: null });
          }
        }
        // Đóng emoji picker nếu click ngoài (nhưng không phải click vào button emoji)
        if (
          !target.closest('[data-emoji-picker]') &&
          !target.closest('[data-emoji-button]')
        ) {
          setIsEmojiPickerOpen(false);
        }
      };

      if (openMenuId.type !== null || isEmojiPickerOpen) {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
      }
    }, [openMenuId, isEmojiPickerOpen]);

    // Effect: Clear form data sau khi gửi message thành công
    React.useEffect(() => {
      if (wasSendingMessageRef.current && !isSendingMessage) {
        // Từ đang gửi (true) -> gửi xong (false), có nghĩa là gửi thành công
        setMessageInput('');
        setSelectedFiles([]);
        setReplyingTo(null);
        // Focus vào textarea
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
      wasSendingMessageRef.current = isSendingMessage;
    }, [isSendingMessage]);

    const handleSend = async () => {
      if (messageInput.trim() || selectedFiles.length > 0) {
        setIsSendingMessage(true);
        try {
          // Đảm bảo content không rỗng và files là mảng
          await onSendMessage(
            messageInput.trim() || ' ',
            selectedFiles,
            replyingTo?.id,
          );
        } catch (error) {
          console.error('Lỗi khi gửi tin nhắn:', error);
        } finally {
          setIsSendingMessage(false);
        }
      }
    };

    const handleEmojiClick = (emoji: string) => {
      setMessageInput((prev) => prev + emoji);
      // Không đóng picker để user có thể thêm nhiều emoji
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const selectedFileList = Array.from(files);
        setSelectedFiles((prev) => [...prev, ...selectedFileList]);
      }
      // Reset input để có thể select cùng file lần nữa
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleRemoveFile = (index: number) => {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // Check if the item is an image
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            setSelectedFiles((prev) => [...prev, file]);
          }
        }
      }
    };

    const handleMessageAction = (messageId: number, action: TMessageAction) => {
      if (onMessageAction) {
        onMessageAction(messageId, action);
        setOpenMenuId({ messageId: null, type: null });
      }
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
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              title="Quay lại"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
          )}
          {!isLoading ? (
            <>
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
                <h2 className="font-medium text-gray-900 text-sm">
                  {chatName}
                </h2>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-xs">
                  {'...'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-gray-900 text-sm">
                  {'Đang tải...'}
                </h2>
              </div>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white flex-1 overflow-y-auto px-4 pb-4 pt-11 space-y-3 bg-transparent [&::-webkit-scrollbar]:!w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded">
          <MessagesList
            messages={messages}
            isLoading={isLoading}
            isLoadingOldMessages={isLoadingOldMessages}
            hoveredId={hoveredMessageId}
            openMenuId={openMenuId}
            onHover={setHoveredMessageId}
            onHoverLeave={() => {
              if (openMenuId.messageId === null) {
                setHoveredMessageId(null);
              }
            }}
            onMenuToggle={(id, type) => {
              setOpenMenuId(
                openMenuId.messageId === id && openMenuId.type === type
                  ? { messageId: null, type: null }
                  : { messageId: id, type },
              );
            }}
            onAction={(id, action) => {
              handleMessageAction(id, action);
            }}
            onReply={(msg) => {
              setReplyingTo(msg);
              setOpenMenuId({ messageId: null, type: null });
            }}
            onScroll={scrollToMessage}
            messagesStartRef={messagesStartRef}
            messagesEndRef={messagesEndRef}
          />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          {/* Reply Preview */}
          {replyingTo && (
            <div className="mb-2 flex items-center gap-2 bg-blue-50 p-2 rounded border-l-4 border-blue-500">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-900">
                  Trả lời: {replyingTo.member?.name || 'Người dùng'}
                </p>
                <p className="text-xs text-blue-800 truncate">
                  {replyingTo.content}
                </p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                title="Hủy trả lời"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {selectedFiles.map((file: File, index: number) => {
                const isImage = file.type.startsWith('image/');
                const fileSize = (file.size / 1024).toFixed(1);

                return (
                  <div key={`${file.name}-${index}`} className="relative group">
                    {isImage ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b">
                          {fileSize} KB
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded bg-gray-100 flex flex-col items-center justify-center border border-gray-200 group-hover:border-gray-300 transition-colors">
                        <svg
                          className="w-6 h-6 text-gray-400 mb-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-xs font-medium text-gray-600 truncate w-full px-1 text-center">
                          {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                        </p>
                      </div>
                    )}
                    {/* File Info Below Preview */}
                    <div className="mt-1 max-w-[80px]">
                      <p
                        className="text-xs font-medium text-gray-900 truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">{fileSize} KB</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      disabled={isSendingMessage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Xóa file"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                placeholder="Nhập tin nhắn..."
                rows={1}
                disabled={isSendingMessage}
                className="w-full px-3 py-2 bg-gray-50 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-gray-100 focus:ring-1 focus:ring-gray-300 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {/* File Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSendingMessage}
                  className="p-1 pb-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Thêm file"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>

                {/* Emoji Picker Button */}
                <button
                  data-emoji-button
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  disabled={isSendingMessage}
                  className="p-1 pb-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Thêm emoji"
                >
                  <Smile size={18} />
                </button>
              </div>

              {/* Emoji Picker Popup */}
              {isEmojiPickerOpen && (
                <div
                  ref={emojiPickerRef}
                  data-emoji-picker
                  className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50 w-64"
                >
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        data-emoji-picker
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmojiClick(emoji);
                        }}
                        className="text-xl hover:bg-gray-100 p-2 rounded transition-colors text-center"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={
                (!messageInput.trim() && selectedFiles.length === 0) ||
                isLoading ||
                isSendingMessage
              }
              className="px-4 py-2 bg-gray-900 text-white rounded font-medium text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center justify-center gap-2 min-w-[80px]"
            >
              {isSendingMessage ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Đang gửi</span>
                </>
              ) : (
                'Gửi'
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Enter để gửi, Shift+Enter để xuống dòng
          </p>
        </div>
      </div>
    );
  },
);

ChatWindow.displayName = 'ChatWindow';
