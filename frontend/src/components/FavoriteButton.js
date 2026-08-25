import useFavorites from "../hooks/useFavorites";
import PropTypes from "prop-types";
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

FavoriteButton.propTypes = {
    listingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
};

export default FavoriteButton;