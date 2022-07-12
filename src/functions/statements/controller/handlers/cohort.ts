/*
Government Purpose Rights (“GPR”)
Contract No.  W911NF-14-D-0005
Contractor Name:   University of Southern California
Contractor Address:  3720 S. Flower Street, 3rd Floor, Los Angeles, CA 90089-0001
Expiration Date:  Restrictions do not expire, GPR is perpetual
Restrictions Notice/Marking: The Government's rights to use, modify, reproduce, release, perform, display, or disclose this software are restricted by paragraph (b)(2) of the Rights in Noncommercial Computer Software and Noncommercial Computer Software Documentation clause contained in the above identified contract.  No restrictions apply after the expiration date shown above. Any reproduction of the software or portions thereof marked with this legend must also reproduce the markings. (see: DFARS 252.227-7014(f)(2)) 
No Commercial Use: This software shall be used for government purposes only and shall not, without the express written permission of the party whose name appears in the restrictive legend, be used, modified, reproduced, released, performed, or displayed for any commercial purpose or disclosed to a person other than subcontractors, suppliers, or prospective subcontractors or suppliers, who require the software to submit offers for, or perform, government contracts.  Prior to disclosing the software, the Contractor shall require the persons to whom disclosure will be made to complete and sign the non-disclosure agreement at 227.7103-7.  (see DFARS 252.227-7025(b)(2))
*/
import { Statement, Activity } from '@gradiant/xapi-dsl';
import { User, UserCohort, Cohort } from 'pal-mongoose';
import { StatementHandler } from '../handlers';
import { StatementObjectFinder } from './utils';
import { addContextExtensions } from '../../statements';

function idFromIri(iri: string): string {
  const m = iri.match(/.*\/cohorts\/([^/?]+)/);
  return m && m.length > 0 ? m[1] : '';
}

const objectFinder = new StatementObjectFinder<Cohort>({
  iriToId: /.*\/cohorts\/([^/?+]+)/,
  findById: (name) => Cohort.findOrCreateForName(name),
});

async function findCohort(s: Statement): Promise<Cohort> {
  const cohortStr = idFromIri((s.object as Activity).id);
  return await Cohort.findOrCreateForName(decodeURI(cohortStr));
}

function setUserCohort(s: Statement, cohort: Cohort): Statement {
  return addContextExtensions(
    {
      'http://pal3.org/xapi/cohort/verb/selected': {
        id: `${cohort.id}`,
        name: {
          en: cohort.nameCanonical,
        },
      },
    },
    s
  );
}

export default class CohortHandler implements StatementHandler {
  async handleStatements(
    user: User,
    statements: Statement[]
  ): Promise<Statement[]> {
    const targetObjects = await objectFinder.findTargetObjects(statements);
    // first lookup the user's current cohort.
    // set that user cohort on all statements unless/until
    // we encounter another cohort/selected statement
    // (in which event just start using the new user cohort
    // on subsequent statements)
    const userCohort = await UserCohort.findOne({ user: user.id }).exec();
    let cohort = userCohort
      ? await Cohort.findById(userCohort.cohort).exec()
      : null;
    const cohortIdBefore = cohort ? `${cohort.id}` : '';
    const result = [...statements];
    for (let i = 0; i < targetObjects.length; i++) {
      if (cohort) {
        result[i] = setUserCohort(result[i], cohort);
      }
      if (!targetObjects[i].objectId) {
        continue;
      }
      if (result[i].verb.id === 'http://id.tincanapi.com/verb/selected') {
        cohort = await findCohort(result[i]);
        result[i] = setUserCohort(result[i], cohort);
      }
    }
    if (cohort && (!cohortIdBefore || cohortIdBefore !== `${cohort.id}`)) {
      await UserCohort.setUserCohort(user, cohort.name);
    }
    return result;
  }
}
