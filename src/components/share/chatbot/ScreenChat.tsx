const ScreenChat = ({
  scrollRef,
  messages,
  user,
  currentChat,
  newMessage,
  setNewMessage,
  handleSendMessage,
}: any) => {
  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-300 ${currentChat ? 'translate-x-0' : 'translate-x-full opacity-0'}`}
    >
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 scrollbar-hide scroll-smooth"
      >
        {messages.length > 0 ? (
          messages.map((item: any) => {
            // SDK trả về field thành viên trong item.member
            const sender = item.member || {};
            const isMine = (sender.code || item.sender_code) === user?._id;

            return (
              <div
                key={item.id}
                className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                {/* Avatar người gửi (nếu không phải mình) */}
                {!isMine && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm border border-white">
                    {sender.avatar ? (
                      <img
                        src={sender.avatar}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      sender.name?.charAt(0) || 'U'
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1 max-w-[75%]">
                  {/* Hiện tên người gửi nếu là chat nhóm và không phải mình */}
                  {currentChat?.type === 'group' && !isMine && (
                    <span className="text-[10px] text-slate-400 px-1">
                      {sender.name}
                    </span>
                  )}
                  <div
                    className={`p-3 text-sm shadow-sm ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                        : 'bg-white text-slate-700 rounded-2xl rounded-bl-sm border border-slate-100'
                    }`}
                  >
                    {item.content}
                  </div>
                  <span
                    className={`text-[9px] px-1 text-slate-400 ${isMine ? 'text-right' : 'text-left'}`}
                  >
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 opacity-60">
            <svg
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
            >
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-xs">
              Chưa có tin nhắn nào. Hãy bắt đầu chào nhau!
            </p>
          </div>
        )}
      </div>
      <div className="p-4 bg-white flex gap-2">
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
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:bg-slate-200 disabled:shadow-none"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ScreenChat;
