import { X, Save, Users, ShieldCheck } from 'lucide-react';

const EditGroupModal = ({
  isOpen,
  onClose,
  groupName,
  setGroupName,
  onSave,
  members,
}: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <X size={20} />
          </button>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white/30 shadow-inner">
            <Users size={40} className="text-white" />
          </div>
          <h3 className="text-xl font-bold">Thông tin nhóm</h3>
          <p className="text-indigo-100 text-xs mt-1">
            Chỉnh sửa tên và xem thành viên
          </p>
        </div>

        <div className="p-6 space-y-6 bg-slate-50/50">
          {/* Input tên nhóm */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Tên nhóm mới
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-5 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold shadow-sm"
              placeholder="Nhập tên nhóm..."
              autoFocus
            />
          </div>

          {/* Danh sách thành viên (Chỉ đọc) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Thành viên ({members?.length || 0})
              </label>
              <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                Đang tham gia
              </span>
            </div>

            <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {members?.map((m: any) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm shrink-0">
                    {m.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-secondary truncate">
                      {m.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      @{m.email}
                    </p>
                  </div>
                  <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-100">
          <button
            onClick={onSave}
            disabled={!groupName.trim()}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            <Save size={20} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGroupModal;
