import { bufferToDocs } from '@ai/util';
import { vectorStore } from '@ai/vectorStores';
import { USAGE_MAX_VECTOR_OPS } from '@conf/env';
import { removeFile, uploadFile } from '@conf/s3';
import FileMeta from '@models/FileMeta';
import UserModel, { User } from '@models/UserModel';
import { genHashId, genUxId } from '@util/misc';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { JobDefPayload } from 'src/types';

type ProcessAndStoreFile = (payload: JobDefPayload<'processAndStoreFile'>) => Promise<any>;
export const processAndStoreFile: ProcessAndStoreFile = async ({ userId, file, fileId, instanceId }): Promise<any> => {
  const fm = await FileMeta.findById(fileId);
  if (!fm) {
    throw new Error('FileMeta not found');
  }

  fm.jobStatus = 'processing';
  await fm.save();
  console.log('pasf > 1'.bgMagenta);

  let vectorIds: string[] = [];
  let uploadedFile: ManagedUpload.SendData | undefined = undefined;

  try {
    const user = (await UserModel.findById(userId).lean()) as User;

    const docs = await bufferToDocs({
      buffer: file.buffer,
      mimetype: file.mimetype,
    });

    if (user.usage.vectorOps + docs.length > USAGE_MAX_VECTOR_OPS) {
      throw new Error('User vectorOps limit exceeded');
    }

    console.log('pasf > 2'.bgMagenta);

    const context = fm.context ? `${fm.context}: ` : '';

    const rdyDocs = docs.map((el) => {
      return {
        ...el,
        pageContent: `${context}${el.pageContent} (${fm.originalName})`,
        metadata: { loc: el.metadata.loc, instanceId },
      };
    });
    console.log('pasf > 5'.bgMagenta);

    vectorIds = rdyDocs.map((el) => genHashId({ text: el.pageContent, instanceId }));

    await vectorStore.addDocuments(rdyDocs, {
      ids: vectorIds,
    });
    console.log('pasf > 6'.bgMagenta);

    await UserModel.findByIdAndUpdate(userId, { $inc: { 'usage.vectorOps': vectorIds.length } }).catch(() => {});

    fm.vectorIds = vectorIds;

    uploadedFile = await uploadFile({
      buffer: file.buffer,
      key: `${instanceId}/${genUxId()}`,
      originalname: file.originalname,
    });
    console.log('pasf > 7'.bgMagenta);

    if (uploadedFile) {
      fm.key = uploadedFile.Key;
      fm.location = uploadedFile.Location;
    }

    fm.jobStatus = 'completed';
    await fm.save();
  } catch (error) {
    if (!!vectorIds.length) {
      await vectorStore.delete({
        ids: vectorIds,
      });
    }
    fm.vectorIds = [];

    if (fm.key) {
      await removeFile(fm.key);
      fm.key = undefined;
      fm.location = undefined;
    }

    fm.jobStatus = 'failed';
    await fm.save();
    throw error;
  }
};
