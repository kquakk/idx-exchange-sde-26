import { render, screen, fireEvent } from "@testing-library/react";
import Pagination, { getPageItems } from "./Pagination";

describe("getPageItems", () => {
    test("returns all pages when total is small", () => {
        expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
        expect(getPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    test("inserts ellipsis at the end when current page is near start", () => {
        const items = getPageItems(1, 24);
        expect(items[0]).toBe(1);
        expect(items[items.length - 1]).toBe(24);
        expect(items).toContain("...");
    });

    test("inserts ellipsis at the start when current page is near end", () => {
        const items = getPageItems(24, 24);
        expect(items[0]).toBe(1);
        expect(items[items.length - 1]).toBe(24);
        expect(items).toContain("...");
    });

    test("inserts ellipsis on both sides when current page is in middle", () => {
        const items = getPageItems(12, 24);
        expect(items[0]).toBe(1);
        expect(items[items.length - 1]).toBe(24);
        expect(items.filter((x) => x === "...").length).toBe(2);
    });

    test("does not duplicate the last page number when current page is near the end", () => {
        for (let page = 20; page <= 24; page++) {
            const items = getPageItems(page, 24);
            const pageNumbers = items.filter((x) => typeof x === "number");
            const uniquePageNumbers = new Set(pageNumbers);
            expect(pageNumbers.length).toBe(uniquePageNumbers.size);
        }
    });

    test("does not duplicate the first page number when current page is near the start", () => {
        for (let page = 1; page <= 4; page++) {
            const items = getPageItems(page, 24);
            const pageNumbers = items.filter((x) => typeof x === "number");
            const uniquePageNumbers = new Set(pageNumbers);
            expect(pageNumbers.length).toBe(uniquePageNumbers.size);
        }
    });
});

describe("Pagination component", () => {
    test("renders nothing when there is only one page", () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
        );
        expect(container.firstChild).toBeNull();
    });

    test("disables Previous button on the first page", () => {
        render(
            <Pagination currentPage={1} totalPages={10} onPageChange={() => {}} />
        );
        expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    });

    test("disables Next button on the last page", () => {
        render(
            <Pagination currentPage={10} totalPages={10} onPageChange={() => {}} />
        );
        expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    });

    test("calls onPageChange when a page number is clicked", () => {
        const onPageChange = jest.fn();
        render(
            <Pagination
                currentPage={1}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "3" }));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    test("calls onPageChange with next page when Next is clicked", () => {
        const onPageChange = jest.fn();
        render(
            <Pagination
                currentPage={2}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /next/i }));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    test("calls onPageChange with previous page when Previous is clicked", () => {
        const onPageChange = jest.fn();
        render(
            <Pagination
                currentPage={3}
                totalPages={5}
                onPageChange={onPageChange}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /previous/i }));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    test("marks the current page as active", () => {
        render(
            <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
        );
        const page3Button = screen.getByRole("button", { name: "3" });
        expect(page3Button).toHaveAttribute("aria-current", "page");
    });
});