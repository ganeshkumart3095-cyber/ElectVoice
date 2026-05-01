const request = require('supertest');
const app = require('../index');

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  // Do not set GOOGLE_CSE_API_KEY to trigger mock data fallback
  delete process.env.GOOGLE_CSE_API_KEY;
  delete process.env.GOOGLE_CSE_CX;
});

describe('GET /api/news', () => {
  it('should return 200 with success status', async () => {
    const res = await request(app).get('/api/news');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should accept a custom query parameter', async () => {
    const res = await request(app).get('/api/news?q=EVM+voting+machine');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('each result should have required fields', async () => {
    const res = await request(app).get('/api/news');
    const newsItems = res.body.data;
    if (newsItems.length > 0) {
      expect(newsItems[0]).toHaveProperty('title');
      expect(newsItems[0]).toHaveProperty('link');
    }
  });
});

describe('GET /api/booths', () => {
  it('should return 200 with booths in data array', async () => {
    const res = await request(app).get('/api/booths?lat=28.6139&lng=77.2090');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return booths when constituency provided', async () => {
    const res = await request(app).get('/api/booths?constituency=New%20Delhi');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/timeline', () => {
  it('should return 200 with timeline in data array', async () => {
    const res = await request(app).get('/api/timeline');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('timeline items should have required fields', async () => {
    const res = await request(app).get('/api/timeline');
    const items = res.body.data;
    expect(items[0]).toHaveProperty('id');
    expect(items[0]).toHaveProperty('year');
    expect(items[0]).toHaveProperty('title');
  });
});
