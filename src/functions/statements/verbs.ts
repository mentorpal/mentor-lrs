/*
Government Purpose Rights (“GPR”)
Contract No.  W911NF-14-D-0005
Contractor Name:   University of Southern California
Contractor Address:  3720 S. Flower Street, 3rd Floor, Los Angeles, CA 90089-0001
Expiration Date:  Restrictions do not expire, GPR is perpetual
Restrictions Notice/Marking: The Government's rights to use, modify, reproduce, release, perform, display, or disclose this software are restricted by paragraph (b)(2) of the Rights in Noncommercial Computer Software and Noncommercial Computer Software Documentation clause contained in the above identified contract.  No restrictions apply after the expiration date shown above. Any reproduction of the software or portions thereof marked with this legend must also reproduce the markings. (see: DFARS 252.227-7014(f)(2)) 
No Commercial Use: This software shall be used for government purposes only and shall not, without the express written permission of the party whose name appears in the restrictive legend, be used, modified, reproduced, released, performed, or displayed for any commercial purpose or disclosed to a person other than subcontractors, suppliers, or prospective subcontractors or suppliers, who require the software to submit offers for, or perform, government contracts.  Prior to disclosing the software, the Contractor shall require the persons to whom disclosure will be made to complete and sign the non-disclosure agreement at 227.7103-7.  (see DFARS 252.227-7025(b)(2))
*/
import { Verb } from '@gradiant/xapi-dsl';

export const ACKNOWLEDGED: Verb = {
  id: 'http://activitystrea.ms/schema/1.0/acknowledge',
  display: { en: 'acknowledge' },
};

export const ANSWERED: Verb = {
  id: 'http://adlnet.gov/expapi/verbs/answered',
  display: { en: 'answered' },
};

export const ATTEMPTED: Verb = {
  id: 'http://adlnet.gov/expapi/verbs/attempted',
  display: { en: 'attempted' },
};

export const COMPLETED: Verb = {
  id: 'http://adlnet.gov/expapi/verbs/completed',
  display: { en: 'completed' },
};

export const EARNED: Verb = {
  id: 'http://id.tincanapi.com/verb/earned',
  display: { en: 'earned' },
};

export const EXITED: Verb = {
  id: 'http://adlnet.gov/expapi/verbs/exited',
  display: { en: 'exited' },
};

export const FAILED: Verb = {
  id: 'http://adlnet.gov/expapi/verbs/failed',
  display: { en: 'failed' },
};

export const INITIALIZED: Verb = {
  id: 'http://adlnet.gov/expapi/verbs/initialized',
  display: { en: 'initialized' },
};

export const INVITED: Verb = {
  id: 'http://id.tincanapi.com/verb/hired',
  display: { en: 'invited' },
};

export const LISTENED: Verb = {
  id: 'https://w3id.org/xapi/dod-isd/verbs/listened',
  display: { en: 'listened' },
};

export const PASSED: Verb = {
  id: 'http://adlnet.gov/expapi/verbs/passed',
  display: { en: 'passed' },
};

export const QUIT: Verb = {
  id: 'https://w3code.org/xapi/adl/verbs/abandoned',
  display: { en: 'quit' },
};

export const REPORTED: Verb = {
  id: 'https://w3id.org/xapi/dod-isd/verbs/reported',
  display: { en: 'reported' },
};

export const SCORED: Verb = {
  id: 'http://adlnet.gov/expapi/verbs/scored',
  display: { en: 'scored' },
};

export const SELECTED: Verb = {
  id: 'http://id.tincanapi.com/verb/selected',
  display: { en: 'selected' },
};

export const SKIPPED: Verb = {
  id: 'http://id.tincanapi.com/verb/skipped',
  display: { en: 'skipped' },
};

export const TERMINATED: Verb = {
  id: 'http://adlnet.gov/expapi/verbs/terminated',
  display: { en: 'terminated' },
};

export const VIEWED: Verb = {
  id: 'http://id.tincanapi.com/verb/viewed',
  display: { en: 'viewed' },
};
