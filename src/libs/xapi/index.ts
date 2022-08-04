import { Statement, Actor, Agent } from "@gradiant/xapi-dsl";
import { InvalidXapiFormatError } from "./errors";
import requireEnv from "../utils/require-env";
const TinCan = require("tincanjs");

export interface LRS {
  fetchActivityState(params: FetchActivityStateParams): Promise<any>;
  fetchAgentProfile(params: FetchAgentProfileParams): Promise<any>;
  fetchStatements(params: FetchStatementsParams): Promise<StatementResult>;
  saveStatements(statements: Statement[]): Promise<string[]>;
}

export interface FetchActivityStateParams {
  activityId: string;
  agent: Actor;
  registration: string;
  stateId: string;
}

export interface FetchAgentProfileParams {
  agent: Actor;
  profileId: string;
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

export interface HasAsVersionFunction<T> {
  asVersion: () => T;
}

class TinCanLRS implements LRS {
  _lrs: any;

  constructor() {
    const lrsEndpoint = requireEnv("LRS_ENDPOINT");
    const lrsUsername = requireEnv("LRS_USERNAME");
    const lrsPassword = requireEnv("LRS_PASSWORD");
    this._lrs = new TinCan.LRS({
      endpoint: lrsEndpoint,
      username: lrsUsername,
      password: lrsPassword,
      allowFail: false,
    });
  }

  fetchActivityState(params: FetchActivityStateParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this._lrs.retrieveState(params.stateId, {
        agent: new TinCan.Agent(params.agent),
        registration: params.registration,
        activity: new TinCan.Activity({
          id: params.activityId,
        }),
        callback: (err: any, state: any) => {
          if (err) {
            return reject(err);
          }
          return resolve(state);
        },
      });
    });
  }

  fetchAgentProfile(params: FetchAgentProfileParams): Promise<any> {
    return new Promise((resolve, reject) => {
      this._lrs.retrieveAgentProfile(params.profileId, {
        agent: new TinCan.Agent(params.agent),
        callback: (err: any, profile: any) => {
          if (err) {
            return reject(err);
          }
          return resolve(profile);
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
          // TinCan likes to convert xapi json into
          // instances of it's own domain-objects classes.
          // Make sure we're returning pure json to avoid
          // issues downstream
          const result: StatementResult = {
            statements: Array.isArray(sr.statements)
              ? sr.statements.map((s) =>
                  s instanceof TinCan.Statement
                    ? (s as any as HasAsVersionFunction<Statement>).asVersion()
                    : s
                )
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
            typeof xhr.response === "string"
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

const homePage =
  process.env["XAPI_ACCOUNT_HOMEPAGE"] ||
  "https://forgot-to-set-homepage/users";
export function user2XapiAgent(user: { name: string; id: string }): Agent {
  return {
    name: user.name,
    account: {
      name: `${user.id}`, // make sure gets treated as a string here
      homePage: homePage,
    },
  };
}
