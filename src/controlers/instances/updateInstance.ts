import asynchandler from 'express-async-handler';
import { FileMetaInput } from '@models/FileMeta';
import InstanceModel, { InstanceInput } from '@models/Instance';
import _ from 'lodash';
// ------------------------------------------------------------------
// @route PUT /api/instance/:uxId
// @access Private, Owner
export const updateInstance = asynchandler(async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId as string;
    const uxId = req.params.uxId;
    const userSettings = req.body.userSettings as string;

    if (!userSettings) {
      res.status(400);
      throw new Error('Bad request');
    }

    const instance = await InstanceModel.findOneAndUpdate(
      {
        uxId,
        user: userId,
      },
      { userSettings },
    );

    if (!instance) {
      res.status(404);
      throw new Error('Instance not found');
    }

    res.status(200).json({
      data: 'ok',
    });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
