import { useState } from "react";
import "./PropertyFilters.css";

const EMPTY_FILTERS = {
    city: "",
    zipcode: "",
    minPrice: "",
    maxPrice: "",
    beds: "",
    baths: "",
};

function PropertyFilters({ onSearch, onClear }) {
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const updateField = (field) => (e) => {
        setFilters({ ...filters, [field]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefaults();

        const cleaned = {};
        for (const [key, value] of Object.entries(filters)) {
            if (value !== "" && value !== null && value !== undefined) {
                cleaned[key] = value;
            }
        }

        onSearch(cleaned);
    };

    const handleClear = () => {
        setFilters(EMPTY_FILTERS);
        onClear();
    };

    return (
        <form className="filters" onSubmit={handleSearch}>
            <input 
                type="text"
                placeholder="city"
                value={filters.city}
                onChange={updateField("city")}
                aria-label="City"
            />
            <input
                type="text"
                placeholder="zipcode"
                value={filters.zipcode}
                onChange={updateField("zipcode")}
                aria-label="zipcode"
            />
            <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={updateField("minPrice")}
                aria-label="Min Price"
                min="0"
            />
            <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={updateField("maxPrice")}
                aria-label="Max Price"
                min="0"
            />
            <select
                value={filters.beds}
                onChange={updateField("beds")}
                aria-label="Beds"
            >
                <option value="">Any Beds</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
            </select>
            <select
                value={filters.baths}
                onChange={updateField("baths")}
                aria-label="Baths"
            >
                <option value="">Any Baths</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
            </select>
            <button type="submit" className="filters__button filters__button--primary">
                Search
            </button>
            <button
                type="button"
                onClick={handleClear}
                className="filters__button filters__button--secondary">
                    Clear Filters
            </button>
        </form>
    );
}

export default PropertyFilters;