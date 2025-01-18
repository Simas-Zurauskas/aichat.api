export const NODE_ENV = process.env.NODE_ENV;
export const PROTOCOL = process.env.PROTOCOL || 'https';
export const PORT = process.env.PORT || 4000;
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
export const MAX_JOBS = 3;
export const JOB_INTERVAL = 1000;
export const USAGE_MAX_VECTOR_OPS = 50000;
export const FE_CLIENT_URL = process.env.FE_CLIENT_URL as string;

export const MONGO_URI = process.env.MONGO_URI as string;
export const OPENAI_KEY = process.env.OPENAI_KEY as string;

export const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
export const JWT_SECRET_AUTH = process.env.JWT_SECRET_AUTH as string;

export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY as string;
export const AWS_ACCESS_SECRET = process.env.AWS_ACCESS_SECRET as string;
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME as string;
export const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION as string;
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY as string;
export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME as string;
