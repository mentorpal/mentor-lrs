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
import { loadSentry, wrapHandlerWithSentry } from "../../utils";
import XAPI from "@xapi/xapi";
import requireEnv from "../../libs/utils/require-env";
import {
  AnswerPlaybackData,
  AnswerPlaybackStartedStatement,
  answerPlaybackStartedVerb,
  sessionIdExtensionKey,
} from "./types";
import { RecommenderDataProcessor } from "./recommender-data-processor";
import {
  buildAnswerFieldMatrix,
  getTopNFields,
  isAnswerPlaybackStartedStatement,
} from "./helpers";

export const CONFIDENCE_THRESHOLD = 0.5;
loadSentry();

let _lrsInstance: XAPI | null = null;

function getLRSInstance(): XAPI {
  if (!_lrsInstance) {
    _lrsInstance = new XAPI({
      endpoint: requireEnv("LRS_ENDPOINT"),
      auth: XAPI.toBasicAuth(
        requireEnv("LRS_USERNAME"),
        requireEnv("LRS_PASSWORD")
      ),
    });
  }
  return _lrsInstance;
}

const recommender: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  const xapi = getLRSInstance();
  const name = event.queryStringParameters["name"];
  const sessionId = event.queryStringParameters["sessionId"];
  const timestampStart = event.queryStringParameters["timestampStart"];
  const timestampEndOptional = event.queryStringParameters["timestampEnd"];
  const numResults = parseInt(event.queryStringParameters["numResults"] ?? "5");
  const res = await xapi.getStatements({
    agent: {
      objectType: "Agent",
      name: name,
      mbox: "mailto:" + name,
    },
    since: timestampStart,
    until: timestampEndOptional ?? undefined,
  });

  const confidentAnswerPlaybackStatements: AnswerPlaybackStartedStatement[] = (
    res.data.statements as any
  )
    .filter((statement: any) => isAnswerPlaybackStartedStatement(statement))
    .filter(
      (a: AnswerPlaybackStartedStatement) =>
        a.result.extensions[answerPlaybackStartedVerb].answerConfidence >
        CONFIDENCE_THRESHOLD
    )
    .filter(
      (a: AnswerPlaybackStartedStatement) =>
        a.context.extensions[sessionIdExtensionKey] === sessionId
    );

  const recommenderData = RecommenderDataProcessor.getInstance();

  const answerPlaybackData: AnswerPlaybackData[] =
    confidentAnswerPlaybackStatements.map((a) => {
      const answerData = a.result.extensions[answerPlaybackStartedVerb];
      const questionId = answerData.answerQuestionId || recommenderData.getQuestionIdByAnswerId(
        answerData.answerId
      );
      const questionSubfieldTopicData = questionId
        ? recommenderData.getQuestionById(questionId)
        : undefined;
      const mentorsData = answerData.mentorCur
        ? recommenderData.getMentorById(answerData.mentorCur)
        : undefined;
      const subfields = Array.from(
        new Set([
          ...(mentorsData ? mentorsData.subfields : []),
          ...(mentorsData ? [mentorsData.degree] : []),
          ...(questionSubfieldTopicData
            ? questionSubfieldTopicData.subfields
            : []),
          ...(questionSubfieldTopicData
            ? [questionSubfieldTopicData.degree]
            : []),
        ])
      );
      const topics = Array.from(
        new Set([
          ...(questionSubfieldTopicData
            ? questionSubfieldTopicData.topicNames
            : []),
        ])
      );
      return {
        mentorId: answerData.mentorCur,
        questionId: questionId ?? "",
        answerId: answerData.answerId,
        subfields,
        topics,
        startTimestamp: answerData.timestampAnswered,
        duration: answerData.answerDuration,
        confidence: answerData.answerConfidence,
      };
    });

  // Build the matrix from answer playback data
  const { matrix, fieldNames } = buildAnswerFieldMatrix(answerPlaybackData);
  console.log(
    "\n📊 Matrix dimensions:",
    matrix.length,
    "answers x",
    fieldNames.length,
    "fields"
  );

  // Get top-N fields
  const topNResults = getTopNFields(matrix, fieldNames, numResults);
  console.log("\n🏆 Top", numResults, "Fields:");
  console.log(JSON.stringify(topNResults, null, 2));

  return formatJSONResponse(topNResults);
};

export const main = middyfy(wrapHandlerWithSentry(recommender));
