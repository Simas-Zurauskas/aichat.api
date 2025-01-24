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

export enum LLM {
  GPT4O = 'gpt-4o',
  GEMINI15PRO = 'gemini-1.5-pro',
  R1 = 'deepSeekR1',
  V3 = 'deepSeekV3',
}

export interface InstanceInput<T = string> {
  uxId: string;
  userId: string;
  name: string;
  userSettings: string;
  files: (T | null)[];
  chat: Message[];
  llm: LLM;
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
    llm: { type: String, enum: [LLM.GPT4O, LLM.GEMINI15PRO, LLM.R1, LLM.V3], required: true, default: LLM.GPT4O },
    deleteAt: { type: Date, default: moment().add(1, 'month').toISOString() },
  },
  { timestamps: true },
);

const InstanceModel = mongoose.model<Instance>('Instance', instanceSchema, 'Instance');

export default InstanceModel;
