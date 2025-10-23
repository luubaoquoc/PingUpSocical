import express from 'express';
import { upload } from '../configs/multer.js';
import { protect } from '../middlewares/auth.js';
import { getChatMessages, sendMessage, sseControler } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get('/:userId', sseControler);
messageRouter.post('/send', protect, upload.single('image'), sendMessage);
messageRouter.post('/get', protect, getChatMessages);

export default messageRouter;