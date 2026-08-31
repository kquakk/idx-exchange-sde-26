import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PropertyCard from "./PropertyCard";

const property = {
    L_ListingID: "12345",
    L_Address: "123 Main St",
    L_City: "Portland",
    L_State: "OR",
    L_Zip: "97201",
    L_SystemPrice: 450000,
    L_Keyword2: 3,
    LM_Dec_3: 2,
    LM_Int2_3: 1800,
    L_Photos: JSON.stringify(["https://example.com/1.jpg"]),
};

function renderCard(overrides = {}) {
    return render(
        <MemoryRouter>
            <PropertyCard property={{ ...property, ...overrides }} />
        </MemoryRouter>
    );
}

describe("PropertyCard", () => {
    beforeEach(() => window.localStorage.clear());

    test("renders the formatted price", () => {
        renderCard();
        expect(screen.getByText("$450,000")).toBeInTheDocument();
    });

    test("renders the address and location", () => {
        renderCard();
        expect(screen.getByText("123 Main St")).toBeInTheDocument();
        expect(screen.getByText(/Portland, OR 97201/)).toBeInTheDocument();
    });

    test("renders beds, baths, and square footage", () => {
        renderCard();
        expect(screen.getByText("3 bd")).toBeInTheDocument();
        expect(screen.getByText("2 ba")).toBeInTheDocument();
        expect(screen.getByText("1,800 sqft")).toBeInTheDocument();
    });

    test("links to the detail page for this listing", () => {
        renderCard();
        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            "/property/12345"
        );
    });

    test("falls back gracefully when price is missing", () => {
        renderCard({ L_SystemPrice: null });
        expect(screen.getByText("Price on request")).toBeInTheDocument();
    });

    test("shows a dash when beds and baths are missing", () => {
        renderCard({ L_Keyword2: null, LM_Dec_3: null });
        expect(screen.getByText("— bd")).toBeInTheDocument();
        expect(screen.getByText("— ba")).toBeInTheDocument();
    });

    test("renders without crashing when photos are malformed", () => {
        expect(() => renderCard({ L_Photos: "{not json" })).not.toThrow();
    });

    test("renders without crashing when photos are null", () => {
        expect(() => renderCard({ L_Photos: null })).not.toThrow();
    });
});