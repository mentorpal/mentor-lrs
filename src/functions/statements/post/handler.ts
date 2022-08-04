import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { formatJSONResponse } from "../../../libs/api-gateway";
import { fromBasicAuthToken } from "../../../libs/user";
import { middyfy } from "../../../libs/lambda";
import { saveStatements } from "../../../libs/xapi/controller";

export const statementsPost: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  try {
    const token = event.headers["Authorization"].split("Basic ")[1];
    const user = fromBasicAuthToken(token);
    const payload =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const ids = await saveStatements(
      user,
      Array.isArray(payload) ? payload : [payload]
    );
    return formatJSONResponse(ids, 200);
  } catch (err) {
    return formatJSONResponse(err, 401);
  }
};

export const main = middyfy(statementsPost);
