import InstanceModel from '@models/Instance';
import asynchandler from 'express-async-handler';

// ------------------------------------------------------------------
// @route PUT /api/instances/:uxId/chat/feedback/:messageId
// @access Private, Owner
export const leaveFeedback = asynchandler(async (req, res) => {
  try {
    const { uxId, messageId } = req.params;
    const { feedback } = req.body;

    const updatedInstance = await InstanceModel.findOneAndUpdate(
      { uxId, 'chat._id': messageId },
      { $set: { 'chat.$.feedback': feedback } },
    ).lean();

    if (!updatedInstance) {
      res.status(404);
      throw new Error('Instance or message not found');
    }

    res.json({ data: 'ok' });
  } catch (error: any) {
    res.status(500).json(error);
  }
});
