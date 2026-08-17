import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilter from "../components/PropertyFilters";
import Pagination from "../components/Pagination";
import PropertySort, { parseSortValue } from "../components/PropertySort";
import useFavorites from "../hooks/useFavorites";
import "./ListingPage.css";

const ITEMS_PER_PAGE = 20;

function ListingPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilters, setActiveFilters] = useState({});
    const [sortValue, setSortValue] = useState("");

    const { count: favoritesCount } = useFavorites();
    const latestRequestId = useRef(0);

    const loadProperties = (filters, page, sort) => {
        const requestId = ++latestRequestId.current;

        setLoading(true);
        setError(null);

        const offset = (page - 1) * ITEMS_PER_PAGE;

        fetchProperties({
            limit: ITEMS_PER_PAGE,
            offset,
            ...filters,
            ...parseSortValue(sort),
        })
            .then((result) => {
                if (requestId !== latestRequestId.current) {
                    return;
                }

                setData(result);
                setLoading(false);
            })
            .catch((e) => {
                if (requestId !== latestRequestId.current) {
                    return;
                }
                
                setError(e.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadProperties({}, 1, "");
    }, []);

    const handleSearch = (filters) => {
        setActiveFilters(filters);
        setCurrentPage(1);
        setSortValue("");
        loadProperties(filters, 1, "");
    };

    const handleClear = () => {
        setActiveFilters({});
        setCurrentPage(1);
        setSortValue("");
        loadProperties({}, 1, "");
    };

    const handleSortChange = (nextSort) => {
        setSortValue(nextSort);
        setCurrentPage(1);
        loadProperties(activeFilters, 1, nextSort);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        loadProperties(activeFilters, newPage, sortValue);
        window.scrollTo(0, 0);
    };

    const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;
    const startIndex = data ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0;
    const endIndex = data
        ? Math.min(currentPage * ITEMS_PER_PAGE, data.total)
        : 0;

    return (
        <div className="listing-page">
            <div className="listing-page__header">
                <h1>Properties</h1>
            </div>

            <PropertyFilter onSearch={handleSearch} onClear={handleClear} />

            <div className="listing-page__toolbar">
                <Link to="/favorites" className="listing-page__favorites-link">
                    ♥ Favorites ({favoritesCount})
                </Link>
                <PropertySort value={sortValue} onChange={handleSortChange} />
            </div>

            {loading && <div className="listing-status">Loading properties...</div>}

            {error && !loading && (
                <div className="listing-status listing-status--error">
                    Failed to load properties: {error}
                </div>
            )}

            {!loading && !error && data && (
                <>
                    <p className="listing-page_count">
                        {data.total === 0
                            ? "No properties found"
                            : `Showing ${startIndex}-${endIndex} of ${data.total} properties`}
                    </p>

                    {data.results.length === 0 ? (
                        <div className="listing-status">
                            No properties found. Try adjusting your filters.
                        </div>
                    ) : (
                        <>
                            <div className="listing-page__grid">
                                {data.results.map((property) => (
                                    <PropertyCard
                                        key={property.L_ListingID}
                                        property={property}
                                    />
                                ))}
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default ListingPage;