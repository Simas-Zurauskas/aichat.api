import asynchandler from 'express-async-handler';
import { FileMetaInput } from '@models/FileMeta';
import InstanceModel, { InstanceInput } from '@models/Instance';
import _ from 'lodash';
// ------------------------------------------------------------------
// @route PUT /api/instance/:uxId/llm
// @access Private, Owner
export const setLLM = asynchandler(async (req, res) => {
  try {
    const uxId = req.params.uxId;
    const llm = req.body.llm;
    console.log('llm', llm);

    const instance = await InstanceModel.findOneAndUpdate(
      {
        uxId,
      },
      {
        llm,
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
