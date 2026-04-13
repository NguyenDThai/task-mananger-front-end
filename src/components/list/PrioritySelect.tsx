import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { Flame, Flag, Palette, type LucideIcon } from 'lucide-react';
import { useUpdateTaskMutation } from '../../redux/api/taskApi';
import { updatePriorityColor } from '../../redux/slides/task/taskSlide';
import type { RootState } from '../../redux/store';

// 1. Định nghĩa các màu mẫu sang trọng (Pastel & Vibrant)
const PRESET_COLORS = [
  { bg: '#fee2e2', text: '#991b1b', icon: '#dc2626' }, // Red
  { bg: '#ffedd5', text: '#9a3412', icon: '#f97316' }, // Orange
  { bg: '#fef3c7', text: '#92400e', icon: '#f59e0b' }, // Amber
  { bg: '#dcfce7', text: '#166534', icon: '#16a34a' }, // Green
  { bg: '#dbeafe', text: '#1e40af', icon: '#2563eb' }, // Blue
  { bg: '#f3e8ff', text: '#6b21a8', icon: '#9333ea' }, // Purple
];

export const PrioritySelect = ({
  initialPriority,
  taskId,
  canEdit = true,
}: {
  initialPriority: string;
  taskId: string;
  canEdit?: boolean;
}) => {
  const dispatch = useDispatch();
  const customColors = useSelector(
    (state: RootState) => state.task.priorityColors,
  );

  const [priority, setPriority] = useState(initialPriority);
  const [prevInitialPriority, setPrevInitialPriority] =
    useState(initialPriority);

  if (initialPriority !== prevInitialPriority) {
    setPrevInitialPriority(initialPriority);
    setPriority(initialPriority);
  }

  const [updateTask] = useUpdateTaskMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isPickingColor, setIsPickingColor] = useState<string | null>(null); // Lưu priority đang được đổi màu

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const priorityIcons: Record<string, LucideIcon> = {
    Urgent: Flame,
    High: Flag,
    Medium: Flag,
    Low: Flag,
  };

  const currentSelection = customColors[priority] || customColors['Medium'];
  const CurrentIcon = priorityIcons[priority] || Flag;

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
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          onClick={handleOpen}
          style={{
            backgroundColor: currentSelection.bg,
            color: currentSelection.text,
          }}
          className={`
            w-[85px] flex items-center justify-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold transition-all shadow-sm active:scale-95 group
            ${canEdit ? '' : 'cursor-not-allowed'}
          `}
        >
          <CurrentIcon
            size={12}
            style={{ color: currentSelection.icon }}
            className="fill-current opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <span className="truncate uppercase">{priority}</span>
        </button>
      </div>

      {/* Portal Dropdown Menu */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50">
            {/* Transparent Overlay */}
            <div
              className="absolute inset-0 bg-transparent"
              onClick={() => {
                setIsOpen(false);
                setIsPickingColor(null);
              }}
            />

            <div
              className="absolute bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-2 min-w-[200px] z-10 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top: coords.top + 8,
                left: coords.left + coords.width / 2,
                transform: 'translateX(-50%)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tooltip Arrow */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-t border-l border-gray-100 rotate-45" />

              <div className="flex flex-col gap-1 relative z-20">
                {['Urgent', 'High', 'Medium', 'Low'].map((key) => {
                  const cfg = customColors[key];
                  const Icon = priorityIcons[key];
                  const isActive = priority === key;

                  return (
                    <div
                      key={key}
                      className="group flex flex-col gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={async () => {
                            try {
                              await updateTask({
                                id: taskId,
                                data: { priority: key },
                              }).unwrap();
                              setPriority(key);
                              setIsOpen(false);
                            } catch (err) {
                              console.error('Failed to update priority:', err);
                            }
                          }}
                          className={`
                          flex items-center gap-3 flex-1 px-2 py-1.5 rounded-lg text-[13px] font-semibold transition-all
                          hover:bg-white active:scale-[0.98]
                          ${isActive ? 'text-blue-600 bg-white/50 shadow-sm' : 'text-slate-600'}
                          `}
                        >
                          <Icon
                            size={16}
                            style={{ color: cfg.icon }}
                            className="fill-current"
                          />
                          <span>{key}</span>
                        </button>

                        {/* Palette Toggle */}
                        <button
                          onClick={() =>
                            setIsPickingColor(
                              isPickingColor === key ? null : key,
                            )
                          }
                          className={`p-1.5 rounded-full transition-all ${isPickingColor === key ? 'text-blue-500 bg-blue-50' : 'text-slate-300 hover:text-blue-500 hover:bg-white'}`}
                        >
                          <Palette size={14} />
                        </button>
                      </div>

                      {/* Color Palette Selection */}
                      {isPickingColor === key && (
                        <div className="flex gap-2 px-2 pb-2 animate-in slide-in-from-top-1 duration-200">
                          {PRESET_COLORS.map((color, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                dispatch(updatePriorityColor({ key, color }));
                              }}
                              style={{ backgroundColor: color.icon }}
                              className={`w-5 h-5 rounded-full border-2 ${cfg.icon === color.icon ? 'border-slate-800 scale-125' : 'border-transparent'} hover:scale-110 transition-transform shadow-sm`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
