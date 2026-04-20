import {
  Heart,
  MessageSquareMore,
  Paperclip,
  Plus,
  Reply,
  RotateCcw,
  Send,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { currentMessages } from '../../../redux/slides/chat/chatSlide';
import type { Chat, Message, User } from '../../../redux/slides/chat/chatSlide';

interface ScreenChatProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  user: { _id?: string; [key: string]: unknown } | null;
  currentChat: Chat | null;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  handleSendMessage: (content?: string, files?: FileList | null) => void;
  onMessageAction: (
    messageId: number,
    action: 'like' | 'love' | 'revoke' | 'remove',
  ) => void;
  onAddMemberClick: (chat?: Chat) => void;
  replyMessage: Message | null;
  setReplyMessage: (msg: Message | null) => void;
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
}: ScreenChatProps) => {
  const messages = useSelector(currentMessages);

  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-300 ${currentChat ? 'translate-x-0' : 'translate-x-full opacity-0'}`}
    >
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 scrollbar-hide scroll-smooth"
      >
        {messages.length > 0 ? (
          messages.map((item: Message) => {
            // SDK trả về field thành viên trong item.member
            const sender = (item.member as User) || ({} as User);
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
                  <div className="relative flex-shrink-0 group/avatar">
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
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
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
                                    {(originalMsg.member as any)?.name ||
                                      'Người dùng'}
                                  </span>
                                  <span className="opacity-80">
                                    {originalMsg.content ||
                                      (originalMsg.files &&
                                      (originalMsg.files as any).length
                                        ? 'Một tệp tin'
                                        : '...')}
                                  </span>
                                </>
                              );
                            })()}
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

      <div className="p-4 bg-white flex gap-2">
        {/* Input file ẩn */}
        <input
          type="file"
          id="chat-file-input"
          multiple
          style={{ display: 'none' }}
          onChange={async (e) => {
            if (e.target.files && e.target.files.length > 0) {
              await handleSendMessage(newMessage, e.target.files);
              e.target.value = ''; // Reset input
            }
          }}
        />
        <button
          onClick={() => document.getElementById('chat-file-input')?.click()}
          className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
          title="Đính kèm tệp"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!newMessage.trim() && !replyMessage}
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
