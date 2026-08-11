import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPropertyDetail, fetchOpenHouses } from "../api/client";
import PropertyImageGallery from "../components/PropertyImageGallery";
import PropertyMap from "../components/PropertyMap";
import OpenHouseList from "../components/OpenHouseList";
import "./PropertyDetailPage.css";

function formatPrice(price) {
    if (!price) {
        return "Price on request";
    }

    return `$${Number(price).toLocaleString()}`;
}

function PropertyDetailPage() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [openHouses, setOpenHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError(null);
        window.scrollTo(0, 0);

        fetchPropertyDetail(id)
            .then((prop) => {
                if (cancelled) return;
                setProperty(prop);
                return fetchOpenHouses(id)
                    .then((res) => {
                        if (!cancelled) setOpenHouses(res.openHouses || []);
                    })
                    .catch(() => {
                        if (!cancelled) setOpenHouses([]);
                    });
            })
            .catch((e) => {
                if (!cancelled) setError(e.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return <div className="detail-status">Loading property...</div>;
    }

    if (error) {
        return (
            <div className="detail-page">
                <Link to="/" className="detail-page__back">
                    ← Back to listings
                </Link>
                <div className="detail-status detail-status--error">
                    Could not load this property: {error}
                </div>
            </div>
        );
    }

    const beds = property.L_Keyword2;
    const baths = property.LM_Dec_3;
    const sqft = property.LM_Int2_3;

    return (
        <div className="detail-page">
            <Link to="/" className="detail-page__back">
                ← Back to listings
            </Link>

            <PropertyImageGallery
                rawPhotos={property.L_Photos}
                alt={property.L_Address}
            />

            <div className="detail-page__header">
                <div className="detail-page__price">
                    {formatPrice(property.L_SystemPrice)}
                </div>
                <div className="detail-page__address">
                    {property.L_Address}
                </div>
                <div className="detail-page__location">
                    {property.L_City}, {property.L_State} {property.L_Zip}
                </div>
            </div>

            <div className="detail-page__stats">
                <div className="stat">
                    <span className="stat__value">{beds ?? "—"}</span>
                    <span className="stat__label">Beds</span>
                </div>
                <div className="stat">
                    <span className="stat__value">{baths ?? "—"}</span>
                    <span className="stat__label">Baths</span>
                </div>
                <div className="stat">
                    <span className="stat__value">
                        {sqft ? Number(sqft).toLocaleString() : "—"}
                    </span>
                    <span className="stat__label">Sq Ft</span>
                </div>
                <div className="stat">
                    <span className="stat__value">
                        {property.YearBuilt || "—"}
                    </span>
                    <span className="stat__label">Year Built</span>
                </div>
            </div>

            {property.L_Remarks && (
                <div className="detail-page__section">
                    <h2>Description</h2>
                    <p className="detail-page__remarks">
                        {property.L_Remarks}
                    </p>
                </div>
            )}

            <div className="detail-page__section">
                <h2>Property Details</h2>
                <dl className="detail-page__facts">
                    <dt>Listing ID</dt>
                    <dd>{property.L_ListingID}</dd>
                    <dt>Lot Size</dt>
                    <dd>
                        {property.LotSizeAcres
                            ? `${property.LotSizeAcres} acres`
                            : "—"}
                    </dd>
                    <dt>Year Built</dt>
                    <dd>{property.YearBuilt || "—"}</dd>
                    <dt>ZIP Code</dt>
                    <dd>{property.L_Zip || "—"}</dd>
                </dl>
            </div>

            <PropertyMap
                latitude={property.LMD_MP_Latitude}
                longitude={property.LMD_MP_Longitude}
                address={property.L_Address}
            />

            <OpenHouseList openHouses={openHouses} />
        </div>
    );
}

export default PropertyDetailPage;