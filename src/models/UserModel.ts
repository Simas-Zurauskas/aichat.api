import { USAGE_MAX_VECTOR_OPS } from '@conf/env';
import moment from 'moment';
import mongoose, { Document } from 'mongoose';
import { Schema } from 'mongoose';

export interface UserInput {
  email: string;
  authSecret: string;
  usage: {
    cycleReset: string;
    vectorOpsLimit: number;
    vectorOps: number;
  };
}

export interface User extends UserInput, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const schema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    authSecret: { type: String, required: true },
    usage: {
      cycleReset: { type: Date, default: moment().add(1, 'month').toISOString() },
      vectorOpsLimit: { type: Number, default: USAGE_MAX_VECTOR_OPS },
      vectorOps: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model<User>('User', schema, 'User');

export { schema as userSchema };

export default UserModel;
