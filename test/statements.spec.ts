/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import chai, { expect } from "chai";
import * as sinon from "sinon";
import * as xapi from "../src/libs/xapi";
import { toBasicAuthToken } from "../src/libs/user";
import datestr from "../src/libs/utils/datestr";
import exampleStatements from "./fixture.statements";
import { statementsGet } from "../src/functions/statements/get/handler";
import { statementsPost } from "../src/functions/statements/post/handler";
import { statementsPut } from "../src/functions/statements/put/handler";
import { wrapHandlerTestRequest } from "../src/utils";

chai.use(require("sinon-chai"));
let lrsMock: any = null;
let auth: string = "";
const username = "user1";
const userid = "user1Id";

describe("xapi/statements", () => {
  beforeEach(async () => {
    lrsMock = {
      saveStatements: sinon.stub(),
      fetchStatements: sinon.stub(),
    };
    sinon.stub(xapi, "findLRS").callsFake(() => lrsMock);

    auth =
      "Basic " +
      toBasicAuthToken({
        name: username,
        id: userid,
        expiresAt: datestr(new Date(Date.now() + 60 * 60 * 24)),
      });
  });

  afterEach(async () => {
    auth = "";
    sinon.restore();
  });

  describe("GET", () => {
    it("fetches statements for the authenciated user from the lrs backend", async () => {
      const statements = exampleStatements(username, userid, true);
      lrsMock.fetchStatements.returns(statements);
      const request = wrapHandlerTestRequest({
        headers: {
          Authorization: auth,
        },
        queryStringParameters: {},
      });
      const response = await statementsGet(
        request.event,
        request.context,
        request.callback
      );
      if (!response) {
        throw new Error("response is undefined");
      }
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.eql(JSON.stringify(statements));
    });
  });

  describe("POST", () => {
    it("posts statements from the authenciated user to the lrs backend", async () => {
      const statements = exampleStatements(username, userid, true);
      const request = wrapHandlerTestRequest({
        headers: {
          Authorization: auth,
        },
        queryStringParameters: {},
        body: JSON.stringify(statements),
      });
      const response = await statementsPost(
        request.event,
        request.context,
        request.callback
      );
      if (!response) {
        throw new Error("response is undefined");
      }
      expect(response.statusCode).to.equal(200);
    });
  });

  describe("PUT", () => {
    it("puts single statement from the authenciated user to the lrs backend", async () => {
      const statements = exampleStatements(username, userid, true);
      const statement = {
        ...statements[0],
        id: "id is required",
      };
      const request = wrapHandlerTestRequest({
        headers: {
          Authorization: auth,
        },
        queryStringParameters: {},
        body: JSON.stringify(statement),
      });
      const response = await statementsPut(
        request.event,
        request.context,
        request.callback
      );
      if (!response) {
        throw new Error("response is undefined");
      }
      expect(response.statusCode).to.equal(204);
    });
  });
});
