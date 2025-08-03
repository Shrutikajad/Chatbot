import { useState } from "react";

export default function ChatItem({ chat, isActive, onSelect, onRename }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title || "");

  const handleRename = () => {
    if (title.trim()) {
      onRename(chat.id, title);
      setEditing(false);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded cursor-pointer ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}`}
    >
      {editing ? (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
          className="w-full border px-2 py-1 text-sm"
          autoFocus
        />
      ) : (
        <div className="flex justify-between items-center">
          <div className="font-medium text-sm truncate">{chat.title || `Chat ${chat.id}`}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="text-xs text-gray-500"
          >
            ✏️
          </button>
        </div>
      )}
    </div>
  );
}
