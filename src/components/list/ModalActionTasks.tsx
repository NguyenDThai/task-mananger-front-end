import { Archive, ArrowRight, Copy, Star, Trash2, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useBulkDeleteTasksMutation } from '../../redux/api/taskApi';
import { bulkDeleteLocal } from '../../redux/slides/task/taskSlide';

const ModalActionTasks = ({
  selectedTaskIds,
  setSelectedTaskIds,
  isOwner = true,
}: {
  selectedTaskIds: string[];
  setSelectedTaskIds?: (ids: string[]) => void;
  isOwner?: boolean;
}) => {
  const dispatch = useDispatch();
  const [bulkDelete] = useBulkDeleteTasksMutation();

  const handleDelete = async () => {
    if (
      !selectedTaskIds.length ||
      !window.confirm(
        `Bạn có chắc muốn xóa ${selectedTaskIds.length} mục đã chọn?`,
      )
    ) {
      return;
    }

    // 1. Cập nhật local ngay lập tức
    dispatch(bulkDeleteLocal(selectedTaskIds));
    const idsToClear = [...selectedTaskIds];
    setSelectedTaskIds?.([]);

    try {
      // 2. Gọi API để xóa cứng
      await bulkDelete({ ids: idsToClear }).unwrap();
    } catch (err) {
      console.error('Failed to delete tasks:', err);
    }
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="bg-[#2563eb] text-white rounded-xl px-6 py-3 flex items-center shadow-2xl border border-white/10 backdrop-blur-sm">
        <div className="pr-6 border-r border-white/20 font-bold text-[13px] tracking-tight">
          {selectedTaskIds.length} mục đã chọn
        </div>

        <div className="flex items-center px-2">
          {/* Always show Duplicate and Follow */}
          <button className="flex items-center gap-2.5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all text-[12px] font-bold group">
            <Copy
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            Nhân đôi
          </button>

          <div className="w-px h-4 bg-white/20 mx-1" />

          {/* Conditional actions for Owner only */}
          {isOwner && (
            <>
              <button className="flex items-center gap-2.5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all text-[12px] font-bold group">
                <ArrowRight
                  size={17}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
                Di chuyển
              </button>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <button className="flex items-center gap-2.5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all text-[12px] font-bold group">
                <Archive
                  size={16}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />
                Lưu trữ
              </button>
              <div className="w-px h-4 bg-white/20 mx-1" />
            </>
          )}

          <button className="flex items-center gap-2.5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all text-[12px] font-bold group">
            <Star
              size={16}
              className="group-hover:rotate-12 transition-transform"
            />
            Theo dõi
          </button>

          {isOwner && (
            <>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <button
                onClick={handleDelete}
                className="flex items-center gap-2.5 px-4 py-2 rounded-lg hover:bg-red-500/20 text-rose-100 hover:text-white transition-all text-[12px] font-bold group"
              >
                <Trash2
                  size={16}
                  className="group-hover:opacity-100 transition-all"
                />
                Xóa
              </button>
            </>
          )}
        </div>

        <div className="pl-4 border-l border-white/20 ml-2">
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
