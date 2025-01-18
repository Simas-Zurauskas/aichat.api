import asynchandler from 'express-async-handler';
import { FileMetaInput } from '@models/FileMeta';
import InstanceModel, { InstanceInput } from '@models/Instance';
import _ from 'lodash';
// ------------------------------------------------------------------
// @route GET /api/instance/:uxId
// @access Private, Owner
export const getInstance = asynchandler(async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId as string;
    const uxId = req.params.uxId;

    const instance = (await InstanceModel.findOne({
      uxId,
      user: userId,
    })
      .populate('files')
      .lean()) as InstanceInput<FileMetaInput> | null;

    if (!instance) {
      res.status(404);
      throw new Error('Instance not found');
    }

    res.status(200).json({
      data: {
        ...instance,
        files: instance.files.map((el) => {
          return { ...el, vectorCount: el?.vectorIds.length, vectorIds: undefined };
        }),
      },
    });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
