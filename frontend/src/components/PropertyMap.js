import "./PropertyMap.css";

function PropertyMap({ latitude, longitude, address }) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    // Only render when we have real coordinates
    if (!latitude || !longitude || Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
    }

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    return (
        <div className="property-map">
            <div className="property-map__header">
                <h2>Location</h2>
                
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="property-map__directions"
                >
                    Get Directions
                </a>
            </div>

            {apiKey ? (
                <iframe
                    title={`Map of ${address || "property"}`}
                    src={embedUrl}
                    className="property-map__frame"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                />
            ) : (
                <div className="property-map__missing-key">
                    Map unavailable — REACT_APP_GOOGLE_MAPS_API_KEY is not set.
                </div>
            )}
        </div>
    );
}

export default PropertyMap;