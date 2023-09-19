/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { BadRequest, MethodNotAllowed } from "http-errors";
import datestr from "@libs/utils/datestr";
import { toBasicAuthToken } from "@libs/user";
import { loadSentry, wrapHandlerWithSentry } from "../../utils";
loadSentry();
export const auth: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  /**
   * NOTE: we are NOT using Basic auth in a standard way.
   * The norm for HTTP Basic would be a token in format base64(username:password)
   * Here, we're expecting tokens in format base64(userid:accesstoken)
   */

  if (event.httpMethod !== "POST") {
    return formatJSONResponse(
      new MethodNotAllowed("only POST accepted for this endpoint"),
      405
    );
  }
  const username = event.queryStringParameters["username"] as string;
  if (!username) {
    return formatJSONResponse(
      new BadRequest("missing required query param 'username'"),
      400
    );
  }
  const userid = event.queryStringParameters["userid"] as string;
  if (!userid) {
    return formatJSONResponse(
      new BadRequest("missing required query param 'userid'"),
      400
    );
  }
  return formatJSONResponse({
    "auth-token": toBasicAuthToken({
      name: username,
      id: userid,
      expiresAt: datestr(new Date(Date.now() + 60 * 60 * 24)),
    }),
  });
};

export const main = middyfy(wrapHandlerWithSentry(auth));
