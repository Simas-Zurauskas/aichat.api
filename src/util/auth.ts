import jwt from 'jsonwebtoken';

export type UserTokenPayload = {
  id: string;
  authSecret: string;
  iat: number;
  exp: number;
};

export const generateAuthToken = (id: string, authSecret: string) => {
  return jwt.sign({ id, authSecret }, process.env.JWT_SECRET_AUTH as string, {
    expiresIn: '7d',
  });
};

export const decodeAuthToken = (token: string) => {
  if (!token) {
    return undefined;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_AUTH as string) as UserTokenPayload;

    return decoded;
  } catch (error) {
    return undefined;
  }
};
