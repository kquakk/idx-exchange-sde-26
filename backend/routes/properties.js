const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

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
                error: `sortBy must be one of: ${Objects.keys(SORT_COLUMNS).join(", ")}`,
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