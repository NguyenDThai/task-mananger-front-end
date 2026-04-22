import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { NewChatWindow } from './NewChatWindow';
import type {
  IChatItem,
  ISChatUser,
  IMessageItem,
  TMessageAction,
} from '../../types/chat.type';

interface LiveChatWidgetProps {
  chats?: IChatItem[];
  members?: ISChatUser[];
  currentChat?: IChatItem | null;
  currentUser?: ISChatUser | null;
  messages?: IMessageItem[];
  isLoading?: boolean;
  isLoadingOldMessages?: boolean;
  unreadCount?: number;
  onSelectChat?: (chatId: number) => void;
  onDeleteChat?: (chatId: number) => void;
  onSendMessage?: (
    chatId: number,
    content: string,
    files: File[],
    replyId?: number | null,
  ) => void;
  onMessageAction?: (messageId: number, action: TMessageAction) => void;
  onCreateNewChat?: (
    receivers: ISChatUser[],
    groupName?: string,
  ) => Promise<void>;
  onLoadOldMessages?: () => Promise<void>;
}

type WidgetView = 'collapsed' | 'sidebar' | 'chat' | 'new-chat';

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = 'live-chat-widget-position';
const BUTTON_SIZE = 48; // w-12 h-12
const WIDGET_WIDTH = 300;
const WIDGET_HEIGHT = 300;

export const LiveChatWidget = ({
  chats = [],
  members = [],
  currentChat = null,
  currentUser = null,
  messages = [],
  isLoading = false,
  isLoadingOldMessages = false,
  unreadCount = 0,
  onSelectChat = () => {},
  onDeleteChat = () => {},
  onSendMessage = () => {},
  onMessageAction = () => {},
  onCreateNewChat = async () => {},
  onLoadOldMessages = async () => {},
}: LiveChatWidgetProps) => {
  const [widgetView, setWidgetView] = useState<WidgetView>('collapsed');
  const [totalUnread, setTotalUnread] = useState(unreadCount);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const innerWidgetRef = useRef<HTMLDivElement>(null);
  const positionOnDragStart = useRef<Position>({ x: 0, y: 0 });
  const currentDragOffset = useRef<Position>({ x: 0, y: 0 });

  // (Set default position)
  const setDefaultPosition = useCallback(() => {
    const x = window.innerWidth - BUTTON_SIZE - 16; // 16px = 4 (Tailwind)
    const y = window.innerHeight - BUTTON_SIZE - 16;
    setPosition({ x, y });
  }, []);

  // (Load saved position)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load widget position:', error);
        setDefaultPosition();
      }
    } else {
      setDefaultPosition();
    }
  }, [setDefaultPosition]);

  // (Save position to localStorage)
  const savePosition = (newPosition: Position) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosition));
  };

  useEffect(() => {
    setTotalUnread(unreadCount);
  }, [unreadCount]);

  const handleToggleWidget = () => {
    // Nếu đã drag (vị trí khác ban đầu) thì không mở widget
    if (
      Math.abs(position.x - positionOnDragStart.current.x) > 5 ||
      Math.abs(position.y - positionOnDragStart.current.y) > 5
    ) {
      return;
    }
    setWidgetView((prev) => (prev === 'collapsed' ? 'sidebar' : 'collapsed'));
  };

  const handleOpenNewChat = () => {
    setWidgetView('new-chat');
  };

  const handleBackToChat = () => {
    setWidgetView('sidebar');
  };

  const handleSelectChat = (chatId: number) => {
    onSelectChat(chatId);
    setTotalUnread(Math.max(0, totalUnread - 1));
    setWidgetView('chat');
  };

  const handleCreateNewChat = async (
    receivers: ISChatUser[],
    groupName?: string,
  ) => {
    try {
      await onCreateNewChat(receivers, groupName);
      setWidgetView('sidebar');
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleSendMessage = (
    content: string,
    files: File[],
    replyId?: number | null,
  ) => {
    if (currentChat?.id) {
      onSendMessage(currentChat.id, content, files, replyId);
    }
  };

  // (Handle mouse down for dragging)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Icon button
    const target = e.target as HTMLElement;
    const isButton = target.closest('button');

    if (isButton) {
      positionOnDragStart.current = { ...position };
      setIsDragging(true);
      currentDragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  // (Handle mouse move for dragging)
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newX = e.clientX - currentDragOffset.current.x;
      let newY = e.clientY - currentDragOffset.current.y;

      // (Set boundary limits)
      const maxX = window.innerWidth - BUTTON_SIZE;
      const maxY = window.innerHeight - BUTTON_SIZE;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      // Update DOM directly to avoid re-render during drag
      if (widgetRef.current) {
        widgetRef.current.style.left = `${newX}px`;
        widgetRef.current.style.top = `${newY}px`;
      }

      // (Real-time Flip Direction - no setState)
      if (innerWidgetRef.current) {
        const isNearLeft = newX < WIDGET_WIDTH;
        const isNearTop = newY < WIDGET_HEIGHT;

        // Update horizontal positioning
        if (isNearLeft) {
          innerWidgetRef.current.classList.add('left-full');
          innerWidgetRef.current.classList.add('ml-3');
          innerWidgetRef.current.classList.remove('right-full');
          innerWidgetRef.current.classList.remove('mr-3');
        } else {
          innerWidgetRef.current.classList.add('right-full');
          innerWidgetRef.current.classList.add('mr-3');
          innerWidgetRef.current.classList.remove('left-full');
          innerWidgetRef.current.classList.remove('ml-3');
        }

        // Update vertical positioning
        if (isNearTop) {
          innerWidgetRef.current.classList.add('top-0');
          innerWidgetRef.current.classList.remove('bottom-0');
        } else {
          innerWidgetRef.current.classList.add('bottom-0');
          innerWidgetRef.current.classList.remove('top-0');
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Get final position from DOM and save to state + localStorage
      if (widgetRef.current) {
        const finalX = parseInt(widgetRef.current.style.left, 10);
        const finalY = parseInt(widgetRef.current.style.top, 10);
        const finalPosition = { x: finalX, y: finalY };

        setPosition(finalPosition);
        savePosition(finalPosition);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Get chat name from members or use default
  const getActiveChatName = () => {
    if (!currentChat) return 'Chat';
    if (currentChat.type === 'group') {
      return `${currentChat.name || 'Nhóm trò chuyện'}`;
    }
    // For single chat, get the other member's name
    const otherMember = currentChat.members?.find(
      (member) => member.code !== currentUser?.code,
    );
    return otherMember?.name || 'Chat';
  };

  // Get chat avatar from first member
  const getActiveChatAvatar = () => {
    const otherMember = currentChat?.members?.find(
      (member) => member.code !== currentUser?.code,
    );
    return otherMember?.avatar;
  };

  // (Viewport-Aware Positioning)
  const isNearLeft = position.x < WIDGET_WIDTH;
  const isNearTop = position.y < WIDGET_HEIGHT;

  // Generate dynamic positioning classes
  const expandedWidgetClasses = `absolute ${isNearLeft ? 'left-full' : 'right-full'} ${isNearTop ? 'top-0' : 'bottom-0'} ml-3 mr-3 w-100 h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 transition-all duration-200`;

  // (Sync innerWidgetRef classes when widgetView changes - initial render)
  useEffect(() => {
    if (innerWidgetRef.current && widgetView !== 'collapsed') {
      const localIsNearLeft = position.x < WIDGET_WIDTH;
      const localIsNearTop = position.y < WIDGET_HEIGHT;

      // Apply horizontal classes
      if (localIsNearLeft) {
        innerWidgetRef.current.classList.add('left-full', 'ml-3');
        innerWidgetRef.current.classList.remove('right-full', 'mr-3');
      } else {
        innerWidgetRef.current.classList.add('right-full', 'mr-3');
        innerWidgetRef.current.classList.remove('left-full', 'ml-3');
      }

      // Apply vertical classes
      if (localIsNearTop) {
        innerWidgetRef.current.classList.add('top-0');
        innerWidgetRef.current.classList.remove('bottom-0');
      } else {
        innerWidgetRef.current.classList.add('bottom-0');
        innerWidgetRef.current.classList.remove('top-0');
      }
    }
  }, [widgetView, position]);

  return (
    <div
      ref={widgetRef}
      className="fixed z-50 font-sans"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Expanded Widget (positioned above icon) */}
      {(widgetView === 'sidebar' ||
        widgetView === 'chat' ||
        widgetView === 'new-chat') && (
        <div
          ref={innerWidgetRef}
          className={expandedWidgetClasses}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Widget Header */}
          <div className="chat-widget-header h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between px-4 py-3 sticky top-0 z-30 select-none">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <h1 className="text-sm font-semibold">Live Chat</h1>
                <p className="text-xs opacity-90">Trò chuyện trực tiếp</p>
              </div>
            </div>
            <button
              onClick={handleToggleWidget}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Đóng chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Widget Content */}
          <div className="flex-1 overflow-y-auto">
            {widgetView === 'new-chat' ? (
              <NewChatWindow
                members={members}
                isLoading={isLoading}
                onSelectReceiver={handleCreateNewChat}
                onBack={handleBackToChat}
              />
            ) : widgetView === 'sidebar' ? (
              <ChatSidebar
                chats={chats}
                activeChat={currentChat}
                currentUser={currentUser}
                isLoading={isLoading}
                onSelectChat={handleSelectChat}
                onDeleteChat={onDeleteChat}
                onCreateNewChat={handleOpenNewChat}
              />
            ) : (
              <ChatWindow
                chatId={currentChat?.id}
                chatName={getActiveChatName()}
                chatAvatar={getActiveChatAvatar()}
                messages={messages}
                isLoading={isLoading}
                isLoadingOldMessages={isLoadingOldMessages}
                onSendMessage={handleSendMessage}
                onMessageAction={onMessageAction}
                onLoadOldMessages={onLoadOldMessages}
                onBack={handleBackToChat}
              />
            )}
          </div>
        </div>
      )}

      {/* Icon Button (always visible - anchor point) */}
      <button
        onClick={handleToggleWidget}
        className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group select-none cursor-grab active:cursor-grabbing"
        title={widgetView === 'collapsed' ? 'Mở chat' : 'Đóng chat'}
      >
        <MessageCircle size={20} />
      </button>
    </div>
  );
};
