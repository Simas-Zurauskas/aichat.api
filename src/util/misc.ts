import crypto from 'crypto';

export const genUxId = (length = 6) => {
  if (length <= 0) {
    throw new Error('Length must be a positive integer');
  }

  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let uxid = '';

  while (uxid.length < length) {
    const bytes = crypto.randomBytes(length);
    const base64String = bytes.toString('base64');

    for (let i = 0; i < base64String.length && uxid.length < length; i++) {
      const char = base64String[i];
      if (charset.includes(char)) {
        uxid += char;
      }
    }
  }

  return uxid;
};

export const genHashId = (params: { text: string; instanceId: string }): string => {
  return crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex');
};
