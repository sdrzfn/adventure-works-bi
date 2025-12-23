import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

/* =====================================================
   1. KPI
   ===================================================== */
router.get('/kpi', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                SUM(amount) AS totalSales,
                COUNT(*) AS totalOrders
            FROM fact_sales;
        `);

        // const { totalSales, totalProfit, totalOrders } = rows[0];
        // const margin = ((totalProfit / totalSales) * 100).toFixed(2);

        // res.json({ totalSales, totalProfit, margin, totalOrders });

        res.json(rows)

    } catch (error) {
        console.error('Error fetching KPI:', error);
        res.status(500).json({ error: 'Failed to fetch KPI data' });
    }
});

/* =====================================================
   2. Sales by Category
   ===================================================== */
router.get('/sales-by-territory', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                dt.sk_territory,
                dt.territory_name AS name,
                SUM(fs.amount) AS value
            FROM fact_sales fs
            JOIN dim_territory dt 
                ON fs.sk_territory = dt.sk_territory
            GROUP BY dt.territory_name, dt.territory_name
            ORDER BY value DESC;
        `);

        // const formatted = rows.map(row => ({
        //     name: row.product_name,
        //     value: row.totalColors
        // }));

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales-by-category' });
    }
});

/* =====================================================
   3. Sales Trend
   ===================================================== */
router.get('/sales-trend', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                dt.year,
                dt.month,
                DATE_FORMAT(dt.the_date, '%Y-%m') AS period,
                SUM(fs.amount) AS revenue
            FROM fact_sales fs
            JOIN dim_time dt ON fs.sk_time = dt.sk_time
            GROUP BY dt.year, dt.month
            ORDER BY dt.year, dt.month;
        `);

        // const formatted = rows.map(row => ({
        //     date: row.month,
        //     Sales: row.totalSales,
        //     Profit: row.totalProfit
        // }));

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trend' });
    }
});

/* =====================================================
   4. Raw Data (Pivot Table)
   ===================================================== */
router.get('/raw-data', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT sk_time, sk_product, sk_territory, quantity_sold, amount
            FROM fact_sales
            ORDER BY sk_time DESC
            LIMIT 10;
        `);

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch raw data' });
    }
});

/* =====================================================
   5. vendor data (Pivot Table)
   ===================================================== */
router.get('/vendor', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT
                v.vendor_name, v.vendor_account_number, v.effective_from, v.id_vendor
            FROM fact_purchasing p
            JOIN dim_vendor v ON p.sk_vendor = v.sk_vendor
            ORDER BY v.vendor_name ASC
            LIMIT 25;
        `);

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch raw data' });
    }
});

router.get('/drill-down-territory/:skTerritory', async (req, res) => {

    try {
        const { skTerritory } = req.params;

        const [rows] = await pool.query(`
            SELECT
                fs.sk_customer,
                dc.full_name AS name,
                CAST(SUM(fs.quantity_sold) AS UNSIGNED) AS value
            FROM fact_sales fs
            JOIN dim_customer dc
                ON fs.sk_customer = dc.sk_customer
            WHERE fs.sk_territory = ${skTerritory}
            GROUP BY fs.sk_customer, dc.full_name
            ORDER BY value DESC
            LIMIT 50
        `);

        [skTerritory]

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed drill down' });
    }
});

router.get('/drill-down-trend', async (req, res) => {

    try {
        const year = req.query.year;
        const month = req.query.month;

        const query = `
            SELECT
                DATE_FORMAT(dt.the_date, '%Y-%m-%d') AS period,
                SUM(fs.amount) AS revenue
            FROM fact_sales fs
            JOIN dim_time dt
                ON fs.sk_time = dt.sk_time
            WHERE dt.year = ${Number(year)}
                AND dt.month = ${Number(month)}
            GROUP BY dt.the_date
            ORDER BY dt.the_date
        `;
        
        const [rows] = await pool.query(query)

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed drill down' });
    }
});

export default router;