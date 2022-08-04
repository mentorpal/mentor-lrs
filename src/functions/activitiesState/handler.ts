import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { formatJSONResponse } from "../../libs/api-gateway";
import { fromBasicAuthToken } from "../../libs/user";
import { middyfy } from "../../libs/lambda";
import { findLRS, user2XapiAgent } from "../../libs/xapi";

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
    const registration = event.queryStringParameters["registration"];
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
    const defaultState: any = {
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
