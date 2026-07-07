const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

router.get("/", async(req, res) => {
    try {
        const { city, zipcode, minPrice, maxPrice, beds, baths } = req.query;
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

        const dataSql = `SELECT * FROM rets_property ${whereClause} LIMIT ? OFFSET ? `;

        const [rows] = await pool.query(dataSql, [...values, limit, offset]);

        res.json({ total, limit, offset, results: rows });

    } catch (e) {
        console.error("Erorr in GET /api/properties: ", e);
        res.status(500).json({ error: "Internal server error" });
    }

});

module.exports = router;