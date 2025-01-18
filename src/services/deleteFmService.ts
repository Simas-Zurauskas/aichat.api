import { vectorStore } from '@ai/vectorStores';
import { removeFile } from '@conf/s3';
import FileMeta from '@models/FileMeta';
import InstanceModel from '@models/Instance';

export const deleteFmService = async (id: string, onError?: (error: Error) => void) => {
  try {
    const fileMeta = await FileMeta.findByIdAndDelete(id).catch(() => {});

    if (!fileMeta) {
      throw new Error('FileMeta not found');
    }

    InstanceModel.findOneAndUpdate({ files: fileMeta._id }, { $pull: { files: fileMeta._id } }).catch(() => {});

    if (fileMeta.key) {
      removeFile(fileMeta.key).catch(() => {});
    }

    // TODO
    // find duplicated vectorIds per instance scope in mongo
    // if found, dont delete that embedings

    vectorStore
      .delete({
        ids: fileMeta.vectorIds,
      })
      .catch(() => {});
  } catch (error) {
    onError && onError(error as Error);
  }
};
