const requestLogger = require("./logger");

describe("requestLogger", () => {
    let logSpy;

    beforeEach(() => {
        logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => logSpy.mockRestore());

    function makeMocks() {
        const handlers = {};
        const req = { method: "GET", originalUrl: "/api/properties?limit=5" };
        const res = {
            statusCode: 200,
            on: (event, cb) => {
                handlers[event] = cb;
            },
        };
        return { req, res, finish: () => handlers.finish() };
    }

    test("calls next so the request continues", () => {
        const next = jest.fn();
        const { req, res } = makeMocks();

        requestLogger(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test("logs nothing until the response finishes", () => {
        const { req, res } = makeMocks();

        requestLogger(req, res, jest.fn());

        expect(logSpy).not.toHaveBeenCalled();
    });

    test("logs method, URL, status code, and duration on finish", () => {
        const { req, res, finish } = makeMocks();

        requestLogger(req, res, jest.fn());
        finish();

        const line = logSpy.mock.calls[0][0];
        expect(line).toContain("GET");
        expect(line).toContain("/api/properties?limit=5");
        expect(line).toContain("200");
        expect(line).toMatch(/\d+ms/);
    });
});