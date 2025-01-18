import { bufferToDocs } from '@ai/util';
import { vectorStore } from '@ai/vectorStores';
import { USAGE_MAX_VECTOR_OPS } from '@conf/env';
import { getFile } from '@conf/s3';
import FileMeta from '@models/FileMeta';
import UserModel, { User } from '@models/UserModel';
import { genHashId } from '@util/misc';
import { JobDefPayload } from 'src/types';

type UpdateFile = (payload: JobDefPayload<'updateFile'>) => Promise<any>;

export const updateFileTask: UpdateFile = async ({ userId, fileId, instanceId }): Promise<any> => {
  const fm = await FileMeta.findById(fileId);
  if (!fm?.key) {
    throw new Error('FileMeta not found');
  }

  fm.jobStatus = 'processing';
  await fm.save();
  console.log('pasf > 1'.bgMagenta);

  let vectorIds: string[] = [];

  try {
    const user = (await UserModel.findById(userId).lean()) as User;
    const file = await getFile(fm.key);

    if (!file) {
      throw new Error('File not found');
    }

    const docs = await bufferToDocs({
      buffer: file.Body as Buffer,
      mimetype: fm.mimetype,
    });

    if (user.usage.vectorOps + docs.length > USAGE_MAX_VECTOR_OPS) {
      throw new Error('User vectorOps limit exceeded');
    }

    console.log('pasf > 2'.bgMagenta);

    const ctxText = fm.context ? `${fm.context}: ` : '';

    const rdyDocs = docs.map((el) => {
      return {
        ...el,
        pageContent: `${ctxText}${el.pageContent} (${fm.originalName})`,
        metadata: { loc: el.metadata.loc, instanceId },
      };
    });

    vectorIds = rdyDocs.map((el) => genHashId({ text: el.pageContent, instanceId }));

    await vectorStore.delete({
      ids: fm.vectorIds,
    });
    console.log('pasf > 3'.bgMagenta);

    await vectorStore.addDocuments(rdyDocs, {
      ids: vectorIds,
    });

    await UserModel.findByIdAndUpdate(userId, { $inc: { 'usage.vectorOps': vectorIds.length } }).catch(() => {});
    console.log('pasf > 4'.bgMagenta);

    fm.vectorIds = vectorIds;
    fm.jobStatus = 'completed';
    await fm.save();
  } catch (error) {
    if (!!vectorIds.length) {
      await vectorStore.delete({
        ids: vectorIds,
      });
    }

    fm.vectorIds = [];

    fm.jobStatus = 'failed';
    await fm.save();
    throw error;
  }
};
