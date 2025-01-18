import mongoose from 'mongoose';
import colors from 'colors';
import { MONGO_URI } from './env';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    mongoose.set('strictPopulate', false);
    const conn = await mongoose.connect(MONGO_URI);
    console.log(colors.cyan(`MongoDB Connected - ${conn.connection.host}`.bgCyan));
  } catch (error: any) {
    console.log(colors.red(`MongoDB Connection failed - ${error.message}`));
    process.exit(1);
  }
};

export default connectDB;
