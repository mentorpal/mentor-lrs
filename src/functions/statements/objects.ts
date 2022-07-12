/*
Government Purpose Rights (“GPR”)
Contract No.  W911NF-14-D-0005
Contractor Name:   University of Southern California
Contractor Address:  3720 S. Flower Street, 3rd Floor, Los Angeles, CA 90089-0001
Expiration Date:  Restrictions do not expire, GPR is perpetual
Restrictions Notice/Marking: The Government's rights to use, modify, reproduce, release, perform, display, or disclose this software are restricted by paragraph (b)(2) of the Rights in Noncommercial Computer Software and Noncommercial Computer Software Documentation clause contained in the above identified contract.  No restrictions apply after the expiration date shown above. Any reproduction of the software or portions thereof marked with this legend must also reproduce the markings. (see: DFARS 252.227-7014(f)(2)) 
No Commercial Use: This software shall be used for government purposes only and shall not, without the express written permission of the party whose name appears in the restrictive legend, be used, modified, reproduced, released, performed, or displayed for any commercial purpose or disclosed to a person other than subcontractors, suppliers, or prospective subcontractors or suppliers, who require the software to submit offers for, or perform, government contracts.  Prior to disclosing the software, the Contractor shall require the persons to whom disclosure will be made to complete and sign the non-disclosure agreement at 227.7103-7.  (see DFARS 252.227-7025(b)(2))
*/
import { BaseActivity } from '@gradiant/xapi-dsl/types/object/activity/base-activity';
import { Activity } from '@gradiant/xapi-dsl/types';
import * as PalIri from './pal-iri';

interface HasIdAndAlias {
  id: string;
  alias: string;
}

interface StringMappingFunction {
  (id: string): string;
}

interface IdToObject {
  (id: string): Activity;
}

function atHandler(
  activityTypeId: PalActivityType,
  activityName: string,
  idToIRI: StringMappingFunction,
  idFromIRIRegEx: RegExp
): ActivityTypeHandler {
  return {
    activityTypeId: activityTypeId,
    idToIRI: idToIRI,
    idFromIRI: (iri: string) => {
      const matches = iri.match(idFromIRIRegEx);
      return matches != null && matches.length > 0 ? matches[1] : null;
    },
    idToObject: (id: string) => {
      return {
        id: idToIRI(id),
        definition: {
          type: activityTypeId,
          name: {
            en: activityName,
          },
        },
      };
    },
  };
}

function resourceTypeHandler(
  activityTypeId: PalActivityType
): ActivityTypeHandler {
  return atHandler(
    activityTypeId,
    'resource',
    (id) => PalIri.resolve(`resources/${id}`),
    /.*\/resources\/([^/?]+)/
  );
}

export enum PalActivityType {
  ASSESSMENT = 'http://adlnet.gov/expapi/activities/assessment',
  CAREER = 'http://pal3.org/xapi/career',
  COHORT = 'http://activitystrea.ms/schema/1.0/organization',
  COMMENT = 'http://activitystrea.ms/schema/1.0/comment',
  DEVICE = 'http://activitystrea.ms/schema/1.0/device',
  DOUBT = 'http://id.tincanapi.com/activitytype/doubt',
  CMI_INTERACTION = 'http://adlnet.gov/expapi/activities/cmi.interaction',
  XP = 'http://pal3.org/xapi/xp',
  GOAL = 'http://id.tincanapi.com/activitytype/goal',
  KNOWLEDGE_COMPONENT = 'http://adlnet.gov/expapi/activities/objective',
  LEARNING_PLAN = 'https://w3id.org/xapi/acrossx/activities/learning-plan',
  LESSON = 'http://adlnet.gov/expapi/activities/lesson',
  PAGE = 'http://activitystrea.ms/schema/1.0/page',
  RESOURCE_CONTENT_TYPE = 'http://pal3.org/xapi/resource-content-type',
  TEAM = 'https://activitystrea.ms/schema/1.0/group',
  TOPIC = 'http://adlnet.gov/expapi/activities/module',
  WEB_PAGE = 'https://w3id.org/xapi/acrossx/activities/webpage',
  VIDEO = 'https://w3id.org/xapi/acrossx/activities/video',
}

type ActivityTypeHandlersByTypeId = Record<
  PalActivityType,
  ActivityTypeHandler
>;

const atHandlerByTypeId: ActivityTypeHandlersByTypeId = [
  resourceTypeHandler(PalActivityType.ASSESSMENT),
  atHandler(
    PalActivityType.CAREER,
    'career',
    (id) => PalIri.resolve(`careers/${id}`),
    /.*\/careers\/([^/?]+)/
  ),
  resourceTypeHandler(PalActivityType.COMMENT),
  atHandler(
    PalActivityType.CMI_INTERACTION,
    'cmi-interaction',
    (id) => PalIri.resolve(`interactions/${id}`),
    /.*\/interactions\/([^/?]+)/
  ),
  atHandler(
    PalActivityType.COHORT,
    'cohort',
    (id) => PalIri.resolve(`cohorts/${id}`),
    /.*\/cohorts\/([^/]+)/
  ),
  atHandler(
    PalActivityType.DEVICE,
    'pal',
    (id) => PalIri.resolve(`users/${id}/pal`),
    /.*\/users\/([^/]+)/
  ),
  atHandler(
    PalActivityType.DOUBT,
    'faq',
    (id) => PalIri.resolve(`users/${id}/faq`),
    /.*\/users\/([^/]+)/
  ),
  atHandler(
    PalActivityType.GOAL,
    'goal',
    (id) => PalIri.resolve(`goals/${id}`),
    /.*\/goals\/([^/?]+)/
  ),
  atHandler(
    PalActivityType.KNOWLEDGE_COMPONENT,
    'knowledge-component',
    (id) => PalIri.resolve(`knowledgecomponents/${id}`),
    /.*\/knowledgecomponents\/([^/?]+)/
  ),
  atHandler(
    PalActivityType.LEARNING_PLAN,
    'study-commitment',
    (id) => PalIri.resolve(`users/${id}/study-commitment`),
    /.*\/users\/([^/?]+)/
  ),
  atHandler(
    PalActivityType.LESSON,
    'lesson',
    (id) => PalIri.resolve(`lessons/${id}`),
    /.*\/lessons\/([^/?]+)/
  ),
  atHandler(
    PalActivityType.PAGE,
    'screen',
    (id) => PalIri.resolve(`users/${id}/screen`),
    /.*\/users\/([^/]+)/
  ),
  atHandler(
    PalActivityType.RESOURCE_CONTENT_TYPE,
    'topic',
    (id) => PalIri.resolve(`resource-content-types/${id}`),
    /.*\/resource-content-types\/([^/?]+)/
  ),
  atHandler(
    PalActivityType.TEAM,
    'team',
    (id) => PalIri.resolve(`users/${id}/cohort`),
    /.*\/users\/([^/]+)/
  ),
  atHandler(
    PalActivityType.TOPIC,
    'topic',
    (id) => PalIri.resolve(`topics/${id}`),
    /.*\/topics\/([^/?]+)/
  ),
  resourceTypeHandler(PalActivityType.VIDEO),
  resourceTypeHandler(PalActivityType.WEB_PAGE),
  atHandler(
    PalActivityType.XP,
    'experience-points',
    (id) => PalIri.resolve(`users/${id}/xp`),
    /.*\/users\/([^/?]+)/
  ),
].reduce((acc, cur) => {
  acc[cur.activityTypeId] = cur;
  return acc;
}, {} as Record<PalActivityType, ActivityTypeHandler>);

export interface ActivityTypeHandler {
  activityTypeId: PalActivityType;
  idToIRI: StringMappingFunction;
  idFromIRI: StringMappingFunction;
  idToObject: IdToObject;
}

export function findHandler(type: PalActivityType): ActivityTypeHandler {
  return atHandlerByTypeId[type];
}

export function findHandlerOrThrow(type: PalActivityType): ActivityTypeHandler {
  const at = atHandlerByTypeId[type];
  if (!at) {
    throw new Error(
      `invalid type '${type}', valid types are ${JSON.stringify(
        Object.getOwnPropertyNames(atHandlerByTypeId),
        null,
        2
      )}`
    );
  }
  return at;
}

export function iriFor(id: string, type: PalActivityType): string {
  return PalIri.resolve(iriPathFor(id, type));
}

export function iriPathFor(id: string, type: PalActivityType): string {
  const at = findHandler(type);
  if (!at) {
    throw new Error(
      `invalid type '${type}', valid types are ${JSON.stringify(
        Object.getOwnPropertyNames(atHandlerByTypeId),
        null,
        2
      )}`
    );
  }
  return at.idToIRI(id);
}

export function makeActivity(
  o: HasIdAndAlias,
  type: PalActivityType
): BaseActivity {
  return {
    id: iriFor(o.id, type),
    definition: {
      name: {
        en: o.alias,
      },
      type,
    },
  };
}

export function setName(name: string, a: BaseActivity): BaseActivity {
  return {
    ...a,
    definition: {
      ...(a.definition || {}),
      name: {
        ...(a.definition?.name || {}),
        en: name,
      },
    },
  };
}
