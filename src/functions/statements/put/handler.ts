import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { formatJSONResponse } from "../../../libs/api-gateway";
import { fromBasicAuthToken } from "../../../libs/user";
import { middyfy } from "../../../libs/lambda";
import { saveStatements } from "../../../libs/xapi/controller";

export const statementsPut: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  try {
    const token = event.headers["Authorization"].split("Basic ")[1];
    const user = fromBasicAuthToken(token);
    const s =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    s.id = s.id || event.queryStringParameters["statementId"];
    if (!s.id) {
      return formatJSONResponse(
        "PUT /statements requires parameter statementId",
        400
      );
    }
    const ids = await saveStatements(user, [s]);
    return formatJSONResponse(ids, 204);
  } catch (err) {
    return formatJSONResponse(err, 401);
  }
};

export const main = middyfy(statementsPut);
