import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check } from 'lucide-react';
import { useGetUsersQuery, useGetMeQuery } from '../redux/api/authApi';
import { useUpdateTaskMutation } from '../redux/api/taskApi';
import { setUsers } from '../redux/features/user/userSlide';
import type { ProjectTask, User } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

interface AddingAssigneeProps {
  task: ProjectTask;
  onClose: () => void;
  taskId: string;
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
  isSelected: boolean;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  isMe = false,
  onSelect,
  isSelected,
}) => {
  const userId = user._id || user.id || '';
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
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
    >
      <div className="relative shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            className={`w-9 h-9 rounded-full border shadow-sm transition-all ${isSelected ? 'border-blue-200' : 'border-gray-100'}`}
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
          <div className="absolute -right-1 -bottom-1 bg-blue-600 rounded-full p-0.5 shadow-sm border border-white">
            <Check size={10} className="text-white stroke-4" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] font-bold truncate ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}
        >
          {userName}{' '}
          {isMe && <span className="text-gray-400 font-medium">(Tôi)</span>}
        </p>
        <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
      </div>
    </button>
  );
};

const AddingAssignee: React.FC<AddingAssigneeProps> = ({
  task,
  onClose,
  taskId,
  triggerRect,
}) => {
  const [search, setSearch] = useState('');
  const { data, isLoading: loadingUsers } = useGetUsersQuery();
  const dispatch = useDispatch();

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

  const assigneeIds = useMemo(() => {
    return (task.assignees || []).map((a) =>
      typeof a === 'string' ? a : a._id || '',
    );
  }, [task.assignees]);

  const filteredUsers = useMemo(() => {
    const users = usersData || [];
    return users.filter(
      (user: User) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [usersData, search]);

  const handleSelect = async (userId: string) => {
    const isAlreadyAssigned = assigneeIds.includes(userId);
    try {
      await updateTask({
        id: taskId,
        data: isAlreadyAssigned
          ? { removeAssignees: [userId] }
          : { addAssignees: [userId] },
      }).unwrap();
    } catch (err) {
      console.error('Failed to update assignees:', err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-1000">
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />

      <div
        className="absolute bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 w-[300px] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{
          top: Math.min(triggerRect.bottom + 8, window.innerHeight - 450),
          left: Math.min(triggerRect.left, window.innerWidth - 320),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-gray-50">
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
              placeholder="Tìm kiếm người giao việc..."
              className="w-full bg-gray-50/50 border border-gray-100 rounded-lg pl-9 pr-3 py-2 text-[12px] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-100/50 focus:border-blue-400 transition-all"
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
                    isSelected={assigneeIds.includes(me._id || me.id || '')}
                  />
                </div>
              )}

              {/* Suggestions Header */}
              <div className="px-3 py-1.5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Thành viên team
                </p>
                <span className="text-[10px] text-gray-300 font-medium">
                  {assigneeIds.length} đã chọn
                </span>
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
                        isSelected={assigneeIds.includes(
                          user._id || user.id || '',
                        )}
                      />
                    ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-400 text-xs">
                      Không tìm thấy người dùng
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 bg-gray-50/50 border-t border-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddingAssignee;
