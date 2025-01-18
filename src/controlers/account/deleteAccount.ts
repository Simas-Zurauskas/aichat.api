import InstanceModel from '@models/Instance';
import UserModel from '@models/UserModel';
import { deleteFmService } from '@services/deleteFmService';
import asynchandler from 'express-async-handler';

// ------------------------------------------------------------------
// @route DELETE /api/account
// @access Public
export const deleteAccount = asynchandler(async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId as string;

    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const instances = await InstanceModel.find({ userId });

    instances.forEach(async (el) => {
      console.log('crearInstances'.yellow.bold, el);

      for (const file of el.files) {
        if (file) {
          await deleteFmService(file);
        }
      }

      await InstanceModel.findByIdAndDelete(el._id);
    });

    res.status(200).json({ data: null });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
