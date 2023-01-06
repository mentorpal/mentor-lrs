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
import { formatJSONResponse } from "../../libs/api-gateway";
import { fromBasicAuthToken } from "../../libs/user";
import { middyfy } from "../../libs/lambda";
import { findLRS, user2XapiAgent } from "../../libs/xapi";

interface DefaultState {
  contextTemplate: Record<string, string>;
  launchMode: string;
  returnURL?: string;
}

export const activitiesState: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  try {
    const token = event.headers["Authorization"].split("Basic ")[1];
    const user = fromBasicAuthToken(token);

    const stateId = event.queryStringParameters["stateId"];
    if (!stateId) {
      return formatJSONResponse("missing required query param 'stateId'", 400);
    }
    const activityId = event.queryStringParameters["activityId"];
    if (!activityId) {
      return formatJSONResponse(
        "missing required query param 'activityId'",
        400
      );
    }
    const registration: string = event.queryStringParameters["registration"];
    if (!registration) {
      return formatJSONResponse(
        "missing required query param 'registration'",
        400
      );
    }

    const lrs = await findLRS();
    const state = await lrs.fetchActivityState({
      activityId,
      agent: user2XapiAgent(user),
      stateId,
      registration: registration,
    });
    const returnURL = process.env["XAPI_RETURN_URL"];
    const defaultState: DefaultState = {
      contextTemplate: {
        registration: registration,
      },
      launchMode: "Normal",
    };
    if (returnURL) {
      defaultState.returnURL = returnURL;
    }
    return formatJSONResponse(
      state
        ? {
            ...defaultState,
            ...state,
          }
        : defaultState
    );
  } catch (err) {
    return formatJSONResponse(err, 401);
  }
};

export const main = middyfy(activitiesState);
