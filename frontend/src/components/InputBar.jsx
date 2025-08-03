export default function InputBar({ input, onChange, onSend, onStop, streaming }) {
  return (
    <div className="flex gap-2">
      <input
        className="flex-1 border rounded px-3 py-2 text-sm"
        placeholder={streaming ? "Assistant is responding..." : "Type your message"}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !streaming) onSend();
          if (e.key === "Escape" && streaming) onStop();
        }}
        disabled={streaming}
      />
      <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={onSend} disabled={streaming || !input.trim()}>
        Send
      </button>
      <button className="bg-gray-300 px-3 py-2 rounded" onClick={onStop} disabled={!streaming}>
        Stop
      </button>
    </div>
  );
}
