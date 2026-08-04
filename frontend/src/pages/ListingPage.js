import { useEffect, useRef, useState } from "react";
import { fetchProperties } from "../api/client";
import PropertyCard from "../components/PropertyCard";
import PropertyFilter from "../components/PropertyFilters";
import Pagination from "../components/Pagination";
import "./ListingPage.css";

const ITEMS_PER_PAGE = 20;

function ListingPage() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilters, setActiveFilters] = useState({});

    const latestRequestId = useRef(0);

    const loadProperties = (filters, page) => {
        const requestId = ++latestRequestId.current;

        setLoading(true);
        setError(null);

        const offset = (page - 1) * ITEMS_PER_PAGE;

        fetchProperties({ limit: ITEMS_PER_PAGE, offset, ...filters })
            .then((result) => {
                if (requestId !== latestRequestId.current) return;
                setData(result);
                setLoading(false);
            })
            .catch((e) => {
                if (requestId !== latestRequestId.current) return;
                setError(e.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadProperties({}, 1);
    }, []);

    const handleSearch = (filters) => {
        setActiveFilters(filters);
        setCurrentPage(1);
        loadProperties(filters, 1);
    };

    const handleClear = () => {
        setActiveFilters({});
        setCurrentPage(1);
        loadProperties({}, 1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        loadProperties(activeFilters, newPage);
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