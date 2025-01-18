import AWS from 'aws-sdk';
import { AWS_ACCESS_KEY, AWS_ACCESS_SECRET, AWS_BUCKET_NAME, AWS_BUCKET_REGION, FE_CLIENT_URL } from './env';

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_ACCESS_SECRET,
  signatureVersion: 'v4',
  region: AWS_BUCKET_REGION,
});

(async function updateCors() {
  const params = {
    Bucket: AWS_BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: [FE_CLIENT_URL],
          AllowedMethods: ['GET'],
          AllowedHeaders: ['*'],
          ExposeHeaders: [],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  };

  try {
    await s3.putBucketCors(params).promise();
    console.log('Successfully updated S3 CORS configuration!');
  } catch (err) {
    console.error('Error updating S3 CORS configuration:', err);
  }
})();

const getExt = (str: string) => {
  return str.slice(((str.lastIndexOf('.') - 1) >>> 0) + 2);
};

// ------------------------------------------------------------------

type UploadFile = (a: { buffer: Buffer; originalname: string; key: string }) => Promise<AWS.S3.ManagedUpload.SendData>;

export const uploadFile: UploadFile = async ({ buffer, originalname, key }) => {
  return new Promise(async (resolve, reject) => {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: AWS_BUCKET_NAME,
      Key: `${key}.${getExt(originalname)}`,
      Body: buffer,
    };

    await s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
      if (err) {
        console.log('S3 upload', err);
        reject();
      }

      resolve(data);
    });
  });
};

// ------------------------------------------------------------------

type GetFile = (a: string) => Promise<AWS.S3.GetObjectOutput>;

export const getFile: GetFile = async (key: string) => {
  return new Promise(async (resolve, reject) => {
    await s3.getObject({ Bucket: `${AWS_BUCKET_NAME}`, Key: key }, (err, data) => {
      if (err) {
        console.log('S3 download', err);
        reject();
      }
      resolve(data);
    });
  });
};

// ------------------------------------------------------------------

type RemoveFile = (a: string) => Promise<AWS.S3.DeleteObjectOutput>;

export const removeFile: RemoveFile = async (key: string) => {
  return new Promise(async (resolve, reject) => {
    s3.deleteObject({ Bucket: `${AWS_BUCKET_NAME}`, Key: key }, (err, data) => {
      if (err) {
        console.log('S3 remove', err);
        reject();
      }
      resolve(data);
    });
  });
};

type GeneratePresignedUrl = (params: { objectKey: string; expiresInSeconds?: number }) => Promise<string>;

export const generatePresignedUrl: GeneratePresignedUrl = async ({ objectKey, expiresInSeconds = 60 }) => {
  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: objectKey,
    Expires: expiresInSeconds,
  };

  const url = s3.getSignedUrl('getObject', params);
  return url;
};
