/*
Government Purpose Rights (“GPR”)
Contract No.  W911NF-14-D-0005
Contractor Name:   University of Southern California
Contractor Address:  3720 S. Flower Street, 3rd Floor, Los Angeles, CA 90089-0001
Expiration Date:  Restrictions do not expire, GPR is perpetual
Restrictions Notice/Marking: The Government's rights to use, modify, reproduce, release, perform, display, or disclose this software are restricted by paragraph (b)(2) of the Rights in Noncommercial Computer Software and Noncommercial Computer Software Documentation clause contained in the above identified contract.  No restrictions apply after the expiration date shown above. Any reproduction of the software or portions thereof marked with this legend must also reproduce the markings. (see: DFARS 252.227-7014(f)(2)) 
No Commercial Use: This software shall be used for government purposes only and shall not, without the express written permission of the party whose name appears in the restrictive legend, be used, modified, reproduced, released, performed, or displayed for any commercial purpose or disclosed to a person other than subcontractors, suppliers, or prospective subcontractors or suppliers, who require the software to submit offers for, or perform, government contracts.  Prior to disclosing the software, the Contractor shall require the persons to whom disclosure will be made to complete and sign the non-disclosure agreement at 227.7103-7.  (see DFARS 252.227-7025(b)(2))
*/
import { Activity, Statement } from '@gradiant/xapi-dsl';
import { BaseActivity } from '@gradiant/xapi-dsl/types/object/activity/base-activity';
import { setName } from './objects';
import { sortById } from './utils';

interface Mappings {
  [key: string]: any;
}

export function addContextExtensions(exts: Mappings, s: Statement): Statement {
  return {
    ...s,
    context: {
      ...(s.context || {}),
      extensions: {
        ...(s.context?.extensions || {}),
        ...(exts || {}),
      },
    },
  };
}

export function addObjectExtensions(exts: Mappings, s: Statement): Statement {
  return {
    ...s,
    object: {
      ...(s.object || {}),
      definition: {
        ...((s.object as BaseActivity)?.definition || {}),
        extensions: {
          ...((s.object as BaseActivity)?.definition?.extensions || {}),
          ...(exts || {}),
        },
      },
    },
  } as Statement;
}

export function addGroupings(
  groupings: Activity | Array<Activity>,
  s: Statement
): Statement {
  return {
    ...s,
    context: {
      ...(s.context || {}),
      contextActivities: {
        ...(s.context?.contextActivities || {}),
        grouping: [
          ...(Array.isArray(s.context?.contextActivities?.grouping)
            ? (s.context?.contextActivities?.grouping as Array<Activity>)
            : Boolean(s.context?.contextActivities?.grouping as Activity)
            ? [s.context?.contextActivities?.grouping as Activity]
            : []),
          ...(Array.isArray(groupings)
            ? (groupings as Array<Activity>)
            : [groupings as Activity]),
        ],
      },
    },
  };
}

export function makeCannonical(s: Statement): Statement {
  return sortGroupings(s);
}

export function sortGroupings(s: Statement): Statement {
  return Array.isArray(s.context?.contextActivities?.grouping)
    ? {
        ...s,
        context: {
          ...(s.context || {}),
          contextActivities: {
            ...(s.context?.contextActivities || {}),
            grouping: sortById(s.context.contextActivities.grouping),
          },
        },
      }
    : s;
  return;
}

export function setObjectName(name: string, s: Statement): Statement {
  return {
    ...s,
    object: setName(name, s.object as BaseActivity),
  };
}

export function setParent(parent: Activity, s: Statement): Statement {
  return {
    ...s,
    context: {
      ...s.context,
      contextActivities: {
        ...(s.context?.contextActivities || {}),
        parent: [parent],
      },
    },
  };
}
