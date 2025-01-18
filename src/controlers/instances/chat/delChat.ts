import InstanceModel from '@models/Instance';
import asynchandler from 'express-async-handler';

// ------------------------------------------------------------------
// @route DELETE /api/instances/:uxId/chat
// @access Private, Owner
export const delChat = asynchandler(async (req, res) => {
  try {
    const { uxId } = req.params;

    const instance = await InstanceModel.findOneAndUpdate({ uxId }, { chat: [] });

    if (!instance) {
      res.status(404);
      throw new Error('Instance not found');
    }

    res.json({ data: instance.chat });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
