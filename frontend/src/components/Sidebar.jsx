import ChatItem from "./ChatItem";

export default function Sidebar({ chats, currentChatId, onNewChat, onSelectChat, onRenameChat, onRegenerateTitle }) {
  return (
    <div className="w-64 border-r p-4 flex flex-col">
      <button onClick={onNewChat} className="mb-4 bg-blue-600 text-white py-2 px-4 rounded">+ New Chat</button>
      <div className="flex-1 overflow-auto space-y-2">
        {chats.map(chat => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={chat.id === currentChatId}
            onSelect={() => onSelectChat(chat.id)}
            onRename={onRenameChat}
          />
        ))}
      </div>
      <button
        onClick={onRegenerateTitle}
        disabled={!currentChatId}
        className="mt-4 text-sm text-gray-500 hover:underline"
      >
        🔄 Regenerate Title
      </button>
    </div>
  );
}
