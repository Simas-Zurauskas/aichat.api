import FileMeta from '@models/FileMeta';
import { addJobToQueue } from '@services/jobs/queue';
import asynchandler from 'express-async-handler';

// ------------------------------------------------------------------
// @route PUT /api/instances/:uxId/file/:fileId
// @access Private, Owner
export const updateFile = asynchandler(async (req, res) => {
  // @ts-ignore
  const userId = req.userId as string;
  try {
    const { fileId } = req.params;
    const context = req.body.context;

    const fm = await FileMeta.findOneAndUpdate(
      { _id: fileId },
      {
        context,
        jobStatus: 'pending',
      },
    );

    if (!fm) {
      throw new Error('File not found');
    }

    addJobToQueue({
      type: 'updateFile',
      payload: {
        userId,
        fileId,
        instanceId: fm._id.toString(),
      },
    });

    res.json({ data: null });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
