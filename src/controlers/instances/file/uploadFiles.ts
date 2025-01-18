import FileMeta from '@models/FileMeta';
import InstanceModel from '@models/Instance';
import { addJobToQueue } from '@services/jobs/queue';
import asynchandler from 'express-async-handler';

// ------------------------------------------------------------------
// @route POST /api/instances/:uxId/file
// @access Private, Owner
export const uploadFiles = asynchandler(async (req, res) => {
  try {
    //  @ts-ignore
    const userId = req.userId as string;
    const files = req.files as Express.Multer.File[];
    const context = req.body.context;

    const supportedFiles = files?.filter(
      (el) =>
        el.mimetype === 'application/pdf' ||
        el.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );

    if (!supportedFiles.length) {
      res.status(400);
      throw new Error('Unsupported file type');
    }

    const instance = await InstanceModel.findOne({ uxId: req.params.uxId });

    if (!instance) {
      throw new Error('Instance not found');
    }

    for (const el of supportedFiles) {
      const fm = await FileMeta.create({
        userId,
        instanceId: instance._id,
        originalName: el.originalname,
        mimetype: el.mimetype,
        size: el.size,
        vectorIds: [],
        context,
      });

      instance.files.push(fm._id);

      addJobToQueue({
        type: 'processAndStoreFile',
        payload: {
          userId,
          instanceId: instance._id.toString(),
          fileId: fm._id,
          file: el,
        },
      });
    }

    await instance.save();

    res.json({ data: null });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
