import React from 'react';
import type { TaskUser } from '../../types';

interface AssigneeGroupProps {
  assignees: (TaskUser | string)[];
  maxVisible?: number;
  className?: string;
  onClick?: () => void;
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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const AssigneeGroup: React.FC<AssigneeGroupProps> = ({
  assignees = [],
  maxVisible = 3,
  className = '',
}) => {
  const visibleAssignees = assignees.slice(0, maxVisible);
  const remainingCount = assignees.length - maxVisible;

  return (
    <div className={`flex items-center -space-x-2 ${className}`}>
      {visibleAssignees.map((assignee, index) => {
        const user = typeof assignee === 'object' ? assignee : null;
        const name = user?.name || 'Unknown';
        const avatar = user?.avatar;

        return (
          <div
            key={user?._id || index}
            className="relative"
            style={{ zIndex: visibleAssignees.length - index }}
            title={name}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-black/5"
              />
            ) : (
              <div
                className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-black/5 ${getAvatarColor(name)}`}
              >
                {getInitials(name)}
              </div>
            )}
          </div>
        );
      })}

      {remainingCount > 0 && (
        <div className="relative z-0 flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 border-2 border-white text-[10px] font-bold text-gray-600 shadow-sm ring-1 ring-black/5">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
