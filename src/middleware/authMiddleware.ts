import asyncHandler from 'express-async-handler';
import { decodeAuthToken } from '../util/auth';
import UserModel from '@models/UserModel';
import InstanceModel from '@models/Instance';

export const protect = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  const token = req.headers.authorization.split(' ')[1];
  const decoded = decodeAuthToken(token);

  if (!decoded) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  const user = await UserModel.findById(decoded.id).catch(() => {
    res.status(500);
    throw new Error('Server error');
  });

  if (user?.authSecret !== decoded.authSecret) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  // @ts-ignore
  req.userId = decoded.id;

  next();
});

export const owner = asyncHandler(async (req, res, next) => {
  // @ts-ignore
  const userId = req.userId as string;
  const { uxId } = req.params;

  const instance = await InstanceModel.findOne({
    uxId,
    user: userId,
  }).select('_id');

  if (!instance) {
    res.status(404);
    throw new Error('Node not found');
  }

  next();
});
