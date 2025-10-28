import chai, { expect } from "chai";
import * as sinon from "sinon";
import XAPI from "@xapi/xapi";
import { mentorpalPlaybackStatements } from "./fixture.statements";
import { main as recommenderHandler } from "../src/functions/recommender/handler";
import { wrapHandlerTestRequest } from "../src/utils";

chai.use(require("sinon-chai"));

describe("recommender endpoint", () => {
  let xapiStub: sinon.SinonStubbedInstance<XAPI>;

  beforeEach(async () => {
    // Stub the XAPI getStatements method
    xapiStub = sinon.createStubInstance(XAPI);
    sinon
      .stub(XAPI.prototype, "getStatements")
      .callsFake(xapiStub.getStatements);

    // Set up environment variables
    process.env.LRS_ENDPOINT = "https://test-lrs.example.com";
    process.env.LRS_USERNAME = "testuser";
    process.env.LRS_PASSWORD = "testpass";
  });

  afterEach(async () => {
    sinon.restore();
    delete process.env.LRS_ENDPOINT;
    delete process.env.LRS_USERNAME;
    delete process.env.LRS_PASSWORD;
  });

  describe("GET recommender", () => {
    it("returns top N recommended fields based on confident answer playback statements", async () => {
      const name = "testuser@example.com";
      const mbox = "mailto:testuser@example.com";
      const sessionId = "test-session-123";
      const timestampStart = "2024-01-01T00:00:00.000Z";
      const numResults = 3;

      const statements = mentorpalPlaybackStatements(name, sessionId, 10);
      xapiStub.getStatements.resolves({
        data: {
          statements: statements as any,
        },
      } as any);

      const request = wrapHandlerTestRequest({
        httpMethod: "GET",
        path: "/recommender",
        queryStringParameters: {
          name,
          mbox,
          sessionId,
          timestampStart,
          numResults: String(numResults),
        },
      });

      const response = await recommenderHandler(
        request.event,
        request.context,
        request.callback
      );

      if (!response) {
        throw new Error("response is undefined");
      }
      expect(response.statusCode).to.equal(200);

      const body = JSON.parse(response.body);
      expect(body).to.be.an("array");
      expect(body.length).to.be.at.most(numResults);

      // Verify structure of results
      if (body.length > 0) {
        expect(body[0]).to.have.property("field");
        expect(body[0]).to.have.property("score");
        expect(body[0].score).to.be.a("number");
      }

      // Verify XAPI was called with correct parameters
      expect(xapiStub.getStatements.calledOnce).to.be.true;
      const callArgs = xapiStub.getStatements.firstCall.args[0];
      expect(callArgs.agent.name).to.equal(name);
      expect(callArgs.agent.mbox).to.equal(mbox);
      expect(callArgs.since).to.equal(timestampStart);
    });
  });
});
