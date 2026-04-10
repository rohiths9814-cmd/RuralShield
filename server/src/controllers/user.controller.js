import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({
      success: true,
      data: { users: [] },
    });
  }

  const users = await User.find({
    $and: [
      { _id: { $ne: req.user._id } }, // Exclude self
      {
        $or: [
          { email: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } },
        ],
      },
    ],
  })
    .select('username email avatar')
    .limit(10);

  res.status(200).json({
    success: true,
    data: { users },
  });
});

export const getPublicKey = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('publicKey username email');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      userId: user._id,
      username: user.username,
      email: user.email,
      publicKey: user.publicKey,
    },
  });
});
