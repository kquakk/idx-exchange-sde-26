import { Link } from "react-router-dom";
import PropertyImageCarousel from "./PropertyImageCarousel";
import FavoriteButton from "./FavoriteButton";
import PropTypes from "prop-types";
import "./PropertyCard.css";

function formatPrice(price) {
    if (!price) return "Price on request";
    return `$${Number(price).toLocaleString()}`;
}

function PropertyCard({ property }) {
    const beds = property.beds ?? property.L_Keyword2 ?? "—";
    const baths = property.baths ?? property.LM_Dec_3 ?? "—";
    const sqft = property.sqft ?? property.LM_Int2_3;

    return (
        <Link to={`/property/${property.L_ListingID}`} className="property-card">
            <div className="property-card__media">
                <PropertyImageCarousel
                    rawPhotos={property.L_Photos}
                    alt={property.L_Address}
                />
                <FavoriteButton listingId={property.L_ListingID} />
            </div>
            <div className="property-card__body">
                <div className="property-card__price">
                    {formatPrice(property.L_SystemPrice)}
                </div>
                <div className="property-card__specs">
                    <span>{beds} bd</span>
                    <span>{baths} ba</span>
                    {sqft && <span>{Number(sqft).toLocaleString()} sqft</span>}
                </div>
                <div className="property-card__address">{property.L_Address}</div>
                <div className="property-card__location">
                    {property.L_City}, {property.L_State} {property.L_Zip}
                </div>
            </div>
        </Link>
    );
}

PropertyCard.propTypes = {
    property: PropTypes.shape({
        L_ListingID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
        L_Address: PropTypes.string,
        L_City: PropTypes.string,
        L_State: PropTypes.string,
        L_Zip: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        L_SystemPrice: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        L_Keyword2: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        LM_Dec_3: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        LM_Int2_3: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        L_Photos: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string),
        ]),
    }).isRequired,
};

PropertyFilters.propTypes = {
    onSearch: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

PropertySort.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

PropertyImageCarousel.propTypes = {
    rawPhotos: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    alt: PropTypes.string,
};
PropertyImageCarousel.defaultProps = {
    rawPhotos: null,
    alt: "Property",
};

PropertyImageGallery.propTypes = {
    rawPhotos: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    alt: PropTypes.string,
};

PropertyMap.propTypes = {
    latitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    longitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    address: PropTypes.string,
};

FavoriteButton.propTypes = {
    listingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
};

OpenHouseList.propTypes = {
    openHouses: PropTypes.arrayOf(
        PropTypes.shape({
            OpenHouseDate: PropTypes.string,
            OH_StartTime: PropTypes.string,
            OH_EndTime: PropTypes.string,
            all_data: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.object,
            ]),
        })
    ),
};

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PropertyCard;