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
import { Lesson, Resource, User, UserLessonSession } from 'pal-mongoose';
import { StatementHandler } from '../handlers';
import { XapiObjectNotFound, InvalidXapiFormatError } from '../../errors';
import { regexToIdToIriFunction } from './utils';

const lessonIriToId = regexToIdToIriFunction(/.*\/lessons\/([^/?]+)/);

const resourceIriToId = regexToIdToIriFunction(/.*\/resources\/([^/?]+)/);

export default class UserLessonSessionHandler implements StatementHandler {
  async handleStatements(
    user: User,
    statements: Statement[]
  ): Promise<Statement[]> {
    // create a UserLessonSession record for each lesson attempted
    for (let i = 0; i < statements.length; i++) {
      const s = statements[i];
      const o = s.object as Activity;
      if (!o) {
        continue;
      }
      if (
        !(
          o.definition &&
          o.definition.type === 'http://adlnet.gov/expapi/activities/lesson'
        )
      ) {
        continue;
      }
      if (
        !(
          s.verb.id === 'http://adlnet.gov/expapi/verbs/attempted' ||
          s.verb.id === 'http://adlnet.gov/expapi/verbs/initialized'
        )
      ) {
        continue;
      }
      const lessonId = lessonIriToId(o.id);
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new XapiObjectNotFound(`No lesson for iri ${o.id}`);
      }
      if (
        !s.context &&
        s.context.registration &&
        typeof s.context.registration === 'string'
      ) {
        throw new InvalidXapiFormatError(
          'xapi statement missing required context.regristration'
        );
      }
      await UserLessonSession.saveUserLessonSession(
        user,
        s.context.registration,
        lesson
      );
    }
    // clear a termination-pending for each resource terminated
    for (let i = 0; i < statements.length; i++) {
      const s = statements[i];
      if (s.verb.id !== 'http://adlnet.gov/expapi/verbs/terminated') {
        continue;
      }
      const o = s.object as Activity;
      if (!o) {
        continue;
      }
      const resourceId = resourceIriToId(o.id);
      if (!resourceId) {
        continue;
      }
      const resource = await Resource.findById(resourceId);
      if (!resource) {
        throw new XapiObjectNotFound(`No resource for iri ${o.id}`);
      }
      if (
        !s.context &&
        s.context.registration &&
        typeof s.context.registration === 'string'
      ) {
        throw new InvalidXapiFormatError(
          'xapi statement missing required context.regristration'
        );
      }
      await UserLessonSession.setResourceTerminationPending(
        user,
        s.context.registration,
        resource,
        false
      );
    }
    return statements;
  }
}
