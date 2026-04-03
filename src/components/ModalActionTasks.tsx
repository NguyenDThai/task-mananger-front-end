import { Archive, ArrowRight, Copy, Star, Trash2, X } from 'lucide-react';

const ModalActionTasks = ({
  selectedTaskIds,
  setSelectedTaskIds,
}: {
  selectedTaskIds: string[];
  setSelectedTaskIds?: (ids: string[]) => void;
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
      <div className="bg-[#2563eb] text-white rounded-xl px-6 py-3.5 flex items-center gap-0 border border-blue-400/20">
        <div className="pr-6 border-r border-white/10 font-bold text-[13px] tracking-tight">
          {selectedTaskIds.length} mục đã chọn
        </div>

        <div className="flex items-center px-2">
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-white/10 transition-all text-[12px] font-bold group">
            <Copy
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            Nhân đôi
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-white/10 transition-all text-[12px] font-bold group">
            <ArrowRight
              size={17}
              className="group-hover:translate-x-0.5 transition-transform"
            />
            Di chuyển
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-white/10 transition-all text-[12px] font-bold group">
            <Star
              size={16}
              className="group-hover:rotate-12 transition-transform"
            />
            Theo dõi
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-white/10 transition-all text-[12px] font-bold group">
            <Archive
              size={16}
              className="group-hover:-translate-y-0.5 transition-transform"
            />
            Lưu trữ
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg hover:bg-red-500/20 text-rose-100 hover:text-white transition-all text-[12px] font-bold group">
            <Trash2
              size={16}
              className="group-hover:shake-icon transition-transform"
            />
            Xóa
          </button>
        </div>

        <div className="pl-4 border-l border-white/10 ml-2">
          <button
            onClick={() => setSelectedTaskIds?.([])}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all text-white/70 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalActionTasks;
