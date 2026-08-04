import "./Pagination.css";

export function getPageItems(currentPage, totalPages) {

    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items = new Set();
    items.add(1);
    items.add(totalPages);

    for (let p = currentPage - 1; p <= currentPage + 1; p++) {
        if (p >= 1 && p <= totalPages) {
            items.add(p);
        }
    }

    if (currentPage <= 3) {
        items.add(2);
        items.add(3);
        items.add(4);
    }

    if (currentPage >= totalPages - 2) {
        items.add(totalPages - 1);
        items.add(totalPages - 2);
        items.add(totalPages - 3);
    }

    const sorted = Array.from(items).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
        result.push(sorted[i]);
        if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
            result.push("...");
        }
    }
    
    return result;
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    
    if (totalPages <= 1) {
        return null;
    }

    const items = getPageItems(currentPage, totalPages);

    return (
        <nav className="pagination" aria-label="Pagination">
            <button
                className="pagination__button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>

            {items.map((item, index) => {
                if (item === "...") {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="pagination__ellipsis"
                        >
                            ...
                        </span>
                    );
                }
                return (
                    <button
                        key={item}
                        className={`pagination__button ${
                            item === currentPage
                                ? "pagination__button--active"
                                : ""
                        }`}
                        onClick={() => onPageChange(item)}
                        aria-current={item === currentPage ? "page" : undefined}
                    >
                        {item}
                    </button>
                );
            })}

            <button
                className="pagination__button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </nav>
    );
}

export default Pagination;