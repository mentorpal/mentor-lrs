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
import { User, Goal, UserGoal } from 'pal-mongoose';
import { StatementHandler } from '../handlers';
import { XapiObjectNotFound } from '../../errors';
import { StatementObjectFinder } from './utils';
import { makeActivity, PalActivityType } from '../../objects';
import {
  addContextExtensions,
  addGroupings,
  setObjectName,
} from '../../statements';

function idFromIri(iri: string): string {
  const m = iri.match(/.*\/goals\/([^/?]+)/);
  return m && m.length > 0 ? m[1] : '';
}

const objectFinder = new StatementObjectFinder<Goal>({
  iriToId: /.*\/goals\/([^/?+]+)/,
  findById: (id) => Goal.findById(id).exec(),
});

async function findGoalAndFocus(
  s: Statement
): Promise<{ goal: Goal; focus: string }> {
  const goalAndFocusStr = idFromIri((s.object as Activity).id);
  const goalAndFocus = goalAndFocusStr.split('+');
  const goalId = goalAndFocus[0];
  const focusId = goalAndFocus.length > 1 ? goalAndFocus[1] : null;
  const goal = await Goal.findById(goalId).exec();
  if (!goal) {
    throw new XapiObjectNotFound(`cannot set goal to unknown id ${goalId}`);
  }
  if (focusId && !goal.findFocusByIdOrAlias(focusId)) {
    throw new XapiObjectNotFound(
      `cannot set focus for goal ${goalId} to unknown focus ${focusId}`
    );
  }
  return { goal, focus: focusId };
}

function setUserGoal(s: Statement, goal: Goal, focus: string): Statement {
  return addGroupings(
    makeActivity(
      { id: `${goal._id}`, alias: goal.alias },
      PalActivityType.GOAL
    ),
    addContextExtensions(
      {
        'http://pal3.org/xapi/goal/verb/selected': {
          id: `${goal._id}`,
          name: {
            en: goal.alias,
          },
          ...(focus ? { focus } : {}),
        },
      },
      s
    )
  );
}

export default class GoalHandler implements StatementHandler {
  async handleStatements(
    user: User,
    statements: Statement[]
  ): Promise<Statement[]> {
    const targetObjects = await objectFinder.findTargetObjects(statements);
    // first lookup the user's current goal.
    // set that user goal on all statements unless/until
    // we encounter another goal/selected statement
    // (in which event just start using the new user goal
    // on subsequent statements)
    const userGoal = await UserGoal.findOne({ user: user.id }).exec();
    let goal = userGoal
      ? await Goal.findById(userGoal.activeGoal).exec()
      : null;
    let focus = userGoal?.activeFocus || '';
    const goalIdBefore = `${goal?.id || ''}`;
    const result = [...statements];
    for (let i = 0; i < targetObjects.length; i++) {
      if (goal) {
        result[i] = setUserGoal(result[i], goal, focus);
      }
      if (!targetObjects[i].objectId) {
        continue;
      }
      const goalObj = targetObjects[i].object;
      if (!goalObj) {
        throw new XapiObjectNotFound(
          `no goal found for id '${targetObjects[i].objectId}'`
        );
      }
      result[i] = setObjectName(goalObj.alias, result[i]);
      if (result[i].verb.id === 'http://id.tincanapi.com/verb/selected') {
        const newGoalAndGFocus = await findGoalAndFocus(result[i]);
        goal = newGoalAndGFocus.goal;
        focus = newGoalAndGFocus.focus;
        result[i] = setUserGoal(result[i], goal, focus);
      }
    }
    if (goal && (!goalIdBefore || goalIdBefore !== `${goal.id}`)) {
      await UserGoal.saveGoalAndFocus(user, goal.id, focus);
    }
    return result;
  }
}
