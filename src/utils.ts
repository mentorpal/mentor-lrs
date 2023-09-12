/* eslint-disable  @typescript-eslint/no-explicit-any */

import * as Sentry from "@sentry/serverless";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
  Context,
  Handler,
} from "aws-lambda";
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL_GRAPHQL || "debug",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(
      process.env.NODE_ENV?.includes("dev")
        ? { format: winston.format.simple() }
        : undefined
    ),
  ],
});

export function loadSentry() {
  if (process.env.IS_SENTRY_ENABLED === "true") {
    logger.info(`sentry enabled, calling init on ${process.env.NODE_ENV}`);
    Sentry.AWSLambda.init({
      dsn: process.env.SENTRY_DSN_MENTOR_LRS,
      environment: process.env.NODE_ENV,
      // configure sample of errors to send for performance monitoring (1.0 for 100%)
      // @see https://docs.sentry.io/platforms/javascript/configuration/sampling/
      ...(process.env.STAGE == "prod" && { tracesSampleRate: 0.25 }),
      ...(process.env.SENTRY_DEBUG && { debug: true }),
      sendClientReports: false,
    });
  }
}

export function wrapHandlerWithSentry(
  handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>
) {
  return process.env.IS_SENTRY_ENABLED === "true"
    ? Sentry.AWSLambda.wrapHandler(handler)
    : handler;
}

export function wrapHandlerTestRequest(
  request?: Partial<APIGatewayProxyEvent>,
  context?: Partial<Context>,
  callback?: Callback<APIGatewayProxyResult>
) {
  return {
    event: (request as any) || ({} as any),
    context: (context as any) || ({} as any),
    callback: () =>
      callback ||
      (() => {
        return;
      }),
  };
}
