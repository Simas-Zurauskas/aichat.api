import InstanceModel from '@models/Instance';
import { deleteFmService } from '@services/deleteFmService';
import moment from 'moment';

export const crearInstances = async () => {
  const targetDate = moment().toISOString();

  const instances = await InstanceModel.find({
    deleteAt: { $lte: targetDate },
  });

  instances.forEach(async (el) => {
    console.log('crearInstances'.yellow.bold, el);

    for (const file of el.files) {
      if (file) {
        await deleteFmService(file);
      }
    }

    await InstanceModel.findByIdAndDelete(el._id);
  });
};
