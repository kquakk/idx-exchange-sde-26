import { getFirstPhoto } from "../utils/photos";
import "./PropertyCard.css";

function formatPrice(price) {
    if (!price) {
        return "Price on request";
    }

    return `$${Number(price).toLocaleString()}`;
}

function PropertyCard({ property }) {
    const photo = getFirstPhoto(property.L_Photos);
    const price = formatPrice(property.L_SystemPrice);
    const beds = property.beds ?? property.L_Keyword2 ?? "-";
    const baths = property.baths ?? property.LM_Dec_3 ?? "-";
    const sqft = property.sqft ?? property.LM_Int2_3;

    return (
        <div className="property-card">
            <img
                src={photo}
                alt={property.L_Address || "Property"}
                className="property-card__photo"
            />
            
            <div className="property-card__body">
                <div className="property-card__price">{price}</div>
                <div className="property-card__specs">
                    <span>{beds} bed</span>
                    <span>{baths} bath</span>
                    {sqft && <span>{Number(sqft).toLocaleString()} sqft</span>}
                </div>
                <div className="property-card__address">
                    {property.L_Address}
                </div>
                <div className="property-card__location">
                    {property.L_City}, {property.L_State} {property.L_Zip}
                </div>
            </div>
        </div>
    );
}

export default PropertyCard;