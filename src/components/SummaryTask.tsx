import React from 'react';

const SummaryTask = ({
  globalTodoRatio,
  globalDoingRatio,
  globalDoneRatio,
  globalDateRangeText,
}: {
  globalTodoRatio: number;
  globalDoingRatio: number;
  globalDoneRatio: number;
  globalDateRangeText: string;
}) => {
  return (
    <div className="flex min-w-[1300px] border-t border-gray-100">
      <div className="w-[48px]" />
      <div className="flex-1" />
      <div className="w-[120px]" />

      {/* Status column (140px) */}
      <div className="w-[140px] px-3 py-4 border-l border-r border-b border-gray-200 bg-white flex justify-center items-center">
        <div className="w-full h-3.5 bg-[#e5e7eb] rounded-md overflow-hidden flex relative">
          <div
            className="h-full bg-[#d1d5db]"
            style={{ width: `${globalTodoRatio}%` }}
          />
          <div
            className="h-full bg-[#2563eb]"
            style={{ width: `${globalDoingRatio}%` }}
          />
          <div
            className="h-full bg-[#10b981]"
            style={{ width: `${globalDoneRatio}%` }}
          />
        </div>
      </div>

      {/* Due Date column (110px) */}
      <div className="w-[110px] px-3 py-4 border-r border-b border-gray-200 bg-white flex justify-center items-center">
        <span className="text-[12px] font-bold text-gray-700 whitespace-nowrap">
          {globalDateRangeText}
        </span>
      </div>

      <div className="w-[490px]" />
    </div>
  );
};

export default SummaryTask;
