import asynchandler from 'express-async-handler';
import { genUxId } from '@util/misc';
import FileMeta from '@models/FileMeta';
import InstanceModel from '@models/Instance';
import { addJobToQueue } from '@services/jobs/queue';

// ------------------------------------------------------------------
// @route POST /api/instances
// @access Private
export const createInstance = asynchandler(async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId as string;
    const files = req.files as Express.Multer.File[];
    const name = req.body.name;
    const context = req.body.context;
    const userSettings = req.body.userSettings;
    const llm = req.body.llm;
    const temperature = Number(req.body.temperature);

    const supportedFiles = files?.filter(
      (el) =>
        el.mimetype === 'application/pdf' ||
        el.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );

    if (!supportedFiles.length) {
      res.status(400);
      throw new Error('Unsupported file type');
    }

    if (temperature < 0 || temperature > 1) {
      res.status(400);
      throw new Error('Temperature must be between 0 and 1');
    }

    const totalInstances = await InstanceModel.countDocuments({ userId });

    if (totalInstances >= 6) {
      res.status(400);
      throw new Error('Max instances reached');
    }

    const instance = await InstanceModel.create({
      userId,
      uxId: genUxId(),
      name,
      files: [],
      userSettings,
      llm,
      temperature,
    });

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

    res.json({ data: instance });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
