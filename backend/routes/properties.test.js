jest.mock("../db/pool", () => ({
    query: jest.fn(),
}));

const request = require("supertest");
const app = require("../server");
const pool = require("../db/pool");

const asResult = (rows) => [rows, []];

const sampleProperty = {
    L_ListingID: "12345",
    L_Address: "123 Main St",
    L_City: "Portland",
    L_State: "OR",
    L_Zip: "97201",
    L_SystemPrice: "450000.00",
    L_Keyword2: 3,
    LM_Dec_3: "2.0",
    LM_Int2_3: 1800,
    L_Photos: JSON.stringify(["https://example.com/1.jpg"]),
    LMD_MP_Latitude: "45.5231",
    LMD_MP_Longitude: "-122.6765",
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("GET /api/properties", () => {
    test("returns paginated results with default limit and offset", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 87 }]))
            .mockResolvedValueOnce(asResult([sampleProperty]));

        const res = await request(app).get("/api/properties");

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({ total: 87, limit: 20, offset: 0 });
        expect(Array.isArray(res.body.results)).toBe(true);
    });

    test("passes limit and offset through to the query", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 87 }]))
            .mockResolvedValueOnce(asResult([]));

        const res = await request(app).get("/api/properties?limit=10&offset=20");

        expect(res.status).toBe(200);
        expect(res.body.limit).toBe(10);
        expect(res.body.offset).toBe(20);

        const [, values] = pool.query.mock.calls[1];
        expect(values.slice(-2)).toEqual([10, 20]);
    });

    test("filters by city using a case-insensitive comparison", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 5 }]))
            .mockResolvedValueOnce(asResult([sampleProperty]));

        await request(app).get("/api/properties?city=portland");

        const [countSql, countValues] = pool.query.mock.calls[0];
        expect(countSql).toContain("LOWER(TRIM(");
        expect(countValues).toContain("portland");
    });

    test("filters by zipcode", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 2 }]))
            .mockResolvedValueOnce(asResult([]));

        await request(app).get("/api/properties?zipcode=97201");

        const [sql, values] = pool.query.mock.calls[0];
        expect(sql).toContain("L_Zip = ?");
        expect(values).toContain("97201");
    });

    test("filters by minPrice and maxPrice", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 3 }]))
            .mockResolvedValueOnce(asResult([]));

        await request(app).get("/api/properties?minPrice=300000&maxPrice=800000");

        const [sql, values] = pool.query.mock.calls[0];
        expect(sql).toContain("L_SystemPrice >= ?");
        expect(sql).toContain("L_SystemPrice <= ?");
        expect(values).toEqual(expect.arrayContaining([300000, 800000]));
    });

    test("filters by beds and baths", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 1 }]))
            .mockResolvedValueOnce(asResult([]));

        await request(app).get("/api/properties?beds=3&baths=2");

        const [sql, values] = pool.query.mock.calls[0];
        expect(sql).toContain("L_Keyword2 >= ?");
        expect(sql).toContain("LM_Dec_3 >= ?");
        expect(values).toEqual(expect.arrayContaining([3, 2]));
    });

    test("combines multiple filters with AND", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 1 }]))
            .mockResolvedValueOnce(asResult([]));

        await request(app).get(
            "/api/properties?city=Portland&minPrice=300000&beds=3"
        );

        const [sql] = pool.query.mock.calls[0];
        expect(sql).toContain(" AND ");
    });

    test("does not drop a zero-valued minPrice filter", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 40 }]))
            .mockResolvedValueOnce(asResult([]));

        await request(app).get("/api/properties?minPrice=0&beds=3");

        const [sql, values] = pool.query.mock.calls[0];
        expect(sql).toContain("L_SystemPrice >= ?");
        expect(values).toContain(0);
    });

    test("uses identical filter values for the count and data queries", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 7 }]))
            .mockResolvedValueOnce(asResult([]));

        await request(app).get("/api/properties?city=Portland&beds=3");

        const [, countValues] = pool.query.mock.calls[0];
        const [, dataValues] = pool.query.mock.calls[1];

        expect(dataValues.slice(0, countValues.length)).toEqual(countValues);
    });

    test("uses parameterized queries rather than string interpolation", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ total: 0 }]))
            .mockResolvedValueOnce(asResult([]));

        await request(app).get("/api/properties?city=Portland';DROP TABLE x;--");

        const [sql, values] = pool.query.mock.calls[0];
        expect(sql).not.toContain("DROP TABLE");
        expect(values[0]).toContain("DROP TABLE");
    });

    describe("input validation", () => {
        test("rejects a non-numeric minPrice with 400", async () => {
            const res = await request(app).get("/api/properties?minPrice=abc");
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
            expect(pool.query).not.toHaveBeenCalled();
        });

        test("rejects limit=0 with 400", async () => {
            const res = await request(app).get("/api/properties?limit=0");
            expect(res.status).toBe(400);
        });

        test("rejects an oversized limit with 400", async () => {
            const res = await request(app).get("/api/properties?limit=200");
            expect(res.status).toBe(400);
        });

        test("rejects a negative offset with 400", async () => {
            const res = await request(app).get("/api/properties?offset=-5");
            expect(res.status).toBe(400);
        });

        test("rejects a non-integer limit with 400", async () => {
            const res = await request(app).get("/api/properties?limit=abc");
            expect(res.status).toBe(400);
        });

        test("rejects a negative beds value with 400", async () => {
            const res = await request(app).get("/api/properties?beds=-1");
            expect(res.status).toBe(400);
        });
    });

    test("returns 500 when the database query fails", async () => {
        pool.query.mockRejectedValueOnce(new Error("ECONNREFUSED"));

        const res = await request(app).get("/api/properties");

        expect(res.status).toBe(500);
        expect(JSON.stringify(res.body)).not.toContain("ECONNREFUSED");
    });
});

describe("GET /api/properties/:id", () => {
    test("returns the property when it exists", async () => {
        pool.query.mockResolvedValueOnce(asResult([sampleProperty]));

        const res = await request(app).get("/api/properties/12345");

        expect(res.status).toBe(200);
        expect(res.body.L_ListingID).toBe("12345");
    });

    test("returns 404 when the listing does not exist", async () => {
        pool.query.mockResolvedValueOnce(asResult([]));

        const res = await request(app).get("/api/properties/99999999");

        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });

    test("returns 400 for an ID with invalid characters", async () => {
        const res = await request(app).get("/api/properties/abc!@%23");
        expect(res.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("returns 400 for an oversized ID", async () => {
        const longId = "1".repeat(60);
        const res = await request(app).get(`/api/properties/${longId}`);
        expect(res.status).toBe(400);
    });

    test("returns 500 when the query fails", async () => {
        pool.query.mockRejectedValueOnce(new Error("connection lost"));

        const res = await request(app).get("/api/properties/12345");
        expect(res.status).toBe(500);
    });
});

describe("GET /api/properties/:id/openhouses", () => {
    test("returns open houses for an existing property", async () => {
        const openHouse = {
            L_ListingID: "12345",
            OpenHouseDate: "2026-09-12",
            OH_StartTime: "13:00:00",
            OH_EndTime: "15:00:00",
            all_data: JSON.stringify({ OpenHouseRemarks: "Refreshments" }),
        };

        pool.query
            .mockResolvedValueOnce(asResult([{ L_ListingID: "12345" }]))
            .mockResolvedValueOnce(asResult([openHouse]));

        const res = await request(app).get("/api/properties/12345/openhouses");

        expect(res.status).toBe(200);
        expect(res.body.openHouses).toHaveLength(1);
    });

    test("returns an empty array when the property has no open houses", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ L_ListingID: "12345" }]))
            .mockResolvedValueOnce(asResult([]));

        const res = await request(app).get("/api/properties/12345/openhouses");

        expect(res.status).toBe(200);
        expect(res.body.openHouses).toEqual([]);
    });

    test("returns 404 when the property does not exist", async () => {
        pool.query.mockResolvedValueOnce(asResult([]));

        const res = await request(app).get("/api/properties/99999999/openhouses");

        expect(res.status).toBe(404);
    });

    test("orders results by date and start time", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ L_ListingID: "12345" }]))
            .mockResolvedValueOnce(asResult([]));

        await request(app).get("/api/properties/12345/openhouses");

        const [sql] = pool.query.mock.calls[1];
        expect(sql).toContain("ORDER BY");
        expect(sql).toContain("OpenHouseDate");
        expect(sql).toContain("OH_StartTime");
    });

    test("returns 400 for a malformed ID", async () => {
        const res = await request(app).get("/api/properties/bad!id/openhouses");
        expect(res.status).toBe(400);
    });

    test("returns malformed all_data as-is without crashing", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ L_ListingID: "12345" }]))
            .mockResolvedValueOnce(
                asResult([{ OpenHouseDate: "2026-09-12", all_data: "{broken" }])
            );

        const res = await request(app).get("/api/properties/12345/openhouses");

        expect(res.status).toBe(200);
        expect(res.body.openHouses[0].all_data).toBe("{broken");
    });

    test("returns 500 when the database fails", async () => {
        pool.query.mockRejectedValueOnce(new Error("timeout"));

        const res = await request(app).get("/api/properties/12345/openhouses");
        expect(res.status).toBe(500);
    });
});

describe("route ordering", () => {
    test("/:id/openhouses is matched before /:id", async () => {
        pool.query
            .mockResolvedValueOnce(asResult([{ L_ListingID: "12345" }]))
            .mockResolvedValueOnce(asResult([]));

        const res = await request(app).get("/api/properties/12345/openhouses");

        expect(res.body).toHaveProperty("openHouses");
        expect(res.body).not.toHaveProperty("L_Address");
    });
});