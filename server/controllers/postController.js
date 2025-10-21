import imagekit from "../configs/imageKit.js";
import fs from "fs";
import Post from "../models/Post.js";
import User from "../models/User.js";



// Tạo bài viết mới
export const addPost = async (req, res) => {
  try {
    const userId = req.userId;
    const { content, post_type } = req.body;

    const images = req.files

    let image_urls = [];

    if (images.length) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);
          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: "posts",
          })

          const url = imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: 'auto' },
              { format: 'webp' },
              { width: '512' },
            ]
          })
          return url;
        })
      )
    }
    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });

    res.status(201).json({ success: true, message: "Bài viết đã được tạo thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};


// Lấy danh sách bài viết
export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const userIds = [userId, ...user.connections, ...user.following];
    const posts = await Post.find({ user: { $in: userIds } }).populate("user").sort({
      createdAt: -1
    });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};


// Thích bài viết
export const likePost = async (req, res) => {
  try {
    const userId = req.userId;

    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (post.like_count.includes(userId)) {
      post.like_count = post.like_count.filter(user => user !== userId);
      await post.save();
      res.status(200).json({ success: true, message: "Bỏ thích bài viết thành công" });
    } else {
      post.like_count.push(userId);
      await post.save();
      res.status(200).json({ success: true, message: "Thích bài viết thành công" });
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};
