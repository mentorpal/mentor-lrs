/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Statement, Activity } from "@gradiant/xapi-dsl";

interface IriToIdFunction {
  (iri: string): string;
}

interface FindByIdFunction<T> {
  (id: string): Promise<T>;
}

export function regexToIdToIriFunction(idRegex: RegExp): IriToIdFunction {
  return (iri: string): string => {
    const m = iri.match(idRegex);
    return m && m.length > 0 ? m[1] : "";
  };
}

export interface StatementAndObject<T> {
  objectId: string;
  statement: Statement;
  object?: T;
}

export class StatementObjectFinder<T> {
  iriToId: IriToIdFunction;
  findById: FindByIdFunction<T>;

  constructor(config: {
    iriToId: IriToIdFunction | RegExp;
    findById: FindByIdFunction<T>;
  }) {
    this.iriToId =
      config.iriToId instanceof RegExp
        ? regexToIdToIriFunction(config.iriToId as RegExp)
        : (config.iriToId as IriToIdFunction);
    this.findById = config.findById;
  }

  async findTargetObjects(
    statements: Statement[]
  ): Promise<StatementAndObject<T>[]> {
    const result = statements.map((s): StatementAndObject<T> => {
      const curObj = s.object as Activity;
      if (!curObj) {
        return { objectId: "", statement: s };
      }
      return { objectId: this.iriToId(curObj.id), statement: s };
    });
    for (let i = 0; i < result.length; i++) {
      if (!result[i].objectId) {
        continue;
      }
      result[i].object = await this.findById(result[i].objectId);
    }
    return result;
  }
}
