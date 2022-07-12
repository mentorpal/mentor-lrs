/*
Government Purpose Rights (“GPR”)
Contract No.  W911NF-14-D-0005
Contractor Name:   University of Southern California
Contractor Address:  3720 S. Flower Street, 3rd Floor, Los Angeles, CA 90089-0001
Expiration Date:  Restrictions do not expire, GPR is perpetual
Restrictions Notice/Marking: The Government's rights to use, modify, reproduce, release, perform, display, or disclose this software are restricted by paragraph (b)(2) of the Rights in Noncommercial Computer Software and Noncommercial Computer Software Documentation clause contained in the above identified contract.  No restrictions apply after the expiration date shown above. Any reproduction of the software or portions thereof marked with this legend must also reproduce the markings. (see: DFARS 252.227-7014(f)(2)) 
No Commercial Use: This software shall be used for government purposes only and shall not, without the express written permission of the party whose name appears in the restrictive legend, be used, modified, reproduced, released, performed, or displayed for any commercial purpose or disclosed to a person other than subcontractors, suppliers, or prospective subcontractors or suppliers, who require the software to submit offers for, or perform, government contracts.  Prior to disclosing the software, the Contractor shall require the persons to whom disclosure will be made to complete and sign the non-disclosure agreement at 227.7103-7.  (see DFARS 252.227-7025(b)(2))
*/
import { Actor, Agent, Statement } from '@gradiant/xapi-dsl';
import * as PalIri from './pal-iri';
import { InvalidXapiFormatError } from './errors';
import requireEnv from '../../utils/require-env'
const TinCan = require('tincanjs');

export interface ActivityState {
  contextTemplate?: any;
  masteryScore?: number;
  returnURL?: string;
}

export interface FetchActivityStateParams {
  activityId: string;
  agent: Actor;
  registration: string;
  stateId: string;
}

export interface LRS {
  fetchActivityState(params: FetchActivityStateParams): Promise<ActivityState>;
  fetchStatements(params: FetchStatementsParams): Promise<StatementResult>;
  saveStatements(statements: Statement[]): Promise<string[]>;
}

export interface FetchStatementsParams {
  activity?: string;
  agent: Actor;
  ascending?: string;
  format?: string;
  limit?: number;
  registration?: string;
  related_agents?: string;
  since?: string;
  until?: string;
  verb?: string;
}

export interface StatementResult {
  statements: Statement[];
  more?: string;
}

class TinCanLRS implements LRS {
  _lrs: any;

  constructor() {
    const lrsEndpoint = requireEnv('TINCAN_LRS_ENDPOINT');
    const lrsUsername = requireEnv('TINCAN_LRS_USERNAME');
    const lrsPassword = requireEnv('TINCAN_LRS_PASSWORD');
    this._lrs = new TinCan.LRS({
      endpoint: lrsEndpoint,
      username: lrsUsername,
      password: lrsPassword,
      allowFail: false,
    });
  }

  fetchActivityState(params: FetchActivityStateParams): Promise<ActivityState> {
    return new Promise((resolve, reject) => {
      this._lrs.retrieveState(params.stateId, {
        agent: new TinCan.Agent(params.agent),
        registration: params.registration,
        activity: new TinCan.Activity({
          id: params.activityId,
        }),
        // eslint-disable-next-line
        callback: (err: Error, state: any) => {
          if (err) {
            return reject(err);
          }
          return resolve(
            !state
              ? {}
              : typeof state.asVersion === 'function'
              ? state.asVersion()
              : state
          );
        },
      });
    });
  }

  fetchStatements(params: FetchStatementsParams): Promise<StatementResult> {
    return new Promise((resolve, reject) => {
      // TODO: need to test all the param types.
      // Probably TinCan needs all type (like verb) wrapped here as TinCan.Verb etc
      this._lrs.queryStatements({
        params: { ...params, agent: new TinCan.Agent(params.agent) },
        callback: async (err: any, sr: StatementResult) => {
          if (err) {
            return reject(err);
          }
          // TinCan likes to convert xapi json int
          // instances of it's own domain-objects classes.
          // Make sure we're returning pure json to avoid
          // issues downstream
          const result: StatementResult = {
            statements: Array.isArray(sr.statements)
              ? sr.statements.map((s) => {
                  const sJson: Statement =
                    typeof (s as any).asVersion === 'function'
                      ? ((s as any).asVersion() as Statement)
                      : s;
                  if (!sJson.stored && s.stored) {
                    sJson.stored = s.stored; // stupid tincan module swallows stored field
                  }
                  return sJson;
                })
              : [],
          };
          if (sr.more) {
            result.more = sr.more;
          }
          return resolve(result);
        },
      });
    });
  }

  saveStatements(statements: Statement[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let tcStatements = null;
      try {
        tcStatements = statements.map((s) => new TinCan.Statement(s));
      } catch (err) {
        return reject(new InvalidXapiFormatError(err.message));
      }
      this._lrs.saveStatements(tcStatements, {
        callback: (err: any, xhr: { response: string }) => {
          if (err) {
            return reject(err);
          }
          const ids =
            typeof xhr.response === 'string'
              ? (JSON.parse(xhr.response) as string[])
              : (xhr.response as string[]);
          return resolve(ids);
        },
      });
    });
  }
}

let _lrsInstance: TinCanLRS | null = null;

export function findLRS(): Promise<LRS> {
  if (!_lrsInstance) {
    _lrsInstance = new TinCanLRS();
  }
  return Promise.resolve(_lrsInstance);
}

export function user2XapiAgent(user: { name: string; id: string }): Agent {
  return {
    name: user.name,
    account: {
      name: `${user.id}`, // make sure gets treated as a string here
      homePage: PalIri.resolve('users'),
    },
  };
}
