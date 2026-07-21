import { useEffect, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import "./ListingPage.css";

function ListingPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        setError(null);

        fetchProperties({ limit: 20, offset: 0 }).then((result) => {
            if (!cancelled) {
                setData(result);
                setLoading(false);
            }
        }).catch((e) => {
            if (!cancelled) {
                setError(e.message);
                setLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return <div className="listing-status">Loading properties...</div>
    }

    if (error) {
        return <div className="listing-status listing-status--error">Failed to load properties: {error}</div> 
    }

    return (
        <div className="listing-page">
            <div className="listing-page__header">
                <h1>Properties</h1>
                <p className="listing-page_count">
                    Showing {data.results.length} of {data.total} properties
                </p>
            </div>
            <div className="listing-page__grid">
                {data.results.map((property) => (
                    <PropertyCard key={property.L_ListingID} property={property}/>
                ))}
            </div>
        </div>
    );
}

export default ListingPage;