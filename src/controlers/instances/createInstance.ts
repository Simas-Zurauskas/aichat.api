import asynchandler from 'express-async-handler';
import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { uploadFile as uploadS3 } from '@conf/s3';
import { genHashId, genUxId } from '@util/misc';
import FileMeta from '@models/FileMeta';
import { vectorStore } from '@ai/vectorStores';
import InstanceModel from '@models/Instance';
import { addJobToQueue } from '@services/jobs/queue';

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});

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

    const supportedFiles = files?.filter(
      (el) =>
        el.mimetype === 'application/pdf' ||
        el.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );

    if (!supportedFiles.length) {
      throw new Error('Unsupported file type');
    }

    const instance = await InstanceModel.create({
      userId,
      uxId: genUxId(),
      name,
      files: [],
      userSettings,
      llm,
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
