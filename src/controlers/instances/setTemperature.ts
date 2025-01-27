import asynchandler from 'express-async-handler';
import InstanceModel from '@models/Instance';
import _ from 'lodash';
// ------------------------------------------------------------------
// @route PUT /api/instance/:uxId/temperature
// @access Private, Owner
export const setTemperature = asynchandler(async (req, res) => {
  try {
    const uxId = req.params.uxId;
    const temperature = Number(req.body.temperature);

    if (temperature < 0 || temperature > 1) {
      res.status(400);
      throw new Error('Temperature must be between 0 and 1');
    }

    const instance = await InstanceModel.findOneAndUpdate(
      {
        uxId,
      },
      {
        temperature,
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
