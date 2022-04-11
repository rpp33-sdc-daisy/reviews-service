const request = require('supertest');
const { app, server } = require ('./server.js');
const {db, queries} = require('./database/queries.js');

afterAll(() => {
  server.close();
  db.end();
});

describe('Jest test', () => {
  it('adds 2 + 2 equals 4', () => {
    expect(2 + 2).toBe(4);
  });
});

describe('GET Endpoints', () => {
  it('/reviews/ endpoint should return 200 status', async () => {
    const res = await request(app)
      .get('/reviews/?product_id=64621');

    expect(res.statusCode).toBe(200);
    expect(res.req.method).toBe('GET');
  });

  it('/reviews/meta endpoint should return 200 status', async () => {
    const res = await request(app)
      .get('/reviews/meta')
      .send({
        product_id: 64623
      });
    expect(res.statusCode).toEqual(200);
    expect(res.req.method).toBe('GET');
  });
});

describe('POST Endpoints', () => {
  it('/reviews endpoint should return 201 status', async () => {
    const res = await request(app)
      .post('/reviews/')
      .send({
        product_id: 64623
      });
    expect(res.statusCode).toEqual(201);
    expect(res.req.method).toBe('POST');
  });
});

describe('PUT Endpoints', () => {
  it('/reviews/:review_id/helpful endpoint should return 204 status', async () => {
    const res = await request(app)
      .put('/reviews/1/helpful');

    expect(res.statusCode).toEqual(204);
    expect(res.req.method).toBe('PUT');
  });

  it('/reviews/meta endpoint should return 204 status', async () => {
    const res = await request(app)
      .put('/reviews/1/report');

    expect(res.statusCode).toBe(204);
    expect(res.req.method).toBe('PUT');
  });
});
