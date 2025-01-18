import UserModel from '@models/UserModel';
import asynchandler from 'express-async-handler';

// ------------------------------------------------------------------
// @route GET /api/auth
// @access Public
export const authorise = asynchandler(async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId as string;

    const user = await UserModel.findById(userId).lean().select('-authSecret -__v');

    if (!user) {
      throw new Error('User not found');
    }

    res.status(200).json({ data: user });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
