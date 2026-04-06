import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check } from 'lucide-react';
import { useGetUsersQuery, useGetMeQuery } from '../redux/api/authApi';
import { useUpdateTaskMutation } from '../redux/api/taskApi';
import { setUsers } from '../redux/features/user/userSlide';
import type { User } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

interface AddingAssigneeProps {
  onClose: () => void;
  taskId: string;
  currentCreatorId?: string;
  triggerRect: DOMRect;
}

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-purple-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface UserItemProps {
  user: User;
  isMe?: boolean;
  onSelect: (userId: string) => void;
  currentCreatorId?: string;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  isMe = false,
  onSelect,
  currentCreatorId,
}) => {
  const userId = user._id || user.id || '';
  const isSelected = currentCreatorId === userId;
  const userName = user.name || 'Unknown';

  const userEmail = user.email || '';

  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      onClick={() => onSelect(userId)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all text-left group"
    >
      <div className="relative shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            className="w-9 h-9 rounded-full border border-gray-100 shadow-sm"
            alt=""
          />
        ) : (
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${getAvatarColor(userName)}`}
          >
            {initials}
          </div>
        )}
        {isSelected && (
          <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
            <Check size={10} className="text-blue-600 stroke-4" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-gray-700 truncate">
          {userName}{' '}
          {isMe && <span className="text-gray-400 font-medium">(Tôi)</span>}
        </p>
        <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
      </div>
    </button>
  );
};

const AddingAssignee: React.FC<AddingAssigneeProps> = ({
  onClose,
  taskId,
  currentCreatorId,
  triggerRect,
}) => {
  const [search, setSearch] = useState('');
  const { data, isLoading: loadingUsers } = useGetUsersQuery();

  const dispatch = useDispatch();

  // Đồng bộ tất cả user qua redux
  useEffect(() => {
    if (data?.users) {
      dispatch(setUsers(data.users));
    }
  }, [data, dispatch]);
  const usersFromRedux = useSelector((state: RootState) => state.user.users);

  const usersData = data?.users || usersFromRedux;

  const { data: meData } = useGetMeQuery();
  const me: User | undefined = meData?.user;
  const [updateTask] = useUpdateTaskMutation();

  const filteredUsers = useMemo(() => {
    const users = usersData || [];
    return users.filter(
      (user: User) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [usersData, search]);

  const handleSelect = async (userId: string) => {
    try {
      await updateTask({
        id: taskId,
        data: { createdBy: userId },
      }).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to update creator:', err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-1000">
      <div
        className="absolute inset-0 bg-black/5 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 w-[300px] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{
          top: Math.min(triggerRect.bottom + 8, window.innerHeight - 450),
          left: Math.min(triggerRect.left, window.innerWidth - 320),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tên người dùng / email"
              className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-9 pr-3 py-2 text-[12px] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[350px] overflow-y-auto p-1 custom-scrollbar">
          {loadingUsers ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-1">
              {/* Me Section */}
              {me && search === '' && (
                <div className="px-2 mb-2">
                  <UserItem
                    user={me}
                    isMe={true}
                    onSelect={handleSelect}
                    currentCreatorId={currentCreatorId}
                  />
                </div>
              )}

              {/* Suggestions Header */}
              <div className="px-3 py-1.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Thành viên được gợi ý
                </p>
              </div>

              {/* User List */}
              <div className="px-1">
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .filter(
                      (u: User) => (u._id || u.id) !== (me?._id || me?.id),
                    )
                    .map((user: User) => (
                      <UserItem
                        key={user._id || user.id}
                        user={user}
                        onSelect={handleSelect}
                        currentCreatorId={currentCreatorId}
                      />
                    ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    Không tìm thấy người dùng phù hợp
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddingAssignee;
