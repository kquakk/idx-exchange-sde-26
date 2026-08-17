import "./PropertySort.css";

export const SORT_OPTIONS = [
    { value: "", label: "Default" },
    { value: "price:asc", label: "Price: Low to High" },
    { value: "price:desc", label: "Price: High to Low" },
    { value: "dateListed:desc", label: "Newest First" },
    { value: "dateListed:asc", label: "Oldest First" },
    { value: "sqft:desc", label: "Largest First" },
    { value: "sqft:asc", label: "Smallest First" },
    { value: "beds:desc", label: "Most Beds" },
];

export function parseSortValue(value) {
    if (!value) {
        return {};
    }
    
    const [sortBy, sortOrder] = value.split(":");
    return { sortBy, sortOrder };
}

function PropertySort({ value, onChange }) {
    return (
        <div className="sort">
            <label htmlFor="sort-select" className="sort__label">
                Sort by
            </label>
            <select
                id="sort-select"
                className="sort__select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default PropertySort;