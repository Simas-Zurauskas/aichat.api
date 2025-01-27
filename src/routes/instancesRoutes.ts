import express from 'express';
import {
  createInstance,
  deleteInstance,
  extendAccess,
  getInstance,
  getInstances,
  setLLM,
  setTemperature,
  updateInstance,
} from '@controlers/instances';
import { delChat, getChat, sendChatMessage } from '@controlers/instances/chat';
import { owner, protect } from '@middleware/authMiddleware';
import upload from '@conf/multer';
import { delFile, updateFile, requestFileUrl, uploadFiles } from '@controlers/instances/file';
import { leaveFeedback } from '@controlers/instances/chat/leaveFeedback';

const router = express.Router();

router.get('/', protect, getInstances);
router.post('/', protect, upload.array('files'), createInstance);
router.get('/:uxId', protect, owner, getInstance);
router.delete('/:uxId', protect, owner, deleteInstance);
router.put('/:uxId', protect, owner, updateInstance);
router.put('/:uxId/llm', protect, owner, setLLM);
router.put('/:uxId/temperature', protect, owner, setTemperature);
router.put('/:uxId/extend', protect, owner, extendAccess);
router.get('/:uxId/chat', protect, owner, getChat);
router.post('/:uxId/chat', protect, owner, sendChatMessage);
router.delete('/:uxId/chat', protect, owner, delChat);
router.put('/:uxId/chat/feedback/:messageId', protect, owner, leaveFeedback);
router.post('/:uxId/file', protect, owner, upload.array('files'), uploadFiles);
router.put('/:uxId/file/:fileId', protect, owner, updateFile);
router.delete('/:uxId/file/:fileId', protect, owner, delFile);
router.get('/:uxId/file/:fileId/request-url', protect, owner, requestFileUrl);

export { router as instancesRoutes };
