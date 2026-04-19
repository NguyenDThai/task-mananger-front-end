import { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectChatMembers } from '../../../redux/slides/chat/chatSlide';

const AddMemberModal = ({ isOpen, onClose, systemMembers, onAdd }: any) => {
  const [searchTerm, setSearchTerm] = useState(''); // State tìm kiếm nội bộ
  const currentMembers = useSelector(selectChatMembers);

  if (!isOpen) return null;

  // 1. Lọc theo từ khóa người dùng nhập
  const filteredResults =
    searchTerm.trim() === ''
      ? [] // Nếu chưa nhập gì thì để mảng rỗng
      : systemMembers.filter(
          (m: any) =>
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  // 2. (Tùy chọn) Vẫn loại bỏ những người đã có trong nhóm nếu có dữ liệu
  const joinedMemberIds = currentMembers?.map((m: any) => m.id) || [];

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800">Thêm thành viên</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Tìm kiếm */}
        <div className="p-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên để tìm kiếm..."
              className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Kết quả tìm kiếm */}
        <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[400px] p-2 space-y-1">
          {filteredResults.length > 0 ? (
            filteredResults.map((m: any) => {
              const isJoined = joinedMemberIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-2.5 hover:bg-indigo-50/50 rounded-2xl transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      m.name?.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-700 truncate">
                      {m.name}
                    </h4>

                    {isJoined ? (
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">
                        ● Đã tham gia nhóm
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 truncate">
                        {m.email}
                      </p>
                    )}
                  </div>
                  {!isJoined && (
                    <button
                      onClick={() => {
                        onAdd(m);
                        setSearchTerm('');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition-all opacity-0 group-hover:opacity-100"
                    >
                      Mời
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 opacity-60">
              <p className="text-[11px] text-center px-6">
                {searchTerm
                  ? 'Không tìm thấy thành viên phù hợp'
                  : 'Hãy nhập tên để tìm thành viên muốn thêm vào nhóm'}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 text-[10px] text-center text-slate-400">
          Chỉ có thể mời các thành viên từ hệ thống.
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
