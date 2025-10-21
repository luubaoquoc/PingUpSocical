
import imagekit from "../configs/imageKit.js";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import fs from "fs";



// Lấy thông tin người dùng
export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}


// Cập nhật thông tin người dùng
export const updateUserData = async (req, res) => {
  try {
    const userId = req.userId;
    let { full_name, username, bio, location } = req.body;


    const tempUser = await User.findById(userId);
    !username && (username = tempUser.username);

    if (username !== tempUser.username) {
      const user = await User.findOne({ username })
      if (user) {
        username = tempUser.username
      }
    }

    const updateData = {
      full_name,
      username,
      bio,
      location
    }

    const profile = req.files.profile && req.files.profile[0]
    const cover = req.files.cover && req.files.cover[0]

    if (profile) {
      const buffer = fs.readFileSync(profile.path)
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      })

      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '512' },
        ]
      })
      updateData.profile_picture = url;
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path)
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      })

      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '1280' },
        ]
      })
      updateData.cover_photo = url;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    res.status(200).json({ success: true, user, message: "Hồ sơ cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}

// Tìm kiếm người dùng để kết bạn
export const discoverUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const { input } = req.body;
    const allUsers = await User.find(
      {
        $or: [
          { username: new RegExp(input, 'i') },
          { full_name: new RegExp(input, 'i') },
          { email: new RegExp(input, 'i') },
          { location: new RegExp(input, 'i') },
        ],
      }
    )
    const filteredUsers = allUsers.filter(user => user._id !== userId);
    res.status(200).json({ success: true, users: filteredUsers, message: "Lấy người dùng thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}


//Theo dõi người dùng
export const followUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    const user = await User.findById(userId);

    if (user.following.includes(id)) {
      return res.status(400).json({ success: false, message: "Bạn đã theo dõi người dùng này" });
    }
    user.following.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();
    res.status(200).json({ success: true, user, message: "Theo dõi người dùng thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}

// Hủy theo dõi người dùng
export const unfollowUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    const user = await User.findById(userId);

    user.following = user.following.filter(user => user !== id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers = toUser.followers.filter(follower => follower !== userId);
    await toUser.save();

    res.status(200).json({ success: true, user, message: "Hủy theo dõi người dùng thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}


// Gửi lời mời kết bạn
export const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({
      from_user_id: userId,
      createdAt: { $gt: last24Hours }
    });

    if (connectionRequests.length >= 20) {
      return res.status(400).json({ success: false, message: "Bạn đã gửi quá nhiều lời mời kết bạn trong 24 giờ qua. Vui lòng thử lại sau." });
    }

    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId }
      ]
    });

    if (!connection) {
      await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });
      return res.status(200).json({ success: true, message: "Gửi lời mời kết bạn thành công" });
    } else if (connection && connection.status === "accepted") {
      return res.status(400).json({ success: false, message: "Đã tồn tại lời mời kết bạn giữa hai người dùng" });
    }
    return res.status(400).json({ success: false, message: "Đã tồn tại lời mời kết bạn giữa hai người dùng" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}

// lấy danh sách kết bạn
export const getConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate('connections followers following');

    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    const pendingConnections = await Connection.find({
      to_user_id: userId, status: 'pending'
    }).populate('from_user_id').map(conn =>
      conn.from_user_id);

    res.status(200).json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections,
      message: "Lấy danh sách kết bạn thành công"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}

// Chấp nhận lời mời kết bạn
export const acceptConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;
    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });
    if (!connection) {
      return res.status(404).json({ success: false, message: "Lời mời kết bạn không tồn tại" });
    }
    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status = 'accepted';
    await connection.save();

    res.status(200).json({ success: true, user, message: "Chấp nhận lời mời kết bạn thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}