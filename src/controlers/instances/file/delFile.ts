import { deleteFmService } from '@services/deleteFmService';
import asynchandler from 'express-async-handler';

// ------------------------------------------------------------------
// @route GET /api/instances/:uxId/file/:fileId
// @access Private, Owner
export const delFile = asynchandler(async (req, res) => {
  try {
    const { fileId } = req.params;

    deleteFmService(fileId);

    res.json({ data: null });
  } catch (error: any) {
    console.log('ERROR', error);
    res.status(500).json(error);
  }
});
