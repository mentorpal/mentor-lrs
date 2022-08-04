import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

const hello: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
  event
) => {
  return formatJSONResponse({
    message: `Hello Serverless World!`,
    event,
  });
};

export const main = middyfy(hello);
