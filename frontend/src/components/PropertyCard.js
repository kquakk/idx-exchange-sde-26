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

export default PropertyCard;