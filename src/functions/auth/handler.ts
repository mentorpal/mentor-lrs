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

export const main = middyfy(auth);
