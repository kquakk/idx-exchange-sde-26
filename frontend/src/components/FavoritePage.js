import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPropertyDetail } from "../api/client";
import useFavorites from "../hooks/useFavorites";
import PropertyCard from "../components/PropertyCard";
import "./ListingPage.css";

function FavoritesPage() {
    const { favorites, count, clearFavorites } = useFavorites();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        if (favorites.length === 0) {
            setProperties([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        Promise.allSettled(favorites.map((id) => fetchPropertyDetail(id)))
            .then((results) => {
                if (cancelled) {
                    return;
                }

                const found = results
                    .filter((r) => r.status === "fulfilled")
                    .map((r) => r.value);
                setProperties(found);
                setLoading(false);
            })
            .catch((e) => {
                if (cancelled) {
                    return;
                }
                
                setError(e.message);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [favorites]);

    return (
        <div className="listing-page">
            <div className="listing-page__header">
                <Link to="/" className="listing-page__back">
                    ← Back to listings
                </Link>
                <h1>Favorites</h1>
                <p className="listing-page_count">
                    {count === 0
                        ? "You haven't saved any properties yet"
                        : `${count} saved ${count === 1 ? "property" : "properties"}`}
                </p>
                {count > 0 && (
                    <button
                        type="button"
                        className="listing-page__clear"
                        onClick={clearFavorites}
                    >
                        Clear all favorites
                    </button>
                )}
            </div>

            {loading && <div className="listing-status">Loading favorites...</div>}

            {error && !loading && (
                <div className="listing-status listing-status--error">
                    Failed to load favorites: {error}
                </div>
            )}

            {!loading && !error && count === 0 && (
                <div className="listing-status">
                    Tap the heart on any listing to save it here.
                </div>
            )}

            {!loading && !error && properties.length > 0 && (
                <div className="listing-page__grid">
                    {properties.map((property) => (
                        <PropertyCard
                            key={property.L_ListingID}
                            property={property}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavoritesPage;