import { useEffect, useRef, useState, memo } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { ISChatUser } from '../../types/chat.type';

interface NewChatWindowProps {
  members?: ISChatUser[];
  isLoading?: boolean;
  onSelectReceiver: (receivers: ISChatUser[], groupName?: string) => void;
  onBack: () => void;
}

export const NewChatWindow = memo(
  ({
    members = [],
    isLoading = false,
    onSelectReceiver,
    onBack,
  }: NewChatWindowProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedReceivers, setSelectedReceivers] = useState<ISChatUser[]>(
      [],
    );
    const [groupName, setGroupName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter members based on search query
    const filteredMembers = searchQuery.trim()
      ? members.filter((member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : members;

    // Handle input focus to show dropdown
    const handleInputFocus = () => {
      setShowDropdown(true);
    };

    // Handle member selection
    const handleSelectMember = (member: ISChatUser) => {
      // Check if member is already selected
      const isAlreadySelected = selectedReceivers.some(
        (receiver) => receiver.code === member.code,
      );

      if (isAlreadySelected) {
        // Remove from selected
        setSelectedReceivers(
          selectedReceivers.filter((receiver) => receiver.code !== member.code),
        );
      } else {
        // Add to selected
        setSelectedReceivers([...selectedReceivers, member]);
      }

      // Keep dropdown open and clear search for easier multi-selection
      setSearchQuery('');
      inputRef.current?.focus();
    };

    // Handle click outside dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setShowDropdown(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setShowDropdown(true);
    };

    // Handle clear input
    const handleClearInput = () => {
      setSearchQuery('');
      setShowDropdown(false);
      inputRef.current?.focus();
    };

    // Remove a selected receiver
    const handleRemoveReceiver = (code: string) => {
      setSelectedReceivers(
        selectedReceivers.filter((receiver) => receiver.code !== code),
      );
    };

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="h-14 flex items-center gap-3 px-4 py-3 border-b border-gray-100 sticky top-0">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Quay lại"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="font-medium text-gray-900 text-sm">
              Tạo cuộc trò chuyện mới
            </h2>
            <p className="text-xs text-gray-400">Chọn người nhận</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Receiver Input */}
          <div className="px-4 py-4 border-b border-gray-100 flex flex-row items-center gap-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Đến:
            </label>
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="Nhập tên người nhận..."
                className="w-full px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={handleClearInput}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-lg">×</span>
                </button>
              )}

              {/* Dropdown Suggestions */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:!w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-gray-400">Đang tải...</p>
                      </div>
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-600">
                        {searchQuery.trim()
                          ? 'Không tìm thấy người nhận'
                          : 'Không có danh sách thành viên'}
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {filteredMembers.map((member) => {
                        const isSelected = selectedReceivers.some(
                          (receiver) => receiver.code === member.code,
                        );
                        return (
                          <button
                            key={member.code}
                            onClick={() => handleSelectMember(member)}
                            className={`w-full px-4 py-2 flex items-center gap-3 transition-colors text-left ${
                              isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <div
                                className={`w-4 h-4 rounded border ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-gray-300'
                                } flex items-center justify-center`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-gray-600 font-medium text-xs">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {member.name}
                              </p>
                              {member.email && (
                                <p className="text-xs text-gray-500 truncate">
                                  {member.email}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Receivers Info */}
          {selectedReceivers.length > 0 && (
            <div className="px-4 py-4 bg-blue-50 border-b border-blue-100">
              <p className="text-xs font-medium text-blue-900 mb-3">
                {selectedReceivers.length === 1
                  ? 'Người nhận đã chọn:'
                  : `Những người đã chọn (${selectedReceivers.length}):`}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedReceivers.map((receiver) => (
                  <div
                    key={receiver.code}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-blue-100 hover:border-blue-300 transition-colors"
                  >
                    {receiver.avatar ? (
                      <img
                        src={receiver.avatar}
                        alt={receiver.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-medium text-xs">
                          {receiver.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {receiver.name}
                    </span>
                    <button
                      onClick={() => handleRemoveReceiver(receiver.code)}
                      className="ml-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <span className="text-lg">×</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Group Name Input - Show only when multiple receivers */}
              {selectedReceivers.length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-blue-900 mb-2">
                    Tên nhóm:
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nhập tên nhóm (tùy chọn)..."
                    className="w-full px-3 py-2 bg-white rounded border border-blue-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300 transition-all"
                  />
                </div>
              )}
            </div>
          )}

          {/* Placeholder */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0H9m6 0H9m6 0H9m6 0H9m6 0H9m6 0H9m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-sm font-medium">
                {selectedReceivers.length === 0
                  ? 'Chọn một hoặc nhiều người'
                  : selectedReceivers.length === 1
                    ? 'Sẵn sàng để tạo cuộc trò chuyện'
                    : `Sẵn sàng để tạo nhóm (${selectedReceivers.length} người)`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedReceivers.length === 0
                  ? 'Nhập tên trong trường ở trên'
                  : 'Bạn có thể bắt đầu trò chuyện ngay'}
              </p>
            </div>
            {selectedReceivers.length > 0 && (
              <button
                onClick={() =>
                  onSelectReceiver(
                    selectedReceivers,
                    selectedReceivers.length > 1 ? groupName : undefined,
                  )
                }
                className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                {selectedReceivers.length === 1
                  ? 'Tạo cuộc trò chuyện'
                  : 'Tạo nhóm'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

NewChatWindow.displayName = 'NewChatWindow';
