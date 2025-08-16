const request = require('supertest');
const app = require('../app'); // import app.js
const assert = require('assert');

describe('GET /', function () {
  it('should return Hello World', async function () {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.text, 'Hello World');
  });
});
