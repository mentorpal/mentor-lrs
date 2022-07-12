/*
Government Purpose Rights (“GPR”)
Contract No.  W911NF-14-D-0005
Contractor Name:   University of Southern California
Contractor Address:  3720 S. Flower Street, 3rd Floor, Los Angeles, CA 90089-0001
Expiration Date:  Restrictions do not expire, GPR is perpetual
Restrictions Notice/Marking: The Government's rights to use, modify, reproduce, release, perform, display, or disclose this software are restricted by paragraph (b)(2) of the Rights in Noncommercial Computer Software and Noncommercial Computer Software Documentation clause contained in the above identified contract.  No restrictions apply after the expiration date shown above. Any reproduction of the software or portions thereof marked with this legend must also reproduce the markings. (see: DFARS 252.227-7014(f)(2)) 
No Commercial Use: This software shall be used for government purposes only and shall not, without the express written permission of the party whose name appears in the restrictive legend, be used, modified, reproduced, released, performed, or displayed for any commercial purpose or disclosed to a person other than subcontractors, suppliers, or prospective subcontractors or suppliers, who require the software to submit offers for, or perform, government contracts.  Prior to disclosing the software, the Contractor shall require the persons to whom disclosure will be made to complete and sign the non-disclosure agreement at 227.7103-7.  (see DFARS 252.227-7025(b)(2))
*/
import { Statement, AccountAgent } from '@gradiant/xapi-dsl';
import CareerHandler from './handlers/career';
import CohortSelectedHandler from './handlers/cohort';
import GoalSelectedHandler from './handlers/goal';
import KnowledgeComponentHandler from './handlers/knowledge-component';
import LessonHandler from './handlers/lesson';
import ResourceHandler from './handlers/resource';
import TopicHandler from './handlers/topic';
import UserLessonSessionHandler from './handlers/side-effect-user-lesson-session';
import { User } from 'pal-mongoose';
import { XapiWrongUser, InvalidXapiFormatError } from '../errors';
import { makeCannonical } from '../statements';
import { findLRS } from '../index';

const handlers = [
  new UserLessonSessionHandler(), // this needs to go before other handlers
  new CareerHandler(),
  new CohortSelectedHandler(),
  new GoalSelectedHandler(),
  new KnowledgeComponentHandler(),
  new LessonHandler(),
  new ResourceHandler(),
  new TopicHandler(),
];

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
    try {
      enrichedStatements = await handlers[i].handleStatements(
        user,
        enrichedStatements
      );
    } catch (err) {
      const e: Error = err as Error;
      if (!e) {
        throw err;
      }
      if (e.message && e.message.startsWith('Cast to ObjectId failed')) {
        throw Object.assign(e, { status: 400 });
      }
      throw err;
    }
  }
  return await lrs.saveStatements(
    enrichedStatements.map((s) => makeCannonical(s))
  );
}
