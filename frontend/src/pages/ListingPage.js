import { useEffect, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilter from "../components/PropertyFilters";
import "./ListingPage.css";

function ListingPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const latestRequestId = useRef(0);

    const loadProperties = (filters = {}) => {
        const requestId = ++latestRequestId.current;

        setLoading(true);
        setError(null);

        fetchProperties({ limit: 20, offset: 0, ...filters }).then((result) => {
            if (requestId !== latestRequestId.current) {
                return;
            }
            setData(result);
            setLoading(false);
        }).catch((e) => {
            if (requestId !== latestRequestId.current) {
                return;
            }
            setError(e.message);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadProperties();
    }, []);

    return (
        <div className="listing-page">
            <div className="listing-page__header">
                <h1>Properties</h1>
            </div>

            <PropertyFilter
                onSearch={loadProperties}
                onClear={() => loadProperties()}
            />

            {loading && (
                <div className="listing-status">Loading properties...</div>
            )}

            {error && !loading && (
                <div className="listing-status listing-status--error">
                    Failed to load properties: {error}
                </div>
            )}

            {!loading && !error && data && (
                <>
                    <p className="listing-page_count">
                        Showing {data.results.length} of {data.total} properties
                    </p>

                    {data.results.length === 0 ? (
                        <div className="listing-status">
                            No properties found. Try adjusting your filters.
                        </div>
                    ) : (
                        <div className="listing-page__grid">
                            {data.results.map((property) => (
                                <PropertyCard
                                    key={property.L_ListingID}
                                    property={property}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}