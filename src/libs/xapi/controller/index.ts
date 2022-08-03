import { Statement, AccountAgent } from '@gradiant/xapi-dsl';
import { findLRS } from 'xapi';
import { XapiWrongUser, InvalidXapiFormatError } from 'xapi/errors';
import { User } from 'user';

const handlers:
  | any[]
  | {
      handleStatements: (
        arg0: string,
        arg1: any[]
      ) => any[] | PromiseLike<any[]>;
    }[] = [];

/**
 * Save a group of xapi statements to the backend LRS,
 * and before doing the save, enrich the statemtents
 * with additional metadata, e.g. the names of lessons, types of resources.
 * @param statements
 */
export async function saveStatements(
  user: User,
  statements: Statement[]
): Promise<string[]> {
  statements.forEach(s => {
    const agent = s.actor as AccountAgent;
    if (!(agent && agent.account && agent.account.name)) {
      throw new InvalidXapiFormatError(
        `only valid account agents accepted but found ${JSON.stringify(
          s.actor
        )}`
      );
    }
    if (`${agent.account.name}` !== `${user.id}`) {
      throw new XapiWrongUser(
        `attempt to save record for user ${agent.account.name} when authorized user is ${user.id}`
      );
    }
  });
  const lrs = await findLRS();
  const now = Date.now();
  let enrichedStatements = [...statements].sort(s =>
    s.timestamp ? Date.parse(s.timestamp) : now
  );
  for (let i = 0; i < handlers.length; i++) {
    enrichedStatements = await handlers[i].handleStatements(
      user,
      enrichedStatements
    );
  }
  return await lrs.saveStatements(enrichedStatements);
}
