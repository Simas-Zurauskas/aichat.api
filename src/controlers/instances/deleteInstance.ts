import asynchandler from 'express-async-handler';
import { deleteFmService } from '@services/deleteFmService';
import InstanceModel from '@models/Instance';

// ------------------------------------------------------------------
// @route DELETE /api/instances/:uxId
// @access Private, Owner
export const deleteInstance = asynchandler(async (req, res) => {
  try {
    const { uxId } = req.params;
    const instance = await InstanceModel.findOneAndDelete({ uxId });

    if (instance) {
      for (const el of instance.files) {
        if (el) {
          await deleteFmService(el.toString());
        }
      }

      res.status(204).json({});
    } else {
      throw new Error('Instance not found');
    }
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
