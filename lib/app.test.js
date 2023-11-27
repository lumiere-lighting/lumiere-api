// Dependencies
import request from 'supertest';
import app from './app.js';

describe("App basics", () => {
  // test("root route returns 200", async () => {
  //   const response = await request(app).get("/");
  //   expect(response.headers["content-type"]).toMatch(/json/);
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.success).toBe(true);
  // });

  test("colors route returns 200", async () => {
    const response = await request(app).get("/colors");
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.results.length > 1000).toBe(true);
  });
});
