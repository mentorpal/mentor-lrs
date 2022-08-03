import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { formatJSONResponse } from '../../../libs/api-gateway';
import { findLRS, user2XapiAgent } from "../../../libs/xapi";
import {UserAccessToken, decrypt} from "../../../libs/user";
import { middyfy } from '../../../libs/lambda';

export const statementsGet: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event) => {
    try {
        const token = event.headers["Authorization"].split("Basic ")[1];
        const user: UserAccessToken = decrypt(token);
        const lrs = await findLRS();
        const statementResult = await lrs.fetchStatements({
        agent: user2XapiAgent(user),
        verb: event.queryStringParameters['verb'],
        activity: event.queryStringParameters['activity'],
        registration: event.queryStringParameters['registration'],
        // eslint-disable-next-line @typescript-eslint/camelcase
        related_agents: event.queryStringParameters['related_agents'],
        since: event.queryStringParameters['since'],
        until: event.queryStringParameters['until'],
        limit: event.queryStringParameters['limit'],
        format: event.queryStringParameters['format'],
        ascending: event.queryStringParameters['ascending'],
        });
        return formatJSONResponse(statementResult);
    } catch (err) {
        return formatJSONResponse(err, 500);
    }
}

export const main = middyfy(statementsGet)