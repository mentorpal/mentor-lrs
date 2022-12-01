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
import { formatJSONResponse } from "../../../libs/api-gateway";
import { findLRS, user2XapiAgent } from "../../../libs/xapi";
import { fromBasicAuthToken } from "../../../libs/user";
import { middyfy } from "../../../libs/lambda";

export const statementsGet: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  try {
    const token = event.headers["Authorization"].split("Basic ")[1];
    const user = fromBasicAuthToken(token);
    const lrs = await findLRS();
    const statementResult = await lrs.fetchStatements({
      agent: user2XapiAgent(user),
      verb: event.queryStringParameters["verb"],
      activity: event.queryStringParameters["activity"],
      registration: event.queryStringParameters["registration"],
      related_agents: event.queryStringParameters["related_agents"],
      since: event.queryStringParameters["since"],
      until: event.queryStringParameters["until"],
      limit: event.queryStringParameters["limit"],
      format: event.queryStringParameters["format"],
      ascending: event.queryStringParameters["ascending"],
    });
    return formatJSONResponse(statementResult);
  } catch (err) {
    return formatJSONResponse(err, 401);
  }
};

export const main = middyfy(statementsGet);
