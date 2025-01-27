import InstanceModel from '@models/Instance';
import asynchandler from 'express-async-handler';

// ------------------------------------------------------------------
// @route GET /api/instances/:uxId/chat
// @access Private, Owner
export const getChat = asynchandler(async (req, res) => {
  try {
    const { uxId } = req.params;

    const instance = await InstanceModel.findOne({ uxId });

    if (!instance) {
      res.status(404);
      throw new Error('Node not found');
    }

    res.json({ data: instance.chat });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
