const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// ORDER BY cannot be parameterized — a `?` placeholder binds a value, not an
// identifier, so `ORDER BY ?` sends the literal string 'L_SystemPrice' as the
// sort key. Every row gets the same value, nothing sorts, and MySQL raises no
// error. Silent failure is worse than a crash, so sort columns are whitelisted
// here and interpolated directly after validation.
//
// The keys are public API names rather than raw column names, which keeps the
// RETS schema out of the API surface and means a column rename touches only
// this object.
const SORT_COLUMNS = {
    price: "L_SystemPrice",
    dateListed: "L_ListingDate",
    sqft: "LM_Int2_3",
    beds: "L_Keyword2",
}

const SORT_ORDERS = ["asc", "desc"];

router.get("/", async(req, res) => {
    try {
        const { city, zipcode, minPrice, maxPrice, beds, baths } = req.query;
        const { sortBy, sortOrder } = req.query;
        let { limit, offset } = req.query;

        limit = limit === undefined ? 20 : Number(limit)
        offset = offset === undefined ? 0 : Number(offset);

        if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
            return res.status(400).json({ error: "limit must be an integer between 1 and 50" });
        }

        if (!Number.isInteger(offset) || offset < 0) {
            return res.status(400).json({ error: "limit must be a non-negative integer" });
        }

        // Query string values always arrive as strings. Without this guard,
        // Number("abc") becomes NaN, gets bound into the SQL, and surfaces as a
        // confusing 500 rather than a 400 that tells the caller what was wrong.
        const numericFilters = { minPrice, maxPrice, beds, baths };
        for (const [key, value] of Object.entries(numericFilters)) {
            if (value !== undefined && (isNaN(Number(value)) || Number(value) < 0)) {
                return res.status(400).json({ error: `${key} must be a non-negative number` });
            }
        }

        // Filters are optional and freely combinable, so the WHERE clause is built
        // dynamically: each active filter pushes a condition fragment into one array
        // and its value into another. The arrays stay in lockstep, so the ? placeholders
        // line up with the bound values in order when joined with AND.
        //
        // The `!== undefined` checks below are deliberate rather than truthiness checks.
        // minPrice=0 and beds=0 are legitimate filters, and `if (minPrice)` would drop
        // them silently — producing a total count that disagrees with the results the
        // user actually sees.
        const conditions = [];
        const values = [];

        if (city) {
            conditions.push("LOWER(TRIM(L_CITY)) = LOWER(TRIM(?))");
            values.push(city);
        }

        if (zipcode) {
            conditions.push("L_Zip = ?");
            values.push(zipcode);
        }

        if (minPrice !== undefined) {
            conditions.push("L_SystemPrice >= ?");
            values.push(Number(minPrice));
        }

        if (maxPrice !== undefined) {
            conditions.push("L_SystemPrice <= ?");
            values.push(Number(maxPrice));
        }

        if (beds !== undefined) {
            conditions.push("L_Keyword2 >= ?");
            values.push(Number(beds));
        }

        if (baths !== undefined) {
            conditions.push("LM_Dec_3 >= ?");
            values.push(Number(baths));
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND " )}` : "";

        const countSql = `SELECT COUNT(*) AS total FROM rets_property ${whereClause}`;
        const [countRows] = await pool.query(countSql, values);
        const total = countRows[0].total;

        // L_ListingID is appended as a secondary sort key so the ordering is total.
        // Without it, rows tied on the primary key (same price, same sqft) can come
        // back in a different order on each request — which means a property can appear
        // on both page 2 and page 3 while another never appears at all.
        let orderByClause = "ORDER BY L_ListingID ASC";
        if (sortBy) {
            const column = SORT_COLUMNS[sortBy];
            const direction = String(sortOrder || "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
            orderByClause = `ORDER BY ${column} ${direction}, L_ListingID ASC`;
        }

        const dataSql = `SELECT * FROM rets_property ${whereClause} ${orderByClause} LIMIT ? OFFSET ?`;

        const [rows] = await pool.query(dataSql, [...values, limit, offset]);

        res.json({ total, limit, offset, results: rows });

        if (sortBy !== undefined && !Object.hasOwn(SORT_COLUMNS, sortBy)) {
            return res.status(400).json({
                error: `sortBy must be one of: ${Object.keys(SORT_COLUMNS).join(", ")}`,
            });
        }

        if (sortBy !== undefined && !SORT_ORDERS.includes(String(sortOrder).toLowerCase)) {
            return res.status(400).json({
                error: "sortOrder must be either 'asc' or 'desc'",
            });
        }
        

    } catch (e) {
        console.error("Erorr in GET /api/properties: ", e);
        res.status(500).json({ error: "Internal server error" });
    }

});

router.get("/:id/openhouses", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id.length > 50 || !/^[A-Za-z0-9_-]+$/.test(id)) {
            return res.status(400).json({ error: "Invalid listing ID format" });
        }

        const [propertyRows] = await pool.query( "SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?", [id]);

        if (propertyRows.length === 0) {
            return res.status(404).json({ error: `Property ${id} not found` });
        }

        // all_data is returned unparsed. Some rows in the feed contain malformed JSON,
        // and parsing here would throw and take down the endpoint for the whole
        // property. The frontend parses defensively per-row instead, so one bad record
        // costs one missing remark rather than the entire response.
        const [openHouses] = await pool.query(
            `SELECT L_ListingID, OpenHouseDate, OH_StartTime, OH_EndTime, all_data
            FROM rets_openhouse
            WHERE L_ListingID = ?
            ORDER BY OpenHouseDate ASC, OH_StartTime ASC`,
            [id]
        );

        res.json({ listingId: id, openHouses });
    } catch (e) {
        console.error("Error in GET /api/properties/:id/opehouses:", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id.length > 50 || !/^[A-Za-z0-9_-]+$/.test(id)) {
            return res.status(400).json({ error: "Invalid listing ID format" });
        }

        const [rows] = await pool.query("SELECT * FROM rets_property WHERE L_ListingID = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: `Property ${id} not found` });
        }

        res.json(rows[0]);
    } catch (e) {
        console.error("Error in GET /api/propert9es/:id:", e);
        res.status(500).json({ error: "Internal server erroro" });
    }
});

module.exports = router;