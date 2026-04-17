import { X, Search, Users, Check, UserPlus } from 'lucide-react';

interface Member {
  id: string | number;
  name: string;
  avatar?: string;
  code: string;
  email?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemMembers: Member[];
  onToggleMember: (member: Member) => void;
  selectedMembers: Member[];
  groupName: string;
  setGroupName: (name: string) => void;
  onCreateGroup: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CreateGroupModal = ({
  isOpen,
  onClose,
  systemMembers,
  onToggleMember,
  selectedMembers,
  groupName,
  setGroupName,
  onCreateGroup,
  searchQuery,
  setSearchQuery,
}: CreateGroupModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-6 text-white shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Tạo nhóm mới</h3>
                <p className="text-indigo-100 text-xs mt-0.5">
                  Kết nối với đồng nghiệp của bạn
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Group Name Input */}
          <div className="relative group">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Tên nhóm của bạn..."
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 px-5 text-white placeholder:text-indigo-200 outline-none focus:bg-white/20 focus:border-white/40 transition-all font-medium"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
          {/* Member Search */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thành viên..."
                className="w-full bg-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all border border-transparent focus:border-indigo-100"
              />
            </div>
          </div>

          {/* Selected Members Chips */}
          {selectedMembers.length > 0 && (
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
              {selectedMembers.map((m) => (
                <div
                  key={m.id}
                  className="shrink-0 flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full pl-1 pr-2 py-1 animate-in zoom-in duration-200"
                >
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      className="w-6 h-6 rounded-full"
                      alt=""
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-indigo-700 truncate max-w-[80px]">
                    {m.name}
                  </span>
                  <button
                    onClick={() => onToggleMember(m)}
                    className="p-0.5 hover:bg-indigo-200 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Member List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-3 py-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Đề xuất thành viên
              </span>
            </div>

            {systemMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <UserPlus size={40} className="mb-2 opacity-20" />
                <p className="text-sm">Nhập tên để tìm thành viên</p>
              </div>
            ) : (
              systemMembers.map((m) => {
                const isSelected = selectedMembers.some((sm) => sm.id === m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => onToggleMember(m)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                        : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="relative">
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                          alt=""
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1 border-2 border-white">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        {m.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {m.email || 'Thành viên hệ thống'}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-slate-200'
                      }`}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <button
            onClick={onCreateGroup}
            disabled={!groupName.trim() || selectedMembers.length < 2}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
              groupName.trim() && selectedMembers.length >= 2
                ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 hover:shadow-indigo-300 hover:brightness-110'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Users size={22} />
            Tạo nhóm ngay{' '}
            {selectedMembers.length > 0 && `(${selectedMembers.length})`}
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-3">
            Cần ít nhất 2 thành viên để tạo nhóm chat
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
