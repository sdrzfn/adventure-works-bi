import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext.jsx';
import {
  LayoutDashboard,
  TrendingUp,
  ListOrdered,
  DollarSign,
  ShoppingBag,
  LogOut,
} from 'lucide-react';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import Purchasing from './Purchasing.jsx';
import Sales from './Sales.jsx';
import './Dashboard.css';

// ================= API =================
const API_URL = process.env.REACT_APP_API_URL;

// ================= TABLE OLAP =================
export const TableOlap = ({ data }) => {
  const getTerritoryClass = (territory) => {
    switch (territory) {
      case 'United States of America': return 'tag-usa';
      case 'Canada': return 'tag-canada';
      case 'United Kingdom': return 'tag-uk';
      default: return 'tag-default';
    }
  };

  return (
    <div className="pivot-table-wrapper">
      <table className="pivot-table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Produk</th>
            <th>Wilayah</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Total ($)</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                Tidak ada data transaksi
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.sk_time}</td>
                <td>{item.sk_product}</td>
                <td>
                  <span className={`category-tag ${getTerritoryClass(item.sk_territory)}`}>
                    {item.sk_territory}
                  </span>
                </td>
                <td className="text-right">{item.quantity_sold}</td>
                <td className="text-right">
                  ${Number(item.amount).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ================= DASHBOARD =================
const Dashboard = () => {
  const [dailyTrend, setDailyTrend] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [kpi, setKpi] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [vendorData, setVendorData] = useState([]);

  const COLORS = [
    '#4299e1', '#48bb78', '#9f7aea', '#ecc94b',
    '#ff0000', '#66ffff', '#ff33cc', '#cccccc'
  ];

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          kpiRes,
          trendRes,
          categoryRes,
          rawRes,
          vendorRes
        ] = await Promise.all([
          axios.get(`${API_URL}/api/kpi`),
          axios.get(`${API_URL}/api/sales-trend`),
          axios.get(`${API_URL}/api/sales-by-territory`),
          axios.get(`${API_URL}/api/raw-data`),
          axios.get(`${API_URL}/api/vendor`)
        ]);

        setKpi(kpiRes.data[0]);

        setTrendData(
          trendRes.data.map(item => ({
            year: item.year,
            month: item.month,
            period: `${item.year}-${String(item.month).padStart(2, '0')}`,
            revenue: Number(item.revenue)
          }))
        );

        setCategoryData(categoryRes.data);
        setRawData(rawRes.data);
        setVendorData(vendorRes.data);

      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;

    const fetchDailyTrend = async () => {
      try {
        const { year, month } = selectedMonth;

        const res = await axios.get(
          `${API_URL}/api/drill-down-trend`,
          { params: { year, month } }
        );

        setDailyTrend(
          res.data.map(item => ({
            ...item,
            revenue: Number(item.revenue)
          }))
        );
      } catch (err) {
        console.error('Daily trend error:', err);
      }
    };

    fetchDailyTrend();
  }, [selectedMonth]);

  const handleMonthSelect = (e) => {
    if (!e || e.activeIndex == null) return;

    const idx = parseInt(e.activeIndex, 10);

    const row = trendData[idx];

    if (!row) return;

    setSelectedMonth({
      year: row.year,
      month: row.month
    });
  };


  if (loading || !kpi) {
    return <div className="loading-screen">Memuat Dashboard...</div>;
  }

  return (
    <div className="dashboard-container">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>ADVENTURE <span>WORKS</span></h1>
        </div>

        <nav className="sidebar-nav">

          <a
            className={activeMenu === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveMenu('dashboard')}
          >
            <LayoutDashboard size={20} /> Executive Dashboard
          </a>

          {/* {user?.role === 'SUPER ADMIN' && ( */}
          <a
            className={activeMenu === 'purchasing' ? 'active' : ''}
            onClick={() => setActiveMenu('purchasing')}
          >
            <ListOrdered size={20} /> Purchasing
          </a>
          {/* )} */}

          {/* {(user?.role === 'ADMIN' || user?.role === 'SUPER ADMIN') && ( */}
          <a
            className={activeMenu === 'sales' ? 'active' : ''}
            onClick={() => setActiveMenu('sales')}
          >
            <TrendingUp size={20} /> Sales
          </a>
          {/* )} */}

        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <button style={{ cursor: "pointer" }}
            onClick={logout}
            className="logout-btn"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>

        <div className="sidebar-footer">
          © 2025 Adventure Works BI
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="main-content">

        <header className="header-bar">
          <h2>Executive Business Intelligence</h2>
          <p>Adventure Works Data Warehouse</p>
        </header>

        {/* ===== EXECUTIVE DASHBOARD ===== */}
        {activeMenu === 'dashboard' && (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <DollarSign />
                <h4>Total Pendapatan</h4>
                <p>${Number(kpi.totalSales).toLocaleString()}</p>
              </div>

              <div className="kpi-card">
                <ShoppingBag />
                <h4>Total Pesanan</h4>
                <p>{kpi.totalOrders}</p>
              </div>
            </div>

            <div className="chart-panel">
              <h3>Tren Penjualan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} onClick={handleMonthSelect}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4299e1"
                    strokeWidth={3}
                    name="Revenue"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p></p>

            {selectedMonth && (
              <div className="chart-panel">
                <h3>Tren Penjualan Harian</h3>
                <small>
                  Bulan: {selectedMonth.year}-{String(selectedMonth.month).padStart(2, '0')}
                </small>


                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(value)
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#48bb78"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ===== Purchasing ===== */}
        {activeMenu === 'purchasing' &&
          (
            <Purchasing vendorData={vendorData} />
          )}

        {/* ===== SALES ===== */}
        {activeMenu === 'sales' &&
          (
            <Sales
              categoryData={categoryData}
              rawData={rawData}
              COLORS={COLORS}
            />
          )}

      </main>
    </div>
  );
};

export default Dashboard;
