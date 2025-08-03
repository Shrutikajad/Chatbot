import { pool } from "../config/db.js";
import axios from "axios";

export const createChat= async (req,res)=>{
    try {
    const { title } = req.body;
    const r = await pool.query(
      'INSERT INTO chats (title) VALUES ($1) RETURNING id, title, created_at',
      [title || 'New Chat']
    );
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export const sendMessage= async(req,res)=>{
  
      const chatId = req.params.chatId;
      const { content } = req.body;
    
      // Save user message
      await pool.query('INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)', [chatId, 'user', content]);
    
      // SSE Headers
      res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
      });
      res.flushHeaders();
    
      // Stream LLM tokens
      try {
        const ollamaReq = await axios.post(
          'http://127.0.0.1:11434/api/generate',
          {
            model: 'gemma3:1b',
            prompt: content,
            stream: true,
          },
          { responseType: 'stream' }
        );
    
        let fullContent = '';
    
        ollamaReq.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(Boolean);
          for (let line of lines) {
            if (line.trim()) {
              // Simple stream - you may need to parse chunks per Ollama API spec
              try {
                const d = JSON.parse(line);
                if (d.response) {
                  fullContent += d.response;
                  res.write(`data: ${JSON.stringify({ token: d.response })}\n\n`);
                }
                if (d.done) {
                  // Save bot message
                  pool.query(
                    'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
                    [chatId, 'assistant', fullContent]
                  );
                  res.write('data: [DONE]\n\n');
                  res.end();
                }
               } catch (e) {}
            }
           }
         });
    
        req.on('close', () => {
          ollamaReq.data.destroy();
          res.end();
        });
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }

  }


export const stopMessageStream = async (req, res) => {
  const { chatId } = req.params;
  const controller = streamControllers.get(chatId);

  if (controller) {
    controller.abort(); // Kill stream
    streamControllers.delete(chatId);
    res.json({ message: "Streaming aborted." });
  } else {
    res.status(404).json({ error: "No active stream found." });
  }
};

export const getChats =async(req,res)=>{
      const r = await pool.query('SELECT * FROM chats ORDER BY created_at DESC');
      res.json(r.rows);
}

export const getChatById = async (req, res) => {
  const { chatId } = req.params;
  const result = await pool.query(
    "SELECT role, content, timestamp FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC",
    [chatId]
  );
  res.json(result.rows);
};


export const editTitle= async (req,res)=>{
      const { title } = req.body;
  const chatId = req.params.id;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  try {
    const result = await pool.query(
      `UPDATE chats
       SET title = $1,
           is_renamed = TRUE,
           last_modified = NOW()
       WHERE id = $2
       RETURNING *`,
      [title.trim(), chatId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json({ message: "Renamed successfully", chat: result.rows[0] });
  } catch (err) {
    console.error("Error renaming chat:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export const generateTitle =async (req,res)=>{
    const { chatId, messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages required" });
  }

  const prompt = `
Generate a short, engaging chat title from this conversation.
Limit: 6 words or fewer. No punctuation.
Messages:
${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer YOUR_API_KEY`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim() || "New Chat";

    res.json({ title });
  } catch (err) {
    console.error("Error generating title:", err);
    res.status(500).json({ error: "Title generation failed" });
  }
}