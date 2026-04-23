import { Search, Users, X, Check, UserPlus } from 'lucide-react';

import type { UserChat } from '../../../types';

interface CreateGroupInlineProps {
  isActive: boolean;
  groupName: string;
  setGroupName: (name: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMembers: UserChat[];
  onToggleMember: (member: UserChat) => void;
  filteredMembers: UserChat[];
  onCreateGroup: () => void;
}

const CreateGroupInline = ({
  isActive,
  groupName,
  setGroupName,
  searchQuery,
  setSearchQuery,
  selectedMembers,
  onToggleMember,
  filteredMembers,
  onCreateGroup,
}: CreateGroupInlineProps) => {
  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-300 bg-white ${isActive ? 'translate-x-0' : 'translate-x-full opacity-0'}`}
    >
      <div className="p-4 space-y-4 bg-slate-50/50 border-b border-slate-100">
        <div className="relative">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nhập tên nhóm..."
            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
          />
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm thành viên..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {selectedMembers.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {selectedMembers.map((m) => (
              <div
                key={m.id}
                className="shrink-0 flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full pl-1 pr-2 py-1 animate-in zoom-in duration-200"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-bold">
                  {m.name.charAt(0)}
                </div>
                <span className="text-[10px] font-semibold text-indigo-700 truncate max-w-[60px]">
                  {m.name}
                </span>
                <button
                  onClick={() => onToggleMember(m)}
                  className="p-0.5 hover:bg-indigo-200 rounded-full text-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  <X size={8} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Gợi ý thành viên
        </p>
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <UserPlus size={32} className="opacity-20 mb-2" />
            <p className="text-xs">Không tìm thấy thành viên</p>
          </div>
        ) : (
          filteredMembers.map((m) => {
            const isSelected = selectedMembers.some((sm) => sm.id === m.id);
            return (
              <div
                key={m.id}
                onClick={() => onToggleMember(m)}
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-transparent hover:border-slate-100'}`}
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-white shadow-sm">
                    {m.name.charAt(0)}
                  </div>
                  {isSelected && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-indigo-600 text-white rounded-full p-0.5 border border-white">
                      <Check size={8} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {m.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">
                    {m.email}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <button
          onClick={onCreateGroup}
          disabled={!groupName.trim() || selectedMembers.length < 2}
          className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${groupName.trim() && selectedMembers.length >= 2 ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-100 hover:brightness-110' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          <Users size={18} />
          Tạo nhóm ngay ({selectedMembers.length})
        </button>
      </div>
    </div>
  );
};

export default CreateGroupInline;
