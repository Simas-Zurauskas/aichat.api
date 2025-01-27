import asynchandler from 'express-async-handler';
import { FileMetaInput } from '@models/FileMeta';
import InstanceModel, { InstanceInput } from '@models/Instance';
import _ from 'lodash';
import moment from 'moment';
// ------------------------------------------------------------------
// @route PUT /api/instance/:uxId/extend
// @access Private, Owner
export const extendAccess = asynchandler(async (req, res) => {
  try {
    const uxId = req.params.uxId;

    const instance = await InstanceModel.findOneAndUpdate(
      {
        uxId,
      },
      {
        deleteAt: moment().add(30, 'day').endOf('day').add(1, 'second').startOf('day').toISOString(),
      },
    ).lean();

    if (!instance) {
      res.status(404);
      throw new Error('Node not found');
    }

    res.status(200).json({
      data: null,
    });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
