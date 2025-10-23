
import imagekit from "../configs/imageKit.js";
import fs from "fs";
import Story from "../models/Story.js";
import { inngest } from "../inngest/index.js";
import User from "../models/User.js";

// Thêm Story
export const addStory = async (req, res) => {
  try {
    const userId = req.userId;
    const { content, media_type, background_color } = req.body;
    const media = req.file;

    let media_url = '';

    if (media_type === 'image' || media_type === 'video') {
      const fileBuffer = fs.readFileSync(media.path)
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: media.originalname,
      })

      media_url = response.url;
    }

    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color
    });

    await inngest.send({
      name: "aap/story-delete",
      data: { storyId: story._id },
    })

    res.status(201).json({ success: true, story });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}


// Lấy danh sách Story
export const getStories = async (req, res) => {
  try {

    const userId = req.userId;
    const user = await User.findById(userId);

    const userIds = [userId, ...user.connections, ...user.following];
    const stories = await Story.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 })
      .populate('user').sort({ createdAt: -1 });

    res.status(200).json({ success: true, stories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}