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