import { Statement } from "@gradiant/xapi-dsl";
import { User } from "user";

export interface StatementHandler {
  handleStatements(user: User, statements: Statement[]): Promise<Statement[]>;
}
