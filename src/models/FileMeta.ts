import mongoose, { Document } from 'mongoose';
import { JobStatus } from 'src/types';

export interface FileMetaInput {
  _id: string;
  userId?: string;
  instanceId?: string;
  key?: string;
  location?: string;
  context?: string;
  originalName: string;
  mimetype: string;
  size: number;
  vectorIds: string[];
  jobStatus: JobStatus;
}

export interface FileMeta extends FileMetaInput, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const fileMetaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instance', required: true },
    key: { type: String },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    location: { type: String },
    context: { type: String },
    size: { type: Number },
    vectorIds: { type: [String], required: true },
    jobStatus: { type: String, required: true, default: 'pending' },
  },
  { timestamps: true },
);

const FileMeta = mongoose.model<FileMeta>('FileMeta', fileMetaSchema, 'FileMeta');

export default FileMeta;
