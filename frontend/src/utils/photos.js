export const PLACEHOLDER = "https://via.placeholder.com/400x300?text=No+Photo";

// L_Photos is a TEXT column holding a JSON array, but the source MLS feed
// is inconsistent: rows arrive as null, as an empty string, as valid JSON,
// as an array containing nulls, and occasionally as a bare URL that was
// never serialized. An unguarded JSON.parse throws on several of those and
// takes down the whole listings grid, so every branch returns an array.
export function parsePhotos(rawPhotos) {
    if (!rawPhotos) {
        return [];
    }

    if (Array.isArray(rawPhotos)) {
        return rawPhotos.filter((url) => typeof url === "string" && url.trim());
    }

    if (typeof rawPhotos !== "string") {
        return [];
    }

    try {
        const parsed = JSON.parse(rawPhotos);
        if (Array.isArray(parsed)) {
            return parsed.filter((url) => typeof url === "string" && url.trim());
        }
        if (typeof parsed === "string" && parsed.trim()) {
            return [parsed];
        }

        return [];
    } catch {
        return rawPhotos.startsWith("http") ? [rawPhotos] : [];
    }
}

export function getFirstPhoto(rawPhotos) {
    const photos = parsePhotos(rawPhotos);
    return photos[0] || PLACEHOLDER;
}