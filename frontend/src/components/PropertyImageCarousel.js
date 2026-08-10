import { useState } from "react";
import { parsePhotos, PLACEHOLDER } from "../utils/photos";
import "./PropertyImageCarousel.css";

function PropertyImageCarousel({ rawPhotos, alt }) {
    const photos = parsePhotos(rawPhotos);
    const [index, setIndex] = useState(0);

    const hasPhotos = photos.length > 0;
    const currentSrc = hasPhotos ? photos[index] : PLACEHOLDER;

    const goPrev = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
    };

    const goNext = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));
    };

    return (
        <div className="carousel">
            <img
                src={currentSrc}
                alt={alt || "Property"}
                className="carousel__image"
                onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER;
                }}
            />

            {photos.length > 1 && (
                <>
                    <button
                        type="button"
                        className="carousel__arrow carousel__arrow--prev"
                        onClick={goPrev}
                        aria-label="Previous photo"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        className="carousel__arrow carousel__arrow--next"
                        onClick={goNext}
                        aria-label="Next photo"
                    >
                        ›
                    </button>
                    <div className="carousel__counter">
                        {index + 1} / {photos.length}
                    </div>
                </>
            )}
        </div>
    );
}

export default PropertyImageCarousel;