/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import * as crypto from "./utils/crypto";

export interface User {
  id: string;
  name: string;
}

export interface UserAccessToken extends User {
  expiresAt: string;
}

export function toBasicAuthToken(token: UserAccessToken): string {
  return Buffer.from(`${token.id}:${crypto.encrypt(token)}`).toString("base64");
}

export function fromBasicAuthToken(token: string): UserAccessToken {
  return decrypt(Buffer.from(token, "base64").toString("ascii").split(":")[1]);
}

export function decrypt(token: string): UserAccessToken {
  return crypto.decryptJson(token) as UserAccessToken;
}
