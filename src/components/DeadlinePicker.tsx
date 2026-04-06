import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DeadlinePickerProps {
  onClose: () => void;
  onUpdate: (date: Date | null) => void;
  initialDate?: string | Date;
  triggerRect: DOMRect;
}

export const DeadlinePicker: React.FC<DeadlinePickerProps> = ({
  onClose,
  onUpdate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialDate,
  triggerRect,
}) => {
  const [selectedDate, setSelectedDate] = useState<number>(30);
  const [coords, setCoords] = useState(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 600;
    const modalHeight = 450;

    let top = triggerRect.bottom + 8;
    let left = triggerRect.left + triggerRect.width / 2 - modalWidth / 2;

    // Keep within bounds
    if (left + modalWidth > viewportWidth)
      left = viewportWidth - modalWidth - 10;
    if (left < 10) left = 10;
    if (top + modalHeight > viewportHeight)
      top = triggerRect.top - modalHeight - 8;

    return { top, left };
  });

  useEffect(() => {
    const updatePosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = 600;
      const modalHeight = 450;

      let top = triggerRect.bottom + 8;
      let left = triggerRect.left + triggerRect.width / 2 - modalWidth / 2;

      // Keep within bounds
      if (left + modalWidth > viewportWidth)
        // Dịch sang trái, cách mép phải 10px
        left = viewportWidth - modalWidth - 10;
      // Dịch sang phải, cách mép trái 10px
      if (left < 10) left = 10;
      if (top + modalHeight > viewportHeight)
        // Dịch lên trên, cách mép dưới 8px
        top = triggerRect.top - modalHeight - 8;

      setCoords({ top, left });
    };

    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [triggerRect]);

  const shortcuts = [
    { label: 'Hôm nay', value: 'Today', day: 'Sun' },
    { label: 'Ngày mai', value: 'Tomorrow', day: 'Mon' },
    { label: 'Cuối tuần này', value: 'This Weekend', day: 'Sun' },
    { label: 'Tuần sau', value: 'Next Week', day: 'Sun' },
    { label: 'Cuối tuần sau', value: 'Next Weekend', day: '19 Apr' },
    { label: '2 tuần', value: '2 Weeks', day: '19 Apr' },
    { label: '4 tuần', value: '4 Weeks', day: '03 May' },
  ];

  const daysOfWeek = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];

  const calendarDays = [
    null,
    null,
    null,
    null,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
  ];

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-start justify-start pointer-events-none">
      <div
        className="absolute inset-0 bg-transparent pointer-events-auto"
        onClick={onClose}
      />

      <div
        className="relative bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto flex flex-col w-[600px]"
        style={{
          top: `${coords.top}px`,
          left: `${coords.left}px`,
        }}
      >
        <div className="flex flex-1 min-h-[380px]">
          {/* Left Sidebar: Shortcuts */}
          <div className="w-[200px] border-r border-gray-100 p-2 py-4">
            <div className="space-y-1">
              {shortcuts.map((s) => (
                <button
                  key={s.label}
                  className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 rounded-lg group"
                >
                  <span className="font-medium">{s.label}</span>
                  <span className="text-[11px] text-gray-400 font-mono group-hover:text-gray-500">
                    {s.day}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content: Calendar & Time */}
          <div className="flex-1 flex flex-col">
            {/* Header Inputs */}
            <div className="p-4 flex gap-3 border-b border-gray-50">
              <div className="flex-1 relative group">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
                />
                <input
                  type="text"
                  placeholder="Thêm ngày bắt đầu"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-transparent rounded-lg text-[13px] outline-none focus:bg-white focus:border-blue-200 placeholder:text-gray-400"
                />
              </div>
              <div className="flex-[1.2] flex gap-1 bg-blue-50/30 border border-blue-100/50 rounded-lg p-1">
                <div className="flex items-center gap-2 px-2 py-1 flex-1">
                  <Calendar size={14} className="text-blue-500" />
                  <span className="text-[13px] font-bold text-gray-700">
                    30/03/26
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-md shadow-sm">
                  <input
                    type="text"
                    defaultValue="23:59"
                    className="w-10 text-[13px] font-bold text-gray-700 outline-none border-none p-0 text-center"
                  />
                  <Clock size={14} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Calendar Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-gray-800">
                    Tháng Tư
                  </span>
                  <ChevronDownIcon />
                  <span className="text-[14px] font-bold text-gray-800 ml-2">
                    2026
                  </span>
                  <ChevronDownIcon />
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 text-center mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-[11px] font-bold text-gray-400 py-2 uppercase tracking-wider"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map((day, idx) => (
                  <div
                    key={idx}
                    className="h-9 flex items-center justify-center relative group"
                  >
                    {day !== null ? (
                      <button
                        onClick={() => setSelectedDate(day)}
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-medium
                          ${day === selectedDate ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
                        `}
                      >
                        {day}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(selectedDate);
              onUpdate(d);
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-lg"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const ChevronDownIcon = () => (
  <svg
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-gray-400"
  >
    <path
      d="M1 1L5 5L9 1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
