import { Ellipsis, Trash2, Edit3, Settings, UserRoundPlus } from 'lucide-react';
import React, { useState } from 'react';

const RecentChat = ({
  recentChats,
  setCurrentChat,
  user,
  onRemoveChat,
  onUpdateGroupName,
}: any) => {
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const toggleMenu = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === chatId ? null : chatId);
  };

  return (
    <>
      {recentChats.length > 0 ? (
        recentChats.map((chat: any) => {
          // Xử lý tên hiển thị cho từng item
          let displayName = chat.name || 'Nhóm chat';
          let displayAvatar = chat.avatar;

          if (chat.type === 'single') {
            const partner = chat.members?.find(
              (m: any) => m.code !== user?._id,
            );
            displayName = partner ? partner.name : 'Người dùng';
            displayAvatar = partner ? partner.avatar : null;
          }

          return (
            <div
              key={chat.id}
              onClick={() => setCurrentChat(chat)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white cursor-pointer border border-transparent hover:border-slate-100 transition-all group relative"
            >
              <div className="shrink-0 relative">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                    alt=""
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${chat.type === 'group' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  >
                    {displayName.charAt(0)}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 truncate">
                  {displayName}
                </h4>
                <p className="text-xs text-slate-500 truncate">
                  {chat.message?.content ||
                    (chat.type === 'group'
                      ? 'Bấm để xem nội dung nhóm'
                      : 'Bấm để bắt đầu trò chuyện')}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-400">
                  {chat.updated_at
                    ? new Date(chat.updated_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>

                <div className="relative">
                  <button
                    onClick={(e) => toggleMenu(e, chat.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Ellipsis size={16} />
                  </button>

                  {/* Dropdown Menu UI */}
                  {menuOpenId === chat.id && (
                    <div
                      className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-100 animate-in fade-in zoom-in-95 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {chat.type === 'group' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateGroupName(chat);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <Edit3 size={16} />
                            <span>Đổi tên nhóm</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                            <UserRoundPlus size={16} />
                            <span>Thêm thành viên</span>
                          </button>
                        </>
                      )}
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <Settings size={16} />
                        <span>Cài đặt</span>
                      </button>
                      <div className="my-1 border-t border-slate-50"></div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveChat(chat.id);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                      >
                        <Trash2 size={16} />
                        <span>Xóa trò chuyện</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Chưa có cuộc hội thoại nào
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Hãy tìm kiếm bạn bè để bắt đầu nhé!
          </p>
        </div>
      )}
    </>
  );
};

export default RecentChat;
