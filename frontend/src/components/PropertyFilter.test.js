import { render, screen, fireEvent } from "@testing-library/react";
import PropertyFilters from "./PropertyFilters";

describe("PropertyFilters", () => {
    test("renders all filter inputs", () => {
        render(<PropertyFilters onSearch={() => {}} onClear={() => {}} />);

        expect(screen.getByLabelText("City")).toBeInTheDocument();
        expect(screen.getByLabelText("ZIP Code")).toBeInTheDocument();
        expect(screen.getByLabelText("Min Price")).toBeInTheDocument();
        expect(screen.getByLabelText("Max Price")).toBeInTheDocument();
        expect(screen.getByLabelText("Beds")).toBeInTheDocument();
        expect(screen.getByLabelText("Baths")).toBeInTheDocument();
    });

    test("submits only non-empty filter values", () => {
        const onSearch = jest.fn();
        render(<PropertyFilters onSearch={onSearch} onClear={() => {}} />);

        fireEvent.change(screen.getByLabelText("City"), {
            target: { value: "Portland" },
        });
        fireEvent.change(screen.getByLabelText("Min Price"), {
            target: { value: "300000" },
        });

        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        expect(onSearch).toHaveBeenCalledWith({
            city: "Portland",
            minPrice: "300000",
        });
    });

    test("Clear button resets fields and calls onClear", () => {
        const onClear = jest.fn();
        render(<PropertyFilters onSearch={() => {}} onClear={onClear} />);

        const cityInput = screen.getByLabelText("City");
        fireEvent.change(cityInput, { target: { value: "Portland" } });
        expect(cityInput.value).toBe("Portland");

        fireEvent.click(screen.getByRole("button", { name: /clear/i }));

        expect(cityInput.value).toBe("");
        expect(onClear).toHaveBeenCalled();
    });

    test("combines multiple filters when submitting", () => {
        const onSearch = jest.fn();
        render(<PropertyFilters onSearch={onSearch} onClear={() => {}} />);

        fireEvent.change(screen.getByLabelText("City"), {
            target: { value: "Portland" },
        });
        fireEvent.change(screen.getByLabelText("Beds"), {
            target: { value: "3" },
        });
        fireEvent.change(screen.getByLabelText("Baths"), {
            target: { value: "2" },
        });

        fireEvent.click(screen.getByRole("button", { name: /search/i }));

        expect(onSearch).toHaveBeenCalledWith({
            city: "Portland",
            beds: "3",
            baths: "2",
        });
    });
});