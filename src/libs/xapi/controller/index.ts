/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Statement, AccountAgent } from "@gradiant/xapi-dsl";
import { findLRS } from "../index";
import { XapiWrongUser, InvalidXapiFormatError } from "../errors";
import { User } from "../../user";

const handlers:
  | any[]
  | {
      handleStatements: (
        arg0: string,
        arg1: any[]
      ) => any[] | PromiseLike<any[]>;
    }[] = [];

/**
 * Save a group of xapi statements to the backend LRS,
 * and before doing the save, enrich the statemtents
 * with additional metadata, e.g. the names of lessons, types of resources.
 * @param statements
 */
export async function saveStatements(
  user: User,
  statements: Statement[]
): Promise<string[]> {
  statements.forEach((s) => {
    const agent = s.actor as AccountAgent;
    if (!(agent && agent.account && agent.account.name)) {
      throw new InvalidXapiFormatError(
        `only valid account agents accepted but found ${JSON.stringify(
          s.actor
        )}`
      );
    }
    if (`${agent.account.name}` !== `${user.id}`) {
      throw new XapiWrongUser(
        `attempt to save record for user ${agent.account.name} when authorized user is ${user.id}`
      );
    }
  });
  const lrs = await findLRS();
  const now = Date.now();
  let enrichedStatements = [...statements].sort((s) =>
    s.timestamp ? Date.parse(s.timestamp) : now
  );
  for (let i = 0; i < handlers.length; i++) {
    enrichedStatements = await handlers[i].handleStatements(
      user,
      enrichedStatements
    );
  }
  return await lrs.saveStatements(enrichedStatements);
}
