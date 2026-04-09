import { useRef, useState } from 'react';
import { useUpdateTaskMutation } from '../../redux/api/taskApi';
import { createPortal } from 'react-dom';

export const StatusSelect = ({
  initialStatus,
  taskId,
  canEdit = true,
}: {
  initialStatus: string;
  taskId: string;
  canEdit?: boolean;
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [prevInitialStatus, setPrevInitialStatus] = useState(initialStatus);

  if (initialStatus !== prevInitialStatus) {
    setPrevInitialStatus(initialStatus);
    setStatus(initialStatus);
  }

  const [updateTask] = useUpdateTaskMutation();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const statusConfigs: Record<
    string,
    { label: string; bg: string; text: string; desc: string; dot?: string }
  > = {
    Doing: {
      label: 'Doing',
      bg: 'bg-status-doing',
      text: 'text-blue-700',
      dot: 'bg-blue-600',
      desc: 'Đang triển khai',
    },
    Stuck: {
      label: 'Stuck',
      bg: 'bg-status-stuck',
      text: 'text-red-700',
      dot: 'bg-red-600',
      desc: 'Đang bị tắc nghẽn',
    },
    Pending: {
      label: 'Pending',
      bg: 'bg-status-pedding',
      text: 'text-orange-700',
      dot: 'bg-orange-600',
      desc: 'Đang tạm dừng',
    },
    Done: {
      label: 'Done',
      bg: 'bg-status-done',
      text: 'text-emerald-700',
      dot: 'bg-emerald-600',
      desc: 'Đã hoàn thành',
    },
    None: {
      label: 'None',
      bg: 'bg-status-none',
      text: 'text-gray-600',
      desc: 'Chưa xét trạng thái',
    },
  };

  const current = statusConfigs[status] || statusConfigs['None'];

  const handleOpen = () => {
    if (!canEdit) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <button
          ref={triggerRef}
          onClick={handleOpen}
          className={`
            w-[85px] flex items-center justify-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold transition-all shadow-sm active:scale-95
            ${current.bg} ${current.text}
            ${canEdit ? '' : 'cursor-not-allowed'}
          `}
        >
          {current.dot && (
            <div
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${current.dot}`}
            />
          )}
          <span className="truncate">
            {current.label === 'Không xét trạng thái' ? 'None' : current.label}
          </span>
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-2000">
            <div
              className="absolute inset-0 bg-transparent"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-1 min-w-[180px] z-10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top: coords.top + 6,
                left: coords.left + coords.width / 2,
                transform: 'translateX(-50%)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45" />
              <div className="flex flex-col gap-0.5 relative z-20">
                {Object.entries(statusConfigs).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={async () => {
                      try {
                        await updateTask({
                          id: taskId,
                          data: { status: key },
                        }).unwrap();
                        setStatus(key);
                        setIsOpen(false);
                      } catch (err) {
                        console.error('Failed to update status:', err);
                      }
                    }}
                    className={`
                    w-full flex items-center gap-3 px-3 py-1.5 rounded text-[11px] font-bold transition-colors
                    hover:bg-gray-50 active:scale-98
                    ${cfg.bg} ${cfg.text}
                  `}
                  >
                    {cfg.dot ? (
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    ) : (
                      <div className="w-1.5 h-1.5" />
                    )}
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
