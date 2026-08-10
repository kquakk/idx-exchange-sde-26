import { useEffect, useRef, useState } from "react";
import { parsePhotos, PLACEHOLDER } from "../utils/photos";
import "./PropertyImageGallery.css";

function PropertyImageGallery({ rawPhotos, alt }) {
    const photos = parsePhotos(rawPhotos);
    const [index, setIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const lightboxRef = useRef(null);

    const hasPhotos = photos.length > 0;

    const goPrev = () =>
        setIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
    const goNext = () =>
        setIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

    useEffect(() => {
        if (lightboxOpen && lightboxRef.current) {
            lightboxRef.current.focus();
        }
    }, [lightboxOpen]);

    const handleKeyDown = (e) => {
        if (e.key === "Escape") setLightboxOpen(false);
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
    };

    if (!hasPhotos) {
        return (
            <div className="gallery">
                <img src={PLACEHOLDER} alt={alt} className="gallery__main" />
            </div>
        );
    }

    return (
        <div className="gallery">
            <img
                src={photos[index]}
                alt={alt || "Property"}
                className="gallery__main"
                onClick={() => setLightboxOpen(true)}
                onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER;
                }}
            />

            {photos.length > 1 && (
                <div className="gallery__thumbs">
                    {photos.map((url, i) => (
                        <img
                            key={`${url}-${i}`}
                            src={url}
                            alt={`Thumbnail ${i + 1}`}
                            className={`gallery__thumb ${
                                i === index ? "gallery__thumb--active" : ""
                            }`}
                            onClick={() => setIndex(i)}
                            onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER;
                            }}
                        />
                    ))}
                </div>
            )}

            {lightboxOpen && (
                <div
                    className="lightbox"
                    ref={lightboxRef}
                    tabIndex={-1}
                    onKeyDown={handleKeyDown}
                    onClick={() => setLightboxOpen(false)}
                    role="dialog"
                    aria-label="Photo viewer"
                >
                    <button
                        className="lightbox__close"
                        onClick={() => setLightboxOpen(false)}
                        aria-label="Close"
                    >
                        ×
                    </button>

                    <button
                        className="lightbox__arrow lightbox__arrow--prev"
                        onClick={(e) => {
                            e.stopPropagation();
                            goPrev();
                        }}
                        aria-label="Previous photo"
                    >
                        ‹
                    </button>

                    <img
                        src={photos[index]}
                        alt={alt || "Property"}
                        className="lightbox__image"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        className="lightbox__arrow lightbox__arrow--next"
                        onClick={(e) => {
                            e.stopPropagation();
                            goNext();
                        }}
                        aria-label="Next photo"
                    >
                        ›
                    </button>

                    <div className="lightbox__counter">
                        {index + 1} / {photos.length}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PropertyImageGallery;