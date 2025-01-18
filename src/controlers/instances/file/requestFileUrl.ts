import { generatePresignedUrl } from '@conf/s3';
import FileMeta from '@models/FileMeta';
import asynchandler from 'express-async-handler';

// ------------------------------------------------------------------
// @route GET /api/instances/:uxId/file/:fileId/request-url
// @access Private, Owner
export const requestFileUrl = asynchandler(async (req, res) => {
  try {
    const fm = await FileMeta.findById(req.params.fileId);

    if (!fm?.key) {
      res.status(400);
      throw new Error('Not allowed');
    }

    const url = await generatePresignedUrl({
      objectKey: fm.key,
    });

    res.json({ data: { url, mimetype: fm.mimetype } });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
