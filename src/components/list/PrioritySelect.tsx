import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { Flame, Flag, Palette, type LucideIcon } from 'lucide-react';
import { useUpdateTaskMutation } from '../../redux/api/taskApi';
import { updatePriorityColor } from '../../redux/slides/task/taskSlide';
import type { RootState } from '../../redux/store';

// 1. Helper function để tạo theme màu từ mã Hue (0-360)
const generateTheme = (hue: number) => ({
  bg: `hsl(${hue}, 80%, 96%)`,
  icon: `hsl(${hue}, 80%, 45%)`,
  text: `hsl(${hue}, 80%, 20%)`,
});

// 2. Helper để lấy Hue từ string hsl(...)
const getHueFromColor = (color: string) => {
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\((\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0; // Mặc định cho HEX
};

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
              className="absolute bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-2 min-w-[220px] z-10 animate-in fade-in zoom-in-95 duration-100"
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

                      {/* Hue slider color picker */}
                      {isPickingColor === key && (
                        <div className="flex flex-col gap-2 px-2 pb-2 animate-in slide-in-from-top-1 duration-200">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="360"
                              defaultValue={getHueFromColor(cfg.icon)}
                              className="w-full h-2 rounded-lg appearance-none cursor-pointer hue-slider"
                              style={{
                                background:
                                  'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                              }}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                const newTheme = generateTheme(val);
                                dispatch(
                                  updatePriorityColor({
                                    key,
                                    color: newTheme,
                                  }),
                                );
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200 shadow-sm shrink-0"
                              style={{ backgroundColor: cfg.icon }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 text-center font-medium">
                            Kéo để thay đổi màu sắc
                          </p>
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
