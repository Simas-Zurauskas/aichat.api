import moment from 'moment';
import mongoose, { Document } from 'mongoose';

export interface Message {
  id?: string;
  conversationId?: string;
  role: 'user' | 'ai';
  content: string;
  feedback?: 'negative' | 'positive';
  date: Date;
}

export interface InstanceInput<T = string> {
  uxId: string;
  userId: string;
  name: string;
  userSettings: string;
  files: (T | null)[];
  chat: Message[];
  deleteAt: string;
}

export interface Instance extends InstanceInput, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const instanceSchema = new mongoose.Schema(
  {
    uxId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userSettings: { type: String },
    files: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileMeta' }], required: true },
    chat: [
      {
        role: { type: String, enum: ['user', 'ai'], required: true },
        content: { type: String, required: true },
        feedback: { type: String, enum: ['negative', 'positive'] },
        date: { type: Date, required: true },
      },
    ],
    deleteAt: { type: Date, default: moment().add(1, 'hour').toDate() },
  },
  { timestamps: true },
);

const InstanceModel = mongoose.model<Instance>('Instance', instanceSchema, 'Instance');

export default InstanceModel;
