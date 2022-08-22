/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { expect } from "chai";
import { describe, it } from "mocha";
import { auth } from "src/functions/auth/handler";
import { fromBasicAuthToken } from "src/libs/user";

describe("auth", () => {
  it("generates and returns auth token", async () => {
    const payload = {
      httpMethod: "POST",
      queryStringParameters: {
        username: "user1",
        userid: "user1Id",
      },
    };
    const response = await auth(payload);
    expect(response.statusCode).to.equal(200);
    const body = JSON.parse(response.body);
    expect(body).to.have.property("auth-token");
    const user = fromBasicAuthToken(body["auth-token"]);
    expect(user.name).to.eql("user1");
    expect(user.id).to.eql("user1Id");
  });

  it("fails with 400 response if username param is missing", async () => {
    const payload = {
      httpMethod: "POST",
      queryStringParameters: {
        userid: "user1Id",
      },
    };
    const response = await auth(payload);
    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response.body)).to.eql({
      message: "missing required query param 'username'",
    });
  });

  it("fails with 400 response if userid param is missing", async () => {
    const payload = {
      httpMethod: "POST",
      queryStringParameters: {
        username: "user1",
      },
    };
    const response = await auth(payload);
    expect(response.statusCode).to.equal(400);
    expect(JSON.parse(response.body)).to.eql({
      message: "missing required query param 'userid'",
    });
  });
});
