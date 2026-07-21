export function getFirstPhoto(rawPhotos) {
    try {
        const parsed = JSON.parse(rawPhotos);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
            return parsed[0]
        }
    } catch {
        if (typeof rawPhotos === "string" && rawPhotos.startsWith("http")) {
            return rawPhotos;
        }
    }
}