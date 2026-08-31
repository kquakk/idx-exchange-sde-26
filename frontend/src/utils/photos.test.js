import { parsePhotos, getFirstPhoto, PLACEHOLDER } from "./photos";

describe("parsePhotos", () => {
    test("parses a valid JSON array of URLs", () => {
        const raw = JSON.stringify([
            "https://example.com/1.jpg",
            "https://example.com/2.jpg",
        ]);
        expect(parsePhotos(raw)).toEqual([
            "https://example.com/1.jpg",
            "https://example.com/2.jpg",
        ]);
    });

    test("returns empty array for null", () => {
        expect(parsePhotos(null)).toEqual([]);
    });

    test("returns empty array for empty string", () => {
        expect(parsePhotos("")).toEqual([]);
    });

    test("returns empty array for an empty JSON array", () => {
        expect(parsePhotos("[]")).toEqual([]);
    });

    test("filters out null and empty entries inside the array", () => {
        const raw = JSON.stringify([
            "https://example.com/1.jpg",
            null,
            "",
            "  ",
            "https://example.com/2.jpg",
        ]);
        expect(parsePhotos(raw)).toEqual([
            "https://example.com/1.jpg",
            "https://example.com/2.jpg",
        ]);
    });

    test("handles malformed JSON without throwing", () => {
        expect(() => parsePhotos("{not valid json")).not.toThrow();
        expect(parsePhotos("{not valid json")).toEqual([]);
    });

    test("treats a bare URL string as a single-photo array", () => {
        expect(parsePhotos("https://example.com/only.jpg")).toEqual([
            "https://example.com/only.jpg",
        ]);
    });

    test("handles an already-parsed array", () => {
        expect(parsePhotos(["https://example.com/1.jpg"])).toEqual([
            "https://example.com/1.jpg",
        ]);
    });
});

describe("getFirstPhoto", () => {
    test("returns the first URL when photos exist", () => {
        const raw = JSON.stringify(["https://example.com/1.jpg", "https://example.com/2.jpg"]);
        expect(getFirstPhoto(raw)).toBe("https://example.com/1.jpg");
    });

    test("returns the placeholder when there are no photos", () => {
        expect(getFirstPhoto(null)).toBe(PLACEHOLDER);
        expect(getFirstPhoto("[]")).toBe(PLACEHOLDER);
        expect(getFirstPhoto("garbage")).toBe(PLACEHOLDER);
    });
});