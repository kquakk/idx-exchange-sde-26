import useFavorites from "../hooks/useFavorites";
import "./FavoriteButton.css";

function FavoriteButton({ listingId }) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const active = isFavorite(listingId);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(listingId);
    };

    return (
        <button
            type="button"
            className={`favorite-button ${active ? "favorite-button--active" : ""}`}
            onClick={handleClick}
            aria-label={active ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={active}
        >
            {active ? "♥" : "♡"}
        </button>
    );
}

export default FavoriteButton;