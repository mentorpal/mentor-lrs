/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Statement } from "@gradiant/xapi-dsl";
import {
  AnswerPlaybackStartedStatement,
  answerPlaybackStartedVerb,
  sessionIdExtensionKey,
} from "../src/functions/recommender/types";
import { v4 as uuidv4 } from "uuid";

function statements(
  userName: string,
  userId: string,
  generateIds = false
): Statement[] {
  const stmts: Statement[] = [
    {
      timestamp: "2020-03-18T23:18:33.716Z",
      actor: {
        objectType: "Agent",
        account: {
          name: `${userId}`,
          homePage: "https://test.org/xapi/users",
        },
        name: `${userName}`,
      },
      verb: {
        id: "http://id.tincanapi.com/verb/viewed",
        display: {
          en: "viewed",
        },
      },
      result: {
        success: false,
        duration: "PT0.00S",
        extensions: {
          "http://pal3.org/xapi/screen/visited": {
            screen: "home",
          },
        },
        score: {
          scaled: 0,
        },
        completion: false,
      },
      context: {
        registration: "08ebb242-c658-431d-81ca-377fce376018",
        extensions: {
          "https://dev.pal3.org/xapi/context/id-original":
            "unsynced_250aefd2-d2f7-473a-ac1a-28f63be777f4",
          "http://pal3.org/xapi/goal/verb/selected": {
            id: "5bb6540cbecb4e208da0fb63",
            name: {
              en: "advancement-test-fc-e3",
            },
            focus: "technical-skills",
          },
        },
      },
      object: {
        id: "https://dev.pal3.org/xapi/users/kcarr/screen",
        objectType: "Activity",
        definition: {
          type: "http://activitystrea.ms/schema/1.0/page",
          name: {
            en: "screen",
          },
        },
      },
    },
  ];
  let seq = 1;
  return generateIds
    ? stmts.map((s) => {
        return { ...s, id: `id${seq++}` } as Statement;
      })
    : stmts;
}

export function mentorpalPlaybackStatements(
  name: string,
  sessionId: string,
  numStatements: number
): AnswerPlaybackStartedStatement[] {
  const randomQuestionIds = [
    "60c7b69407dd7007eb3c5968",
    "60c7b69407dd708c9f3c596b",
    "60c7b69407dd70afd33c597f",
    "60c7b69407dd70571b3c5983",
    "60c7b69407dd70f0003c598a",
    "60c7b69407dd7027f03c598d",
    "60c7b69407dd704e203c598c",
    "60c7b69407dd704ad03c5990",
    "60c7b69407dd7003433c5995",
    "60c7b69407dd70c07a3c5994",
    "60c7b69407dd700b513c5998",
  ];
  const randomMentorIds = [
    "610dd25416e879e3c3d7bfe7",
    "6114286e16e879e3c3b97ad7",
    "614398e306c21f1afa459f56",
    "614d5d444be7d1a8ec30b7f4",
    "6153ae754be7d1a8ecc1e8f3",
    "615fdc4eae00075f6f163d2c",
    "61b20a97836e4af90c0df4b6",
    "61bb76209e733a8a0eb257da",
    "61f47188b7c2b3547e462ba2",
    "61f4730ab7c2b3547e475e03",
  ];
  const statements: AnswerPlaybackStartedStatement[] = [];
  for (let i = 0; i < numStatements; i++) {
    statements.push({
      actor: {
        objectType: "Agent",
        mbox: "mailto:" + name,
        name: name,
      },
      context: {
        extensions: {
          [sessionIdExtensionKey]: sessionId,
        },
      },
      result: {
        extensions: {
          [answerPlaybackStartedVerb]: {
            answerId: uuidv4(),
            answerQuestionId: randomQuestionIds[i % randomQuestionIds.length],
            mentorCur: randomMentorIds[i % randomMentorIds.length],
            timestampAnswered: 1234567890,
            answerDuration: 10,
            answerConfidence: 1,
          },
        },
      },
    });
  }
  return statements;
}

export default statements;
