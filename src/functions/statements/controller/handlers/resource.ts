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
import { User, Resource } from 'pal-mongoose';
import { StatementHandler } from '../handlers';
import { XapiObjectNotFound } from '../../errors';
import { StatementObjectFinder, StatementAndObject } from './utils';
import { Lesson, Topic, UserLessonSession } from 'pal-mongoose';
import {
  addContextExtensions,
  addGroupings,
  addObjectExtensions,
  setObjectName,
  setParent,
} from '../../statements';
import { makeActivity, PalActivityType } from '../../objects';

async function handleFeedback(
  user: User,
  targetObjects: StatementAndObject<Resource>[]
): Promise<void> {
  targetObjects.forEach((tgtObj) => {
    const resource = tgtObj.object;
    if (!resource) {
      return;
    }

    const s = tgtObj.statement;
    const verb = s.verb;
    if (!(verb && verb.id === 'https://w3id.org/xapi/dod-isd/verbs/reported')) {
      return;
    }
    const activity = s.object as Activity;
    if (
      !(
        activity &&
        activity.definition &&
        activity.definition.type ===
          'http://activitystrea.ms/schema/1.0/comment'
      )
    ) {
      return;
    }
    const feedback = s.result ? s.result.response : undefined;
    if (!feedback) {
      return;
    }
    //sendFeedback(feedback, resource, user);
  });
}

const objectFinder = new StatementObjectFinder<Resource>({
  iriToId: /.*\/resources\/([^/?]+)/,
  findById: (id) => Resource.findById(id).exec(),
});

export default class ResourceHandler implements StatementHandler {
  async handleStatements(
    user: User,
    statements: Statement[]
  ): Promise<Statement[]> {
    const targetObjects = await objectFinder.findTargetObjects(statements);
    await handleFeedback(user, targetObjects);
    const result = [...statements];
    for (let i = 0; i < targetObjects.length; i++) {
      if (!targetObjects[i].objectId) {
        continue;
      }
      const resource = targetObjects[i].object;
      if (!resource) {
        throw new XapiObjectNotFound(
          `no resource found for id '${targetObjects[i].objectId}'`
        );
      }
      result[i] = JSON.parse(
        JSON.stringify(targetObjects[i].statement)
      ) as Statement;
      result[i] = setObjectName(resource.alias, result[i]);
      // NOTE: we should stop using this content-type ext
      // and instead use the context.contextActivities.grouping (below)
      result[i] = addObjectExtensions(
        {
          'http://pal3.org/xapi/resource/object/content-type':
            resource.contentType,
        },
        result[i]
      );
      result[i] = addGroupings(
        makeActivity(
          { id: resource.contentType, alias: resource.contentType },
          PalActivityType.RESOURCE_CONTENT_TYPE
        ),
        result[i]
      );
      const lessonSession = await UserLessonSession.findOneByUserAndSession(
        user,
        result[i].context.registration
      );
      if (lessonSession) {
        const lesson = await Lesson.findById(lessonSession.lesson).exec();
        if (lesson) {
          result[i] = setParent(
            makeActivity(
              { id: `${lesson.id}`, alias: lesson.alias },
              PalActivityType.LESSON
            ),
            result[i]
          );
          // NOTE: we should stop using this content-type ext
          // and instead use the context.contextActivities.grouping (below)
          result[i] = addContextExtensions(
            {
              'http://pal3.org/xapi/lesson/object': {
                id: `${lesson.id}`,
                name: {
                  en: lesson.alias,
                },
              },
            },
            result[i]
          );
          result[i] = addGroupings(
            makeActivity(
              { id: `${lesson.id}`, alias: lesson.alias },
              PalActivityType.LESSON
            ),
            result[i]
          );
          const topic = await Topic.findById(lesson.topic).exec();
          if (topic) {
            // NOTE: we should stop using this content-type ext
            // and instead use the context.contextActivities.grouping (below)
            result[i] = addContextExtensions(
              {
                'http://pal3.org/xapi/topic/object': {
                  id: `${topic.id}`,
                  name: {
                    en: topic.alias,
                  },
                },
              },
              result[i]
            );
            result[i] = addGroupings(
              makeActivity(
                { id: `${topic.id}`, alias: topic.alias },
                PalActivityType.TOPIC
              ),
              result[i]
            );
          }
        }
      }
    }
    return result;
  }
}
