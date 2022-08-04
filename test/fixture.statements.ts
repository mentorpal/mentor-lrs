/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Statement } from "@gradiant/xapi-dsl";

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

export default statements;
