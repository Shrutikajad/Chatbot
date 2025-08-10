# AI-Chatbot
# ChatGPT-Style AI Chat App 💬🤖

This is a modern, full-stack AI chatbot interface inspired by ChatGPT, built using:

- ⚛️ React + Vite
- 🎨 Tailwind CSS for styling
- 🔌 Node.js + Express backend with streaming responses
- 🧠 OpenAI-compatible token-based chat API (or your own LLM)

---

## 🚀 Features

- Real-time streaming chat experience
- AI-powered title generation for chats
- Edit chat titles inline
- Clean, responsive UI (like ChatGPT)
- Organized component structure (React)

---

## 🧱 Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Component-based architecture

### Backend
- Node.js + Express
- Streaming endpoint (`/api/chat/:id/message`)
- AI title generation (`/generate-title`)

---

## 📦 Installation

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9 (comes with Node)
- Backend running at `http://localhost:5000`

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chatbot-clone.git
cd chatbot

### 2. Setup Backend
cd backend
npm install

⚙️ Create .env file
PORT=5000
API_URL=http://127.0.0.1:11434/api/generate  // llm url
DATABASE_URL=db url

🚀 Start Backend
npm run dev
🎨 3. Setup Frontend
Open a new terminal:
cd frontend
npm install
🔧 (Optional) Configure Base URL
Update the API base URL in your frontend (if needed):
const BASE_URL = "http://localhost:5000";
🚀 Start Frontend
npm run dev
Open in browser: http://localhost:5173



