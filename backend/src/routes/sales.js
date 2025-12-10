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
                SUM(profit) AS totalProfit,
                COUNT(*) AS totalOrders
            FROM fact_sales;
        `);

        const { totalSales, totalProfit, totalOrders } = rows[0];
        const margin = ((totalProfit / totalSales) * 100).toFixed(2);

        res.json({ totalSales, totalProfit, margin, totalOrders });

    } catch (error) {
        console.error('Error fetching KPI:', error);
        res.status(500).json({ error: 'Failed to fetch KPI data' });
    }
});

/* =====================================================
   2. Sales by Category
   ===================================================== */
router.get('/sales-by-category', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT category, SUM(amount) AS totalAmount
            FROM fact_sales
            GROUP BY category;
        `);

        const formatted = rows.map(row => ({
            name: row.category,
            value: row.totalAmount
        }));

        res.json(formatted);

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
            SELECT DATE_FORMAT(date, '%Y-%m') AS month,
                   SUM(amount) AS totalSales,
                   SUM(profit) AS totalProfit
            FROM fact_sales
            GROUP BY month
            ORDER BY month ASC;
        `);

        const formatted = rows.map(row => ({
            date: row.month,
            Sales: row.totalSales,
            Profit: row.totalProfit
        }));

        res.json(formatted);

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
            SELECT date, category, region, amount, profit 
            FROM fact_sales;
        `);

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch raw data' });
    }
});

export default router;
