import UserStore from '../data/users.js';
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

  const users = UserStore.search(q, req.user._id, 10);

  res.status(200).json({
    success: true,
    data: { users },
  });
});

export const getPublicKey = asyncHandler(async (req, res) => {
  const user = UserStore.findById(req.params.id);

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
