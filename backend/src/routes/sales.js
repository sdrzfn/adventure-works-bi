import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

/* =====================================================
   1. ENHANCED KPI - Financial Health
   ===================================================== */
router.get('/kpi', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                SUM(fs.amount) AS totalSales,
                COUNT(*) AS totalOrders,
                COUNT(DISTINCT fs.sk_customer) AS activeCustomers,
                SUM(dp.standard_cost * fs.quantity_sold) AS totalCOGS,
                SUM(fs.amount - (dp.standard_cost * fs.quantity_sold)) AS grossProfit,
                ROUND(100 * SUM(fs.amount - (dp.standard_cost * fs.quantity_sold)) / NULLIF(SUM(fs.amount), 0), 2) AS grossMarginPct,
                ROUND(SUM(fs.amount) / NULLIF(COUNT(*), 0), 2) AS avgOrderValue,
                ROUND(SUM(fs.amount) / NULLIF(COUNT(DISTINCT fs.sk_customer), 0), 2) AS revenuePerCustomer
            FROM fact_sales fs
            JOIN dim_product dp ON fs.sk_product = dp.sk_product;
        `);

        res.json(rows[0]);

    } catch (error) {
        console.error('Error fetching KPI:', error);
        res.status(500).json({ error: 'Failed to fetch KPI data' });
    }
});

/* =====================================================
   2. GROWTH INTELLIGENCE - YoY/MoM with Variance
   ===================================================== */
router.get('/growth', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            WITH monthly AS (
                SELECT 
                    dt.year,
                    dt.month,
                    CONCAT(dt.year, '-', LPAD(dt.month, 2, '0')) AS period,
                    SUM(fs.amount) AS revenue,
                    LAG(SUM(fs.amount)) OVER (ORDER BY dt.year, dt.month) AS prevMonthRevenue,
                    LAG(SUM(fs.amount), 12) OVER (ORDER BY dt.year, dt.month) AS prevYearRevenue
                FROM fact_sales fs
                JOIN dim_time dt ON fs.sk_time = dt.sk_time
                GROUP BY dt.year, dt.month
            )
            SELECT 
                year,
                month,
                period,
                revenue,
                prevMonthRevenue,
                prevYearRevenue,
                ROUND(100.0 * (revenue - prevMonthRevenue) / NULLIF(prevMonthRevenue, 0), 2) AS momGrowthPct,
                ROUND(100.0 * (revenue - prevYearRevenue) / NULLIF(prevYearRevenue, 0), 2) AS yoyGrowthPct,
                CASE 
                    WHEN prevYearRevenue IS NULL THEN '🆕 New'
                    WHEN revenue > prevYearRevenue * 1.1 THEN '🟢 Accelerating'
                    WHEN revenue > prevYearRevenue THEN '🟡 Growing'
                    WHEN revenue > prevYearRevenue * 0.9 THEN '🟠 Slowing'
                    ELSE '🔴 Declining'
                END AS trendSignal
            FROM monthly
            ORDER BY year DESC, month DESC
            LIMIT 24;
        `);

        res.json(rows);

    } catch (error) {
        console.error('Growth error:', error.message);
        res.status(500).json({ error: 'Failed to fetch growth data' });
    }
});

/* =====================================================
   3. COHORT RETENTION - Customer 360
   ===================================================== */
router.get('/cohorts', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            WITH customer_first_order AS (
                SELECT 
                    dc.sk_customer,
                    dc.full_name,
                    MIN(dti.the_date) AS firstOrderDate,
                    MAX(dti.the_date) AS lastOrderDate,
                    COUNT(*) AS orderCount,
                    SUM(fs.amount) AS lifetimeValue,
                    AVG(fs.amount) AS avgOrderValue
                FROM fact_sales fs
                JOIN dim_customer dc ON fs.sk_customer = dc.sk_customer
                JOIN dim_time dti ON fs.sk_time = dti.sk_time
                GROUP BY dc.sk_customer, dc.full_name
            ),
            cohort_data AS (
                SELECT 
                    DATE_FORMAT(firstOrderDate, '%Y-%m') AS cohortMonth,
                    COUNT(*) AS customers,
                    ROUND(AVG(lifetimeValue), 2) AS avgLTV,
                    ROUND(AVG(orderCount), 1) AS avgOrders,
                    ROUND(100 * SUM(CASE WHEN lastOrderDate >= DATE_SUB(CURDATE(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) / COUNT(*), 1) AS retention90d,
                    ROUND(100 * SUM(CASE WHEN lastOrderDate >= DATE_SUB(CURDATE(), INTERVAL 180 DAY) THEN 1 ELSE 0 END) / COUNT(*), 1) AS retention180d
                FROM customer_first_order
                GROUP BY DATE_FORMAT(firstOrderDate, '%Y-%m')
            )
            SELECT 
                cohortMonth,
                customers,
                avgLTV,
                avgOrders,
                retention90d,
                retention180d
            FROM cohort_data
            ORDER BY cohortMonth DESC;
        `);

        res.json(rows);

    } catch (error) {
        console.error('Cohorts error:', error.message);
        res.status(500).json({ error: 'Failed to fetch cohort data' });
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
            GROUP BY dt.sk_territory, dt.territory_name
            ORDER BY value DESC;
        `);

        // const formatted = rows.map(row => ({
        //     name: row.product_name,
        //     value: row.totalColors
        // }));

        res.json(rows);

    } catch (error) {
        console.error('sales-by-territory error:', error.message);
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
                CONCAT(dt.year, '-', LPAD(dt.month, 2, '0')) AS period,
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
        console.error('sales-trend error:', error.message);
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
            WHERE fs.sk_territory = ?
            GROUP BY fs.sk_customer, dc.full_name
            ORDER BY value DESC
            LIMIT 50
        `, [skTerritory]);

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

        const [rows] = await pool.query(`
            SELECT
                DATE_FORMAT(dt.the_date, '%Y-%m-%d') AS period,
                SUM(fs.amount) AS revenue
            FROM fact_sales fs
            JOIN dim_time dt
                ON fs.sk_time = dt.sk_time
            WHERE dt.year = ? AND dt.month = ?
            GROUP BY dt.the_date
            ORDER BY dt.the_date
        `, [Number(year), Number(month)]);

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed drill down' });
    }
});

export default router;