import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import ChatPane from "./components/ChatPane";

export default function App() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortControllerRef = useRef(null);

  // Load chats on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/chats")
      .then(res => res.json())
      .then(setChats);
  }, []);

  // Load messages for selected chat
  useEffect(() => {
    if (currentChatId) {
      fetch(`http://localhost:5000/api/chat/${currentChatId}`)
        .then(res => res.json())
        .then(setMessages);
    }
  }, [currentChatId]);

  const startNewChat = async () => {
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const data = await res.json();
    setChats(prev => [data, ...prev]);
    setCurrentChatId(data.id);
    setMessages([]);
  };

  const handleRename = async (chatId, newTitle) => {
    if (!newTitle.trim()) return;
    await fetch(`http://localhost:5000/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, isRenamed: true })
    });
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, title: newTitle, isEditing: false, tempTitle: undefined }
          : chat
      )
    );
  };

  const generateAITitle = async (chatId, messages) => {
    try {
      const res = await fetch("http://localhost:5000/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, messages })
      });
      const data = await res.json();
      const newTitle = data.title;

      await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, isRenamed: false })
      });

      setChats(prev =>
        prev.map(chat => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
      );
    } catch (err) {
      console.error("Failed to generate title:", err);
    }
  };

  const streamReply = async (chatId, prompt, onToken) => {
    if (!chatId) return;
    setStreaming(true);
    abortControllerRef.current = new AbortController();
    let botMsg = "";

    const res = await fetch(`http://localhost:5000/api/chat/${chatId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: prompt }),
      signal: abortControllerRef.current.signal
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let buffer = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;

      if (value) {
        buffer += decoder.decode(value, { stream: !done });

        let lines = buffer.split("\n");
        buffer = lines.pop(); // save last partial line

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") {
              setStreaming(false);
              abortControllerRef.current = null;
              return;
            }

            try {
              const payload = JSON.parse(data);
              if (payload.token) {
                botMsg += payload.token;
                onToken(botMsg);
              }
            } catch {}
          }
        }
      }
    }

    setStreaming(false);
    abortControllerRef.current = null;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentChatId) return;

    setMessages(prev => [...prev, { role: "user", content: input }]);
    const prompt = input;
    setInput("");

    let newBotMsg = "";
    await streamReply(currentChatId, prompt, (msg) => {
      newBotMsg = msg;
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === "assistant") {
          return [...prev.slice(0, -1), { role: "assistant", content: msg }];
        }
        return [...prev, { role: "assistant", content: msg }];
      });
    });
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen bg-white text-black">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={startNewChat}
        onSelectChat={setCurrentChatId}
        onRenameChat={handleRename}
        onRegenerateTitle={() => generateAITitle(currentChatId, messages)}
      />
      <ChatPane
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSend={handleSendMessage}
        onStop={handleStop}
        streaming={streaming}
      />
    </div>
  );
}
