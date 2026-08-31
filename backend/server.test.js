jest.mock("./db/pool", () => ({ query: jest.fn() }));

const request = require("supertest");
const app = require("./server");
const pool = require("./db/pool");

beforeEach(() => jest.clearAllMocks());

describe("GET /api/health", () => {
    test("reports connected when the database responds", async () => {
        pool.query.mockResolvedValueOnce([[{ "1": 1 }], []]);

        const res = await request(app).get("/api/health");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "ok", database: "connected" });
    });

    test("returns 500 without crashing when the database is unreachable", async () => {
        pool.query.mockRejectedValueOnce(new Error("ECONNREFUSED"));

        const res = await request(app).get("/api/health");

        expect(res.status).toBe(500);
        expect(res.body.database).toBe("disconnected");
    });
});