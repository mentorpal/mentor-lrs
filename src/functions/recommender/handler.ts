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
import { AnswerPlaybackStartedStatement, isAnswerPlaybackStartedStatement } from "./types";
import { RecommenderDataProcessor } from "./recommender-data-processor";

export const CONFIDENCE_THRESHOLD = 0.5;
  loadSentry();

  const recommender: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    event
  ) => {
    const lrsEndpoint = requireEnv("LRS_ENDPOINT");
    const lrsUsername = requireEnv("LRS_USERNAME");
    const lrsPassword = requireEnv("LRS_PASSWORD");
    const auth = XAPI.toBasicAuth(lrsUsername, lrsPassword);
    const xapi = new XAPI({
      endpoint: lrsEndpoint,
      auth: auth
    });


    const name = event.queryStringParameters["name"];
    const sessionId = event.queryStringParameters["sessionId"];
    const timestampStart = event.queryStringParameters["timestampStart"];
    const timestampEndOptional = event.queryStringParameters["timestampEnd"];
    const numResults = parseInt(event.queryStringParameters["numResults"]);
    const res = await xapi.getStatements({
        agent: {
            objectType: "Agent",
            name: name,
            mbox: "mailto:" + name
        },
        since: timestampStart,
        until: timestampEndOptional ?? undefined,
    })

    const confidentAnswerPlaybackStatements: AnswerPlaybackStartedStatement[] = (res.data.statements as any).filter((statement: any) => isAnswerPlaybackStartedStatement(statement)).filter((a: AnswerPlaybackStartedStatement)=>a.result.extensions["https://mentorpal.org/xapi/verb/answer-playback-started"].answerConfidence > CONFIDENCE_THRESHOLD).filter((a: AnswerPlaybackStartedStatement)=>a.context.extensions["tag:adlnet.gov,2013:expapi:0.9:extensions:sessionId"] === sessionId);
    
    const recommenderData = RecommenderDataProcessor.getInstance();
    console.log(JSON.stringify(recommenderData.questions, null, 2));


    // Pull all answerIds from the statements
    const answerIds = confidentAnswerPlaybackStatements.map((a)=>a.result.extensions["https://mentorpal.org/xapi/verb/answer-playback-started"].answerId)

    // For every answer playback, need to get: [{mentorId, questionId, answerId, subfields=[], topics=[], startTimestamp, duration, confidence}, …]
    const answerPlaybackData = confidentAnswerPlaybackStatements.map((a)=>{
        const answerData = a.result.extensions["https://mentorpal.org/xapi/verb/answer-playback-started"];
        const questionId = recommenderData.getQuestionIdByAnswerId(answerData.answerId);
        const questionSubfieldTopicData = questionId ? recommenderData.getQuestionById(questionId) : undefined;
        const mentorsData = answerData.mentorCur ? recommenderData.getMentorById(answerData.mentorCur) : undefined;
        const subfields = [
            ...(mentorsData ? mentorsData.subfields : []),
            ...(mentorsData ? [mentorsData.degree] : []),
            ...(questionSubfieldTopicData ? questionSubfieldTopicData.subfields : []),
            ...(questionSubfieldTopicData ? [questionSubfieldTopicData.degree] : [])
        ];
        const topics = [
            ...(questionSubfieldTopicData ? questionSubfieldTopicData.topicNames : [])
        ];
        return {
            mentorId: answerData.mentorCur,
            questionId: questionId,
            answerId: answerData.answerId,
            subfields,
            topics,
            startTimestamp: answerData.timestampAnswered,
            duration: answerData.answerDuration,
            confidence: answerData.answerConfidence
        }
    })
    // TODO: lastly, need to build the matrix and normalize for top results.
    return formatJSONResponse(sessionStatements);
  };
  
  export const main = middyfy(wrapHandlerWithSentry(recommender));
  