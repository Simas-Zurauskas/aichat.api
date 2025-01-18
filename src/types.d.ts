export interface GoogleUserProfile {
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type JobDef =
  | {
      type: 'processAndStoreFile';
      payload: { userId: string; instanceId: string; fileId: string; file: Express.Multer.File };
    }
  | {
      type: 'updateFile';
      payload: { userId: string; fileId: string; instanceId: string };
    };

export type JobDefPayload<T extends JobDef['type']> = Extract<JobDef, { type: T }>['payload'];

export interface Job {
  id: string;
  initDate: Date;
  startedDate?: Date;
  status: JobStatus;
  def: JobDef;
}
