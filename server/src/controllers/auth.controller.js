import authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const result = await authService.register({ username, email, password });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please save your private key securely!',
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});
