/*
Government Purpose Rights (“GPR”)
Contract No.  W911NF-14-D-0005
Contractor Name:   University of Southern California
Contractor Address:  3720 S. Flower Street, 3rd Floor, Los Angeles, CA 90089-0001
Expiration Date:  Restrictions do not expire, GPR is perpetual
Restrictions Notice/Marking: The Government's rights to use, modify, reproduce, release, perform, display, or disclose this software are restricted by paragraph (b)(2) of the Rights in Noncommercial Computer Software and Noncommercial Computer Software Documentation clause contained in the above identified contract.  No restrictions apply after the expiration date shown above. Any reproduction of the software or portions thereof marked with this legend must also reproduce the markings. (see: DFARS 252.227-7014(f)(2)) 
No Commercial Use: This software shall be used for government purposes only and shall not, without the express written permission of the party whose name appears in the restrictive legend, be used, modified, reproduced, released, performed, or displayed for any commercial purpose or disclosed to a person other than subcontractors, suppliers, or prospective subcontractors or suppliers, who require the software to submit offers for, or perform, government contracts.  Prior to disclosing the software, the Contractor shall require the persons to whom disclosure will be made to complete and sign the non-disclosure agreement at 227.7103-7.  (see DFARS 252.227-7025(b)(2))
*/
import { Statement } from '@gradiant/xapi-dsl';
import { Lesson, Topic, User } from 'pal-mongoose';
import { StatementHandler } from '../handlers';
import { XapiObjectNotFound } from '../../errors';
import { makeActivity, PalActivityType } from '../../objects';
import { setObjectName, setParent } from '../../statements';
import { StatementObjectFinder } from './utils';

const objectFinder = new StatementObjectFinder<Lesson>({
  iriToId: /.*\/lessons\/([^/?]+)/,
  findById: (id) => Lesson.findById(id).exec(),
});

export default class LessonHandler implements StatementHandler {
  async handleStatements(
    user: User,
    statements: Statement[]
  ): Promise<Statement[]> {
    const targetObjects = await objectFinder.findTargetObjects(statements);
    const result = [...statements];
    for (let i = 0; i < targetObjects.length; i++) {
      if (!targetObjects[i].objectId) {
        continue;
      }
      const lesson = targetObjects[i].object;
      if (!lesson) {
        throw new XapiObjectNotFound(
          `no lesson found for id '${targetObjects[i].objectId}'`
        );
      }
      result[i] = JSON.parse(
        JSON.stringify(targetObjects[i].statement)
      ) as Statement;
      result[i] = setObjectName(lesson.alias, result[i]);
      const topic = await Topic.findById(lesson.topic).exec();
      if (topic) {
        result[i] = setParent(
          makeActivity(topic, PalActivityType.TOPIC),
          result[i]
        );
      }
    }
    return result;
  }
}
