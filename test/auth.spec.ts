import { expect } from 'chai';
import { describe, it } from 'mocha';
import { auth } from 'src/functions/auth/handler'
import { fromBasicAuthToken } from 'src/libs/user'

describe('auth', ()=>{
    it('generates and returns auth token', async ()=>{
        const payload = {
            httpMethod: "POST",
            queryStringParameters: {
                "username": "user1",
                "userid": "user1Id",
            },
        };
        const response = await auth(payload);
        expect(response.statusCode).to.equal(200);
        const body = JSON.parse(response.body)
        expect(body).to.have.property('auth-token');
        const user = fromBasicAuthToken(body['auth-token']);
        expect(user.name).to.eql("user1");
        expect(user.id).to.eql("user1Id");
    });

    it('fails with 400 response if username param is missing', async () => {
        const payload = {
            httpMethod: "POST",
            queryStringParameters: {
                "userid": "user1Id",
            },
        };
        const response = await auth(payload);
        expect(response.statusCode).to.equal(400);
        expect(JSON.parse(response.body)).to.eql({
          message: "missing required query param 'username'"
        });
      });

      it('fails with 400 response if userid param is missing', async () => {
        const payload = {
            httpMethod: "POST",
            queryStringParameters: {
                "username": "user1",
            },
        };
        const response = await auth(payload);
        expect(response.statusCode).to.equal(400);
        expect(JSON.parse(response.body)).to.eql({
          message: "missing required query param 'userid'"
        });
      });
});