import fs from 'fs';
import imagekit from '../configs/imageKit.js';
import Message from '../models/Messages.js';

const connections = {}

export const sseControler = (req, res) => {
  const userId = req.params.userId;
  console.log('New client connected: ', userId);

  // set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Add the client's response object to the connections object
  connections[userId] = res;

  //send an initial event to the client
  res.write('log: Connection to SSE stream\n\n');

  // handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected: ', userId);
    delete connections[userId];
  });
};

//Send Message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { to_user_id, text } = req.body;

    const image = req.file;

    let media_url = '';
    let message_type = image ? 'image' : 'text';

    if (message_type === 'image') {
      const fileBuffer = fs.readFileSync(image.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      })

      media_url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '1280' },
        ]
      })
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    res.status(201).json({ success: true, message });

    const messageWithUserData = await Message.findById(message._id)
      .populate('from_user_id');
    if (connections[to_user_id]) {
      connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
    }
  } catch (error) {
    console.error('Error sending message: ', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};

//Get Messages between two users
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId }
      ]
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId, seen: false },
      { seen: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching chat messages: ', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};


export const getUserReccentMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const messages = await Message.find({ to_user_id: userId }).populate(
      'from_user_id to_user_id'
    ).sort({ createdAt: -1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching recent messages: ', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};