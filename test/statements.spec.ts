import chai, { expect } from 'chai';
import * as sinon from 'sinon';
import * as xapi from '../src/libs/xapi';
import { toBasicAuthToken } from '../src/libs/user';
import datestr from '../src/libs/utils/datestr';
import exampleStatements from './fixture.statements';
import {statementsGet} from '../src/functions/statements/get/handler'

chai.use(require('sinon-chai'));
let lrsMock: any = null;
let auth: string = null;
const username = "user1";
const userid = "user1Id"

describe('xapi/statements', () => {
  beforeEach(async () => {
    lrsMock = {
      saveStatements: sinon.stub(),
      fetchStatements: sinon.stub(),
    };
    sinon.stub(xapi, 'findLRS').callsFake(() => lrsMock);

    auth = "Basic " + toBasicAuthToken({
        name: username,
        id: userid,
        expiresAt: datestr(new Date(Date.now() + 60 * 60 * 24)),});
  });

  afterEach(async () => {
    auth = null;
    sinon.restore();
  });

  describe('GET', () => {
    it('fetches statements for the authenciated user from the lrs backend', async () => {
      const statements = exampleStatements(username, userid, true);
      lrsMock.fetchStatements.returns(statements);
      const request = {
          headers: {
              "Authorization": auth,
          },
          queryStringParameters: {},

      };
      const response = await statementsGet(request);
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.eql(JSON.stringify(statements));
    });
  });
});