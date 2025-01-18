import axios from 'axios';
import asynchandler from 'express-async-handler';
import qs from 'qs';
import {
  FE_CLIENT_URL,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
} from '@conf/env';
import { generateAuthToken } from '@util/auth';
import UserModel from '@models/UserModel';
import { GoogleUserProfile } from 'src/types';

type GetTokens = (a: { code: string; clientId: string; clientSecret: string; redirectUri: string }) => Promise<{
  access_token: string;
  expires_in: Number;
  refresh_token: string;
  scope: string;
  id_token: string;
}>;

export const getGoogleTokens: GetTokens = async ({ code, clientId, clientSecret, redirectUri }) => {
  const url = GOOGLE_TOKEN_URL;
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  };

  return axios
    .post(url, qs.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((res) => res.data);
};

// ------------------------------------------------------------------
// @route GET /api/auth/google/callback
// @access Public
export const googleCallback = asynchandler(async (req, res) => {
  try {
    // const baseUrl = process.env.NODE_ENV === 'production' ? 'https' : 'http' + '://' + req.get('host');
    const baseUrl = 'https' + '://' + req.get('host');
    const code = req.query.code;

    console.log('REDIRECT_URI>googleCallback', `${baseUrl}/api/auth/google/callback`);

    const tokens = await getGoogleTokens({
      code: code as string,
      clientId: GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: `${baseUrl}/api/auth/google/callback`,
    });

    const googleUserProfile = await axios
      .get(GOOGLE_USERINFO_URL, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      })
      .then((res) => res.data as GoogleUserProfile);

    const existingUser = await UserModel.findOne({
      email: { $regex: new RegExp(`^${googleUserProfile.email}$`, 'i') },
    }).lean();

    if (existingUser) {
      const token = generateAuthToken(existingUser._id, existingUser.authSecret);
      res.redirect(`${FE_CLIENT_URL}/auth?token=${token}`);
    } else {
      const authSecret = crypto.randomUUID();

      const user = await UserModel.create({
        email: googleUserProfile.email.toLowerCase(),
        authSecret,
      });

      const token = generateAuthToken(user._id, user.authSecret);
      res.redirect(`${FE_CLIENT_URL}/auth?token=${token}`);
    }
  } catch (error: any) {
    console.log('ERROR', error);
    res.redirect(`${FE_CLIENT_URL}/auth?error=${'Something went wrong'}`);
  }
});
