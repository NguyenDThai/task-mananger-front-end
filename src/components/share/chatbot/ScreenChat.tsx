import {
  ArrowDown,
  Heart,
  MessageSquareMore,
  Paperclip,
  Plus,
  Reply,
  RotateCcw,
  Send,
  Smile,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  currentMessages,
  selectOnlineUser,
} from '../../../redux/slides/chat/chatSlide';
import type { Chat, Message, UserChat } from '../../../types';

interface ScreenChatProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  user: {
    _id?: string;
    id?: string | number;
    name?: string;
    code?: string;
  } | null;
  currentChat: Chat | null;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  handleSendMessage: (content?: string, files?: FileList | File[]) => void;
  onMessageAction: (
    messageId: number,
    action: 'like' | 'love' | 'revoke' | 'remove',
  ) => void;
  onAddMemberClick: (chat?: Chat) => void;
  replyMessage: Message | null;
  setReplyMessage: (msg: Message | null) => void;
  onScroll: () => void;
  isLoadingMore: boolean;
}

const ScreenChat = ({
  scrollRef,
  user,
  currentChat,
  newMessage,
  setNewMessage,
  handleSendMessage,
  onMessageAction,
  onAddMemberClick,
  replyMessage,
  setReplyMessage,
  onScroll,
  isLoadingMore,
}: ScreenChatProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messages = useSelector(currentMessages);
  const onlineUsers = useSelector(selectOnlineUser);

  const emojis = [
    {
      cat: 'Phổ biến',
      items: ['😂', '❤️', '😍', '🤣', '😊', '🙏', '😭', '😘', '👍', '✨'],
    },
    {
      cat: 'Cảm xúc',
      items: ['😎', '🤔', '🤨', '😐', '😑', '🙄', '😏', '😣', '😥', '😮'],
    },
    {
      cat: 'Biểu tượng',
      items: ['🔥', '💯', '🚀', '⭐', '🎈', '🎉', '🎁', '💎', '🌈', '⚡'],
    },
  ];

  const addEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const val = newMessage;
      const nextText = val.substring(0, start) + emoji + val.substring(end);
      setNewMessage(nextText);

      // Đưa con trỏ ra sau emoji vừa chèn
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setNewMessage(newMessage + emoji);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      e.target.value = ''; // Reset input to allow re-selecting same file
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSend = () => {
    if (!newMessage.trim() && selectedFiles.length === 0 && !replyMessage)
      return;
    // Chuyển mảng File[] sang FileList (nếu cần) hoặc truyền trực tiếp nếu SDK hỗ trợ
    handleSendMessage(newMessage, selectedFiles);
    setSelectedFiles([]);
    setNewMessage('');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop === 0) {
      onScroll();
    }

    const isFarFromBottom = scrollHeight - clientHeight - scrollTop > 300;
    setShowScrollBottom(isFarFromBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-300 ${currentChat ? 'translate-x-0' : 'translate-x-full opacity-0'}`}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 scrollbar-hide"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {messages.length > 0 ? (
          messages.map((item: Message) => {
            // SDK trả về field thành viên trong item.member
            const sender = (item.member as UserChat) || ({} as UserChat);
            const isMine =
              ((sender.code as string) || (item.sender_code as string)) ===
              user?._id;
            const isRevoked = item.revoke;

            return (
              <div
                key={item.id}
                id={`msg-${item.id}`}
                className={`group relative flex items-end gap-3 ${
                  isMine ? 'flex-row-reverse' : 'flex-row'
                } animate-in fade-in slide-in-from-bottom-2 duration-500 cursor-default`}
              >
                {/* Floating Action Menu */}
                {!isRevoked && (
                  <div
                    className={`absolute -top-4 ${isMine ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 group-hover:-top-9 transition-all duration-300 z-10 pointer-events-none group-hover:pointer-events-auto`}
                  >
                    <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-full border border-slate-200/60 shadow-xl shadow-indigo-500/10">
                      <button
                        onClick={() => onMessageAction(item.id, 'like')}
                        className="p-1.5 hover:bg-yellow-50 rounded-full text-slate-400 hover:text-yellow-500 transition-colors"
                        title="Thích"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        onClick={() => onMessageAction(item.id, 'love')}
                        className="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                        title="Yêu thích"
                      >
                        <Heart size={14} />
                      </button>
                      <button
                        onClick={() => setReplyMessage(item)}
                        className="p-1.5 hover:bg-indigo-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Trả lời"
                      >
                        <Reply size={14} />
                      </button>
                      {isMine && (
                        <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-100">
                          <button
                            onClick={() => onMessageAction(item.id, 'revoke')}
                            className="p-1.5 hover:bg-indigo-50 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Thu hồi"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={() => onMessageAction(item.id, 'remove')}
                            className="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-600 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sender Avatar */}
                {!isMine && (
                  <div className="relative shrink-0 group/avatar">
                    <div className="w-9 h-9 rounded-2xl overflow-hidden bg-linear-to-tr from-indigo-50 to-white flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm border border-slate-100 group-hover/avatar:border-indigo-200 transition-colors">
                      {sender.avatar ? (
                        <img
                          src={sender.avatar as string}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
                          alt=""
                        />
                      ) : (
                        <span className="text-xs uppercase">
                          {(sender.name as string)?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white rounded-full shadow-sm ${onlineUsers[sender.id] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    ></div>
                  </div>
                )}

                <div
                  className={`flex flex-col gap-1.5 max-w-[78%] ${isMine ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Name (for group chats) */}
                  {currentChat?.type === 'group' && !isMine && (
                    <span className="text-[11px] font-semibold text-slate-500 px-2 tracking-tight">
                      {sender.name as string}
                    </span>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative px-4 py-2.5 text-[13.5px] leading-relaxed transition-all duration-300 ${
                      isRevoked
                        ? 'bg-slate-100 text-slate-400 italic border border-slate-200 rounded-[22px]'
                        : isMine
                          ? 'bg-linear-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white rounded-[22px] rounded-br-[4px] shadow-md shadow-indigo-500/10'
                          : 'bg-white text-slate-700 rounded-[22px] rounded-bl-[4px] border border-slate-100/80 shadow-sm shadow-slate-200/50 hover:border-slate-200'
                    }`}
                  >
                    {isRevoked ? (
                      <span className="opacity-60 text-[11px]">
                        Tin nhắn đã được thu hồi
                      </span>
                    ) : (
                      <>
                        {/* HIỂN THỊ TIN NHẮN GỐC (NẾU LÀ TRẢ LỜI) */}
                        {(item.reply || item.reply_id) && (
                          <div
                            className={`mb-2 p-2 rounded-lg border-l-2 text-[11px] truncate max-w-full cursor-pointer transition-colors ${
                              isMine
                                ? 'bg-indigo-700/30 border-indigo-300 text-indigo-50'
                                : 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100'
                            }`}
                            onClick={() => {
                              const rId = item.reply?.id || item.reply_id;
                              const el = document.getElementById(`msg-${rId}`);
                              el?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                              });
                            }}
                          >
                            {(() => {
                              const originalMsg =
                                item.reply ||
                                messages.find(
                                  (m) => m.id === Number(item.reply_id),
                                );
                              if (!originalMsg)
                                return (
                                  <span className="italic">
                                    Tin nhắn không còn tồn tại
                                  </span>
                                );
                              return (
                                <>
                                  <span className="font-bold block mb-0.5">
                                    {originalMsg.member?.name || 'Người dùng'}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {originalMsg.files &&
                                      originalMsg.files.length > 0 &&
                                      [
                                        'jpg',
                                        'jpeg',
                                        'png',
                                        'gif',
                                        'webp',
                                      ].includes(
                                        originalMsg.files[0].ext?.toLowerCase(),
                                      ) && (
                                        <img
                                          src={originalMsg.files[0].link}
                                          alt=""
                                          className="w-8 h-8 rounded-md object-cover border border-white/20"
                                        />
                                      )}
                                    <span className="opacity-80 truncate">
                                      {originalMsg.content ||
                                        (originalMsg.files &&
                                        originalMsg.files.length > 0
                                          ? 'Một tệp tin'
                                          : '...')}
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                        {/* HIỂN THỊ HÌNH ẢNH (NẾU CÓ) */}
                        {item.files && item.files.length > 0 && (
                          <div
                            className={`flex flex-col gap-2 ${item.content ? 'mb-2' : ''}`}
                          >
                            {item.files.map((file) => {
                              const isImg = [
                                'jpg',
                                'jpeg',
                                'png',
                                'gif',
                                'webp',
                              ].includes(file.ext?.toLowerCase());
                              if (isImg) {
                                return (
                                  <div
                                    key={file.id}
                                    className="relative group/img overflow-hidden rounded-xl border border-black/5"
                                  >
                                    <img
                                      src={file.link}
                                      alt={file.name}
                                      className="max-w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                      onClick={() =>
                                        window.open(file.link, '_blank')
                                      }
                                    />
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={file.id}
                                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                                    isMine
                                      ? 'bg-white/10 border-white/20'
                                      : 'bg-slate-50 border-slate-200'
                                  }`}
                                >
                                  <Paperclip size={16} />
                                  <a
                                    href={file.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs hover:underline truncate max-w-[150px]"
                                  >
                                    {file.name}
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {item.content}
                      </>
                    )}

                    {/* Reactions */}
                    {(item.like || item.love) && !isRevoked && (
                      <div
                        className={`absolute -bottom-2 ${isMine ? '-left-1' : '-right-1'} flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-full shadow-md border border-slate-100 z-10 transition-all duration-300 animate-in zoom-in-50`}
                      >
                        {item.like && (
                          <ThumbsUp
                            size={10}
                            className="text-yellow-500 fill-yellow-500"
                          />
                        )}
                        {item.love && (
                          <Heart
                            size={10}
                            className="text-red-500 fill-red-500"
                          />
                        )}
                      </div>
                    )}

                    {/* Glass sheen for user messages */}
                    {isMine && !isRevoked && (
                      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-white/10 rounded-[22px] rounded-br-[4px] pointer-events-none"></div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`flex items-center gap-1.5 px-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                      {new Date(item.created_at as string).toLocaleTimeString(
                        [],
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 opacity-60">
            <MessageSquareMore size={40} />
            <p className="text-xs">
              Chưa có tin nhắn nào. Hãy bắt đầu chào nhau!
            </p>
          </div>
        )}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-20 left-1/2 flex items-center justify-center -translate-x-1/2 w-8 h-8 rounded-full bg-white cursor-pointer hover:bg-slate-100 hover:text-slate-500"
          >
            <ArrowDown size={20} className="text-slate-400" />

            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full hidden"></span>
          </button>
        )}
      </div>
      {/* Thanh hiển thị tin nhắn đang trả lời */}
      {replyMessage && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col border-l-2 border-indigo-500 pl-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              Đang trả lời {replyMessage.member?.name || 'Người dùng'}
            </span>
            <span className="text-xs text-slate-500 truncate max-w-[250px]">
              {replyMessage.content ||
                (replyMessage.files && replyMessage.files.length > 0
                  ? 'Một tệp tin'
                  : '...')}
            </span>
          </div>
          <button
            onClick={() => setReplyMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* THANH PREVIEW FILE TRƯỚC KHI GỬI */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-3 overflow-x-auto scrollbar-hide animate-in slide-in-from-bottom-2">
          {selectedFiles.map((file, index) => {
            const isImg = file.type.startsWith('image/');
            const previewUrl = isImg ? URL.createObjectURL(file) : null;

            return (
              <div
                key={`${file.name}-${index}`}
                className="relative shrink-0 w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 group"
              >
                {isImg ? (
                  <img
                    src={previewUrl!}
                    alt="preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                    <Paperclip size={20} className="text-slate-400 mb-1" />
                    <span className="text-[8px] text-slate-500 line-clamp-2">
                      {file.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 bg-white flex gap-2">
        {/* Input file ẩn */}
        <input
          type="file"
          id="chat-file-input"
          multiple
          style={{ display: 'none' }}
          onChange={onFileSelect}
        />
        <button
          onClick={() => document.getElementById('chat-file-input')?.click()}
          className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
          title="Đính kèm tệp"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSend();
            }}
            placeholder="Nhập tin nhắn..."
            className="w-full bg-slate-100 rounded-xl pl-4 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              showEmojiPicker
                ? 'text-indigo-600 bg-indigo-50'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'
            }`}
          >
            <Smile size={18} />
          </button>

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <>
              <div
                className="fixed inset-0 z-60"
                onClick={() => setShowEmojiPicker(false)}
              />
              <div className="absolute bottom-12 right-0 w-64 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-70 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-3">
                  {emojis.map((group) => (
                    <div key={group.cat} className="mb-3 last:mb-0">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                        {group.cat}
                      </h4>
                      <div className="grid grid-cols-5 gap-1">
                        {group.items.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <button
          onClick={onSend}
          disabled={
            !newMessage.trim() && selectedFiles.length === 0 && !replyMessage
          }
          className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:bg-slate-200 disabled:shadow-none"
        >
          <Send size={20} />
        </button>

        {currentChat?.type === 'group' && (
          <button
            onClick={() => onAddMemberClick()}
            className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:bg-slate-200 disabled:shadow-none"
          >
            <Plus size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ScreenChat;
