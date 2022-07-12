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
import { KnowledgeComponent, User, UserKnowledgeComponent } from 'pal-mongoose';
import { StatementHandler } from '../handlers';
import { XapiObjectNotFound, InvalidXapiFormatError } from '../../errors';
import { StatementAndObject, StatementObjectFinder } from './utils';
import logging from '../../../../utils/logging';

const objectFinder = new StatementObjectFinder<KnowledgeComponent>({
  iriToId: /.*\/knowledgecomponents\/([^/?]+)/,
  findById: (id) => KnowledgeComponent.findById(id).exec(),
});

async function handleScores(
  user: User,
  targetObjects: StatementAndObject<KnowledgeComponent>[]
): Promise<void> {
  // const targetObjects = await objectFinder.findTargetObjects(statements);
  for (let i = 0; i < targetObjects.length; i++) {
    if (!targetObjects[i].objectId) {
      continue;
    }
    const kc = targetObjects[i].object;
    if (!kc) {
      logging.warn(
        `ignoring kc score with unknown kc ${targetObjects[i].objectId}`
      );
      continue;
    }
    const s = targetObjects[i].statement;
    const mastery = Number(s.result?.score?.scaled);
    if (isNaN(mastery)) {
      throw new InvalidXapiFormatError(
        'missing field required for kc/score: result/score/scaled'
      );
    }
    if (mastery < 0 || mastery > 1.0) {
      throw new InvalidXapiFormatError(
        'kc/score required field result/score/scaled must be a number between 0.0 and 1.0'
      );
    }
    const extensions = s.result?.extensions || {};
    const avgTimeDecay = !isNaN(
      Number(extensions['http://pal3.org/mastery/avgtimedecay'])
    )
      ? Number(extensions['http://pal3.org/mastery/avgtimedecay'])
      : 1.0;

    const asymptote = !isNaN(
      Number(extensions['http://pal3.org/mastery/asymptote'])
    )
      ? Number(extensions['http://pal3.org/mastery/asymptote'])
      : 0.0;
    try {
      const timestamp = new Date(Date.parse(s.timestamp));
      if (isNaN(timestamp.getTime())) {
        logging.warn(
          `ignoring kc score with bad timestamp ${JSON.stringify(s, null, 2)}`
        );
        return;
      }
      await UserKnowledgeComponent.insertOrUpdateIfNewer(user, kc._id, {
        mastery: mastery,
        timestamp: timestamp,
        avgTimeDecay: avgTimeDecay,
        asymptote: asymptote,
      });
    } catch (err) {
      logging.error(
        `failed to save user kc mastery for statement ${JSON.stringify(s)}: ${
          err.message
        }`,
        err
      );
    }
  }
}

export default class KnowledgeComponentHandler implements StatementHandler {
  async handleStatements(
    user: User,
    statements: Statement[]
  ): Promise<Statement[]> {
    const targetObjects = await objectFinder.findTargetObjects(statements);
    await handleScores(user, targetObjects);
    const result = [...statements];
    for (let i = 0; i < targetObjects.length; i++) {
      if (!targetObjects[i].objectId) {
        continue;
      }
      const object = targetObjects[i].object;
      if (!object) {
        throw new XapiObjectNotFound(
          `no knowledge component found for id '${targetObjects[i].objectId}'`
        );
      }
      const s = JSON.parse(
        JSON.stringify(targetObjects[i].statement)
      ) as Statement;
      const o = s.object as Activity;
      o.definition = o.definition || {};
      o.definition.name = {
        en: object.alias,
      };
      result[i] = s;
    }
    return result;
  }
}
