import express from "express";
import { createChat,sendMessage,stopMessageStream,getChats,getChatById,editTitle } from "../contollers/chat.controller.js";

const router = express.Router();

router.post("/chat", createChat);
router.post("/chat/:chatId/message", sendMessage);
router.post("/chat/:chatId/stop", stopMessageStream);
router.get("/chats", getChats);
router.get("/chat/:chatId", getChatById);
router.patch("/chats/:id",editTitle)


export default router;
