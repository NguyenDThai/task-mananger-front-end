import { useRef, useState } from 'react';
import { useUpdateTaskMutation } from '../../redux/api/taskApi';
import { createPortal } from 'react-dom';
import { Flame, Flag, type LucideIcon } from 'lucide-react';

export const PrioritySelect = ({
  initialPriority,
  taskId,
  canEdit = true,
}: {
  initialPriority: string;
  taskId: string;
  canEdit?: boolean;
}) => {
  const [priority, setPriority] = useState(initialPriority);
  const [prevInitialPriority, setPrevInitialPriority] =
    useState(initialPriority);

  if (initialPriority !== prevInitialPriority) {
    setPrevInitialPriority(initialPriority);
    setPriority(initialPriority);
  }

  const [updateTask] = useUpdateTaskMutation();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const priorityConfigs: Record<
    string,
    { label: string; color: string; icon: LucideIcon; iconColor: string }
  > = {
    Urgent: {
      label: 'Urgent',
      color: 'text-gray-700',
      iconColor: 'text-red-600',
      icon: Flame,
    },
    High: {
      label: 'High',
      color: 'text-gray-700',
      iconColor: 'text-rose-500',
      icon: Flag,
    },
    Medium: {
      label: 'Medium',
      color: 'text-gray-700',
      iconColor: 'text-amber-500',
      icon: Flag,
    },
    Low: {
      label: 'Low',
      color: 'text-gray-700',
      iconColor: 'text-blue-400',
      icon: Flag,
    },
  };

  const current = priorityConfigs[priority] || priorityConfigs['Medium'];
  const CurrentIcon = current.icon;

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
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all active:scale-95 group ${canEdit ? 'hover:bg-gray-50' : 'cursor-not-allowed'}`}
        >
          <CurrentIcon
            size={14}
            className={`fill-current ${current.iconColor} opacity-80 group-hover:opacity-100 transition-opacity`}
          />
          <span className="text-[11px] font-bold text-gray-500 capitalize">
            {current.label}
          </span>
        </button>
      </div>

      {/* Portal Dropdown Menu */}
      {isOpen &&
        // createPortal tạo model nằm trên không quan tâm cha nó có overflow hidden với z-index bao nhiêu
        createPortal(
          <div className="fixed inset-0">
            {/* Transparent Overlay */}
            <div
              className="absolute inset-0 bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            <div
              className="absolute bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-2 min-w-[140px] z-10 animate-in fade-in zoom-in-95 duration-100"
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
                  const cfg = priorityConfigs[key];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
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
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all
                      hover:bg-gray-50 active:scale-[0.98]
                      ${priority === key ? 'bg-blue-50/50 text-blue-600' : 'text-slate-600'}
                    `}
                    >
                      <Icon
                        size={16}
                        className={`fill-current ${cfg.iconColor}`}
                      />
                      <span>{cfg.label}</span>
                    </button>
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
