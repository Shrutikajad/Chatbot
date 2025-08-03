export default function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`px-4 py-2 rounded-xl text-sm max-w-lg whitespace-pre-wrap ${isUser ? "bg-blue-100" : "bg-gray-100"}`}>
        {content}
      </div>
    </div>
  );
}
