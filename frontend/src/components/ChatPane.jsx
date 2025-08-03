import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";

export default function ChatPane({ messages, input, onInputChange, onSend, onStop, streaming }) {
  return (
    <div className="flex-1 flex flex-col px-6 py-4">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role} content={msg.content} />
        ))}
        {streaming && <p className="text-sm text-gray-400">Assistant is typing...</p>}
      </div>
      <InputBar
        input={input}
        onChange={onInputChange}
        onSend={onSend}
        onStop={onStop}
        streaming={streaming}
      />
    </div>
  );
}
