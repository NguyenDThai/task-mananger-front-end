import { useChat } from '../../hooks/useChat';
import { ChatSidebar, ChatWindow, NewChatWindow } from '../../components/chat';
import { chat } from '../../services/chatService';
import { setCurrentChat } from '../../redux/slides/chat/chatSlide';

export const Chat = () => {
  const {
    isLoading,
    currentUser,
    chats,
    currentChat,
    currentChatMessages,
    members,
    dispatch,
    isCreatingNewChat,
    setIsCreatingNewChat,
    handleSelectReceiver,
    handleDeleteChat,
  } = useChat();

  // Get chat name from members or use default
  const getActiveChatName = () => {
    if (!currentChat) return 'Chat';
    if (currentChat.type === 'group') {
      return `Nhóm (${currentChat.members?.length || 0} thành viên)`;
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

  const handleSelectChat = (chatId: number) => {
    const selectedChat = chats.find((chat) => chat.id === chatId);
    if (selectedChat) {
      dispatch(setCurrentChat(selectedChat));
    }
  };

  const switchToNewChatWindow = () => {
    setIsCreatingNewChat(true);
  };

  const switchBack = () => {
    setIsCreatingNewChat(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser || !chat || !currentChat) return;
    await chat?.addMessage(currentChat.id, content);
  };

  return (
    <div className="h-screen flex gap-0 no-header hidden-y hidden-x">
      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block md:w-64 lg:w-80 flex-shrink-0">
        <ChatSidebar
          chats={chats}
          activeChat={currentChat}
          currentUser={currentUser}
          isLoading={isLoading.sidebar}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onCreateNewChat={switchToNewChatWindow}
        />
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col">
        {isCreatingNewChat ? (
          <NewChatWindow
            members={members}
            isLoading={isLoading.chatWindow}
            onSelectReceiver={handleSelectReceiver}
            onBack={switchBack}
          />
        ) : (
          <ChatWindow
            chatId={currentChat?.id}
            chatName={getActiveChatName()}
            chatAvatar={getActiveChatAvatar()}
            messages={currentChatMessages}
            isLoading={isLoading.chatWindow}
            currentUserId={currentUser?.id}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
};
