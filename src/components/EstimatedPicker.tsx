import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';

interface EstimatedPickerProps {
  value: string;
  onUpdate: (newValue: string) => void;
  variant?: 'table' | 'sidebar';
  canEdit: boolean;
}

export const EstimatedPicker: React.FC<EstimatedPickerProps> = ({
  value,
  onUpdate,
  variant = 'table',
  canEdit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const quickOptions = [
    { label: '15 phút', value: '15m' },
    { label: '30 phút', value: '30m' },
    { label: '1 giờ', value: '1h' },
    { label: '2 giờ', value: '2h' },
    { label: '4 giờ', value: '4h' },
    { label: '8 giờ', value: '8h' },
  ];

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Calculate position relative to viewport
      setCoords({
        top: rect.bottom + 8, // 8px spacing
        left: rect.left + rect.width / 2, // Centered below button
        width: rect.width,
      });
      setIsOpen(true);
    }
  };

  const handleQuickSelect = (val: string) => {
    onUpdate(val);
    setIsOpen(false);
  };

  const handleCustomConfirm = () => {
    if (customValue.trim()) {
      onUpdate(customValue);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onUpdate('');
    setCustomValue('');
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className={`
          w-full transition-colors outline-none hover:bg-gray-100/50 rounded px-1 py-0.5
          ${variant === 'table' ? 'text-[11px] font-mono text-gray-500 text-center' : 'text-sm font-bold text-gray-700 text-left'}
          ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
      >
        {value || (variant === 'table' ? '-' : 'Chọn...')}
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-9999">
            {/* Transparent backdrop to catch clicks */}
            <div
              className="absolute inset-0 bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            <div
              className="absolute w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-in fade-in zoom-in-95 duration-150 origin-top z-[101]"
              style={{
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                transform: 'translateX(-50%)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Arrow */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45" />

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Chọn nhanh:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {quickOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleQuickSelect(opt.value)}
                        className={`
                          px-2 py-2 text-[11px] rounded-lg border transition-all font-medium
                          ${
                            value === opt.value
                              ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm shadow-blue-50'
                              : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50/30'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Thời gian tùy chỉnh:
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder="giờ:phút -> 1:30 hoặc phút -> 90"
                      className="w-full text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-100/50 focus:border-blue-400 transition-all placeholder:text-gray-300"
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleCustomConfirm()
                      }
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleClear}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 px-2 py-1 rounded transition-colors"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={handleCustomConfirm}
                    className={`
                      p-1.5 rounded-lg transition-all
                      ${
                        customValue
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95'
                          : 'bg-gray-200 text-white cursor-not-allowed'
                      }
                    `}
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
