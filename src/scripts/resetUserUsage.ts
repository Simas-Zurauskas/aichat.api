import UserModel from '@models/UserModel';
import moment from 'moment';

export const resetUserUsage = async () => {
  const targetDate = moment().toDate();

  const users = await UserModel.find({
    'usage.cycleReset': { $lte: targetDate },
  });

  users.forEach(async (el) => {
    console.log('resetUserUsage'.yellow.bold, el);

    el.usage.vectorOps = 0;
    el.usage.cycleReset = moment().add(1, 'hour').toDate();
    await el.save();
  });
};
