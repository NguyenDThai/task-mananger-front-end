import { useState } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Cửa sổ Chat */}
      <div
        className={`absolute bottom-0 right-0 w-[380px] h-[600px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ease-out 
        ${isOpen ? 'scale-100 translate-y-0 opacity-100 pointer-events-auto' : 'scale-90 translate-y-5 opacity-0 pointer-events-none'}`}
      >
        {/* Phần Header Cửa sổ */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3.5">
            <span className="bg-white/25 p-2.5 rounded-xl flex backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            <div>
              <h3 className="m-0 text-base font-semibold tracking-wide">
                Hỗ Trợ Live Chat
              </h3>
              <p className="m-0 mt-1 text-[13px] opacity-85 flex items-center gap-1.5 before:content-[''] before:w-2 before:h-2 before:bg-green-400 before:rounded-full before:shadow-[0_0_0_2px_rgba(74,222,128,0.3)]">
                Đang hoạt động
              </p>
            </div>
          </div>
          <button
            className="bg-transparent border-none text-white cursor-pointer p-1.5 opacity-80 hover:opacity-100 transition-all hover:rotate-90 hover:scale-110"
            onClick={toggleChat}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Khu vực hiển thị tin nhắn */}
        <div className="flex-1 px-5 py-6 overflow-y-auto flex flex-col gap-4 bg-slate-50">
          <div className="flex flex-col max-w-[82%] self-start animate-[slideIn_0.4s_ease-out_forwards] translate-y-3 opacity-0 [animation-fill-mode:forwards]">
            <div className="px-4 py-3 text-[14.5px] leading-relaxed bg-white text-slate-700 rounded-[18px_18px_18px_4px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200">
              Xin chào! 👋 Tôi là trợ lý ảo của Satek. Quý khách cần bộ phận
              chúng tôi hỗ trợ gì không?
            </div>
            <span className="text-xs text-slate-400 mt-1.5 px-1.5">14:02</span>
          </div>

          <div
            className="flex flex-col max-w-[82%] self-end items-end animate-[slideIn_0.4s_ease-out_forwards] translate-y-3 opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="px-4 py-3 text-[14.5px] leading-relaxed bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[18px_18px_4px_18px] shadow-[0_4px_12px_rgba(79,70,229,0.25)]">
              Chuyển thiết kế sang Tailwind CSS nhìn gọn hơn không?
            </div>
            <span className="text-xs text-slate-400 mt-1.5 px-1.5">14:05</span>
          </div>

          <div
            className="flex flex-col max-w-[82%] self-start animate-[slideIn_0.4s_ease-out_forwards] translate-y-3 opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="px-4 py-3 text-[14.5px] leading-relaxed bg-white text-slate-700 rounded-[18px_18px_18px_4px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200">
              Chắc chắn rồi! Toàn bộ file CSS ngoài đã bị gỡ bỏ. Bây giờ tất cả
              đều được code bằng Tailwind utilities siêu sạch và gọn nhẹ! ✨
            </div>
            <span className="text-xs text-slate-400 mt-1.5 px-1.5">14:05</span>
          </div>

          {/* Typing Indicator mô phỏng bot đang gõ */}
          <div
            className="flex flex-col max-w-[82%] self-start animate-[slideIn_0.4s_ease-out_forwards] translate-y-3 opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="px-5 py-3.5 bg-white rounded-[18px_18px_18px_4px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-200 flex items-center h-10">
              <div className="flex gap-1.5 items-center">
                <span
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: '-0.3s' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: '-0.15s' }}
                ></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Khu vực nhập câu hỏi */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center">
          <input
            type="text"
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-5 py-3 md:py-3.5 rounded-full border border-slate-200 outline-none text-[14.5px] bg-slate-50 transition-all duration-200 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
          <button className="bg-indigo-600 text-white border-none w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_3px_10px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:scale-105 hover:shadow-[0_5px_15px_rgba(79,70,229,0.4)] flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="-translate-x-[1px] scale-90"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

        {/* Custom CSS block nhẹ để định nghĩa khung hình slideIn animation mà tailwind không có sẵn */}
        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* Nút Bong Bóng Nổi (Widget Toggle) */}
      <button
        className={`w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-[0_4px_15px_rgba(79,70,229,0.4)] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(79,70,229,0.5)] cursor-pointer border-none outline-none 
        ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'}`}
        onClick={toggleChat}
      >
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M21 15C21 16.1046 20.1046 17 19 17H7L3 21V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15Z"></path>
        </svg>
      </button>
    </div>
  );
};

export default ChatBot;
