import UserModel from '@models/UserModel';
import moment from 'moment';

export const resetUserUsage = async () => {
  const targetDate = moment().toISOString();

  const users = await UserModel.find({
    'usage.cycleReset': { $lte: targetDate },
  });

  users.forEach(async (el) => {
    console.log('resetUserUsage'.yellow.bold, el);

    el.usage.vectorOps = 0;
    el.usage.cycleReset = moment().add(1, 'month').endOf('day').add(1, 'second').startOf('day').toISOString();
    await el.save();
  });
};
