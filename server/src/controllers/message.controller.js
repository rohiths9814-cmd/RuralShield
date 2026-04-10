import messageService from '../services/message.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const { recipientEmail, subject, body } = req.body;

  const message = await messageService.sendMessage({
    senderId: req.user._id,
    recipientEmail,
    subject,
    body,
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: { message },
  });
});

export const getInbox = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await messageService.getInbox(req.user._id, { page, limit });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getSent = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await messageService.getSent(req.user._id, { page, limit });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getMessage = asyncHandler(async (req, res) => {
  const message = await messageService.getMessage(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    data: { message },
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const message = await messageService.markAsRead(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    data: { message },
  });
});

export const toggleStar = asyncHandler(async (req, res) => {
  const message = await messageService.toggleStar(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    data: { message },
  });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const result = await messageService.deleteMessage(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await messageService.getUnreadCount(req.user._id);

  res.status(200).json({
    success: true,
    data: { unreadCount: count },
  });
});

export const analyzeMessage = asyncHandler(async (req, res) => {
  const message = await messageService.reanalyzeMessage(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Message re-analyzed successfully',
    data: { scamAnalysis: message.scamAnalysis },
  });
});
