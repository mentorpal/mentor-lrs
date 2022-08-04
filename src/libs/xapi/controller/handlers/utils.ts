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
