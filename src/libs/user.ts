import * as crypto from './utils/crypto';

export interface User {
  id: string;
  name: string;
}

export interface UserAccessToken extends User {
  expiresAt: string;
}

export function toBasicAuthToken(token: UserAccessToken): string {
  return Buffer.from(`${token.id}:${crypto.encrypt(token)}`).toString('base64');
}

export function fromBasicAuthToken(token: string): UserAccessToken {
  return decrypt(
    Buffer.from(token, 'base64')
      .toString('ascii')
      .split(':')[1]
  );
}

export function decrypt(token: string): UserAccessToken {
  return crypto.decryptJson(token) as UserAccessToken;
}
