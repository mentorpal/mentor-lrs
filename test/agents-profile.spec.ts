/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import chai, { expect } from "chai";
import * as sinon from "sinon";
import { agentsProfile } from "../src/functions/agentsProfile/handler";
import { toBasicAuthToken } from "../src/libs/user";
import datestr from "../src/libs/utils/datestr";
import * as xapi from "../src/libs/xapi";
import { wrapHandlerTestRequest } from "../src/utils";

chai.use(require("sinon-chai"));

let lrsMock: any = null;
let auth: string = "";
const username = "user1";
const userid = "user1Id";

describe("xapi/activities/state", () => {
  beforeEach(async () => {
    lrsMock = {
      saveStatements: sinon.stub(),
      fetchStatements: sinon.stub(),
      fetchActivityState: sinon.stub(),
      fetchAgentProfile: sinon.stub(),
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
    it("fetches empty profile when lrs returns none", async () => {
      lrsMock.fetchActivityState.returns({});
      const profileId = "profileId1";

      const request = wrapHandlerTestRequest({
        headers: {
          Authorization: auth,
        },
        queryStringParameters: {
          profileId: profileId,
        },
      });

      const response = await agentsProfile(
        request.event,
        request.context,
        request.callback
      );
      if (!response) {
        throw new Error("response is undefined");
      }
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.eql("{}");
    });

    it("fails with 400 response if query param profileId is missing", async () => {
      const request = wrapHandlerTestRequest({
        headers: {
          Authorization: auth,
        },
        queryStringParameters: {},
      });
      const response = await agentsProfile(
        request.event,
        request.context,
        request.callback
      );
      if (!response) {
        throw new Error("response is undefined");
      }
      expect(response.statusCode).to.equal(400);
      expect(response.body).to.eql(
        `"missing required query param 'profileId'"`
      );
    });
  });
});
