import asynchandler from 'express-async-handler';
import FileMeta from '@models/FileMeta';
import InstanceModel from '@models/Instance';
import mongoose from 'mongoose';

// ------------------------------------------------------------------
// @route GET /api/instances
// @access Private
export const getInstances = asynchandler(async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId as string;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const instances = await InstanceModel.aggregate([
      {
        // Match only documents where userId equals the provided userObjectId
        $match: { userId: userObjectId },
      },
      {
        // Lookup FileMeta documents where FileMeta._id is in Instance.files
        $lookup: {
          from: 'FileMeta',
          localField: 'files',
          foreignField: '_id',
          as: 'filesData',
        },
      },
      {
        $addFields: {
          files: {
            $map: {
              input: '$filesData',
              as: 'file',
              in: {
                _id: '$$file._id',
                key: '$$file.key',
                originalName: '$$file.originalName',
                mimetype: '$$file.mimetype',
                size: '$$file.size',
                createdAt: '$$file.createdAt',
                updatedAt: '$$file.updatedAt',
                jobStatus: '$$file.jobStatus',
                vectorCount: { $size: '$$file.vectorIds' },
              },
            },
          },
        },
      },

      {
        $project: {
          filesData: 0,
        },
      },
    ]);

    res.status(200).json({ data: instances });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
