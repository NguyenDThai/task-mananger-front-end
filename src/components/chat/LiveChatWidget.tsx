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
const WIDGET_WIDTH = 320; // w-80
const WIDGET_HEIGHT = 500; // h-[500px]
const BUTTON_SIZE = 48; // w-12 h-12

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
  const [position, setPosition] = useState<Position>({ x: 1280, y: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const positionOnDragStart = useRef<Position>({ x: 0, y: 0 });

  // (Set default position)
  const setDefaultPosition = useCallback(() => {
    const x = window.innerWidth - WIDGET_WIDTH - 16; // 16px = 4 (Tailwind)
    const y = window.innerHeight - WIDGET_HEIGHT - 16;
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
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // (Handle mouse move for dragging)
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // (Set boundary limits)
      const maxX = window.innerWidth - BUTTON_SIZE;
      const maxY = window.innerHeight - BUTTON_SIZE;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // (Save final position)
      setPosition((prevPosition) => {
        savePosition(prevPosition);
        return prevPosition;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, widgetView]);

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
          className="absolute right-full bottom-0 mr-3 w-90 h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
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
                currentUserId={currentUser?.id}
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
