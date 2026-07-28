import { fetchProperties, fetchPropertyDetail } from "./client";

describe("API client", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test("fetchProperties returns parsed JSON on success", async () => {
        const mockData = {
            total: 2,
            limit: 20,
            offset: 0,
            results: [{ L_ListingID: "1" }, { L_ListingID: "2" }],
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        });

        const result = await fetchProperties();
        expect(result).toEqual(mockData);
        expect(global.fetch).toHaveBeenCalledWith("/api/properties");
    });

    test("fetchProperties appends query params to the URL", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ total: 0, results: [] }),
        });

        await fetchProperties({ city: "Portland", beds: 3 });

        const calledUrl = global.fetch.mock.calls[0][0];
        expect(calledUrl).toContain("city=Portland");
        expect(calledUrl).toContain("beds=3");
    });

    test("fetchProperties throws with server error message on non-2xx response", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: "limit must be an integer" }),
        });

        await expect(fetchProperties()).rejects.toThrow("limit must be an integer");
    });

    test("fetchPropertyDetail hits the correct URL", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ L_ListingID: "abc" }),
        });

        await fetchPropertyDetail("abc");
        expect(global.fetch).toHaveBeenCalledWith("/api/properties/abc");
    });
});