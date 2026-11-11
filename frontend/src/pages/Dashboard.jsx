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
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
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

// ================= GROWTH BADGE COMPONENT =================
const GrowthBadge = ({ signal }) => {
  const getBadgeClass = (signal) => {
    if (signal.includes('Accelerating')) return 'badge-accelerating';
    if (signal.includes('Growing')) return 'badge-growing';
    if (signal.includes('Slowing')) return 'badge-slowing';
    if (signal.includes('Declining')) return 'badge-declining';
    return 'badge-new';
  };

  const getIcon = (signal) => {
    if (signal.includes('Accelerating')) return <ArrowUpRight size={12} className="badge-icon" />;
    if (signal.includes('Growing')) return <TrendingUp size={12} className="badge-icon" />;
    if (signal.includes('Slowing')) return <Activity size={12} className="badge-icon" />;
    if (signal.includes('Declining')) return <ArrowDownRight size={12} className="badge-icon" />;
    return <span className="badge-icon">🆕</span>;
  };

  return (
    <span className={`growth-badge ${getBadgeClass(signal)}`}>
      {getIcon(signal)}
      <span>{signal.replace(/[🟢🟡🟠🔴🆕]/g, '').trim()}</span>
    </span>
  );
};

// ================= COHORT CELL COMPONENT (unused at the moment) =================
// const CohortCell = ({ value, isHeader = false }) => {
//   if (isHeader) return <th className="cohort-th">{value}</th>;
  
//   const pct = Number(value);
//   const intensity = Math.min(pct / 100, 1);
//   const bgColor = `rgba(37, 99, 235, ${0.08 + intensity * 0.25})`;
//   const textColor = pct >= 50 ? '#1d4ed8' : pct >= 25 ? '#2563eb' : '#64748b';
  
//   return (
//     <td className="cohort-td" style={{ backgroundColor: bgColor, color: textColor }}>
//       {value}%
//     </td>
//   );
// };

// ================= DASHBOARD =================
const Dashboard = () => {
  const [dailyTrend, setDailyTrend] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const { logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [kpi, setKpi] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [cohortData, setCohortData] = useState([]);

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
          vendorRes,
          growthRes,
          cohortRes
        ] = await Promise.all([
          axios.get(`${API_URL}/api/kpi`),
          axios.get(`${API_URL}/api/sales-trend`),
          axios.get(`${API_URL}/api/sales-by-territory`),
          axios.get(`${API_URL}/api/raw-data`),
          axios.get(`${API_URL}/api/vendor`),
          axios.get(`${API_URL}/api/growth`),
          axios.get(`${API_URL}/api/cohorts`)
        ]);

        setKpi(kpiRes.data);

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
        setGrowthData(growthRes.data);
        setCohortData(cohortRes.data);

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

          <button
            className={activeMenu === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveMenu('dashboard')}
          >
            <LayoutDashboard size={20} /> Executive Dashboard
          </button>

          {/* {user?.role === 'SUPER ADMIN' && ( */}
          <button
            className={activeMenu === 'purchasing' ? 'active' : ''}
            onClick={() => setActiveMenu('purchasing')}
          >
            <ListOrdered size={20} /> Purchasing
          </button>
          {/* )} */}

          {/* {(user?.role === 'ADMIN' || user?.role === 'SUPER ADMIN') && ( */}
          <button
            className={activeMenu === 'sales' ? 'active' : ''}
            onClick={() => setActiveMenu('sales')}
          >
            <TrendingUp size={20} /> Sales
          </button>
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
            {/* ---- KPI GRID (Enhanced) ---- */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <DollarSign />
                <h4>Total Pendapatan</h4>
                <p>${Number(kpi.totalSales || 0).toLocaleString()}</p>
              </div>

              <div className="kpi-card">
                <ShoppingBag />
                <h4>Total Pesanan</h4>
                <p>{Number(kpi.totalOrders || 0).toLocaleString()}</p>
              </div>

              <div className="kpi-card">
                <Users />
                <h4>Pelanggan Aktif</h4>
                <p>{Number(kpi.activeCustomers || 0).toLocaleString()}</p>
              </div>

              <div className="kpi-card profit">
                <TrendingUp />
                <h4>Laba Kotor</h4>
                <p>${Number(kpi.grossProfit || 0).toLocaleString()}</p>
              </div>

              <div className="kpi-card margin">
                <Activity />
                <h4>Margin Kotor</h4>
                <p>{Number(kpi.grossMarginPct || 0).toFixed(2)}%</p>
              </div>

              <div className="kpi-card aov">
                <DollarSign />
                <h4>Rata-rata Pesanan</h4>
                <p>${Number(kpi.avgOrderValue || 0).toLocaleString()}</p>
              </div>

              {/* <div className="kpi-card rpc">
                <TrendingUp />
                <h4>Pendapatan/Pelanggan</h4>
                <p>${Number(kpi.revenuePerCustomer || 0).toLocaleString()}</p>
              </div> */}
            </div>

            {/* ---- GROWTH INTELLIGENCE ---- */}
            <div className="chart-panel">
              <h3>Intelijen Pertumbuhan (YoY / MoM)</h3>
              <div className="growth-table-wrapper">
                <table className="growth-table">
                  <thead>
                    <tr>
                      <th>Periode</th>
                      <th>Pendapatan</th>
                      <th>MoM</th>
                      <th>YoY</th>
                      <th>Sinyal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthData.slice(0, 12).map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.period}</td>
                        <td className="text-right">${Number(row.revenue || 0).toLocaleString()}</td>
                        <td className="text-right growth-cell">
                          {row.momGrowthPct !== null && row.momGrowthPct !== undefined ? (
                            <span className={row.momGrowthPct >= 0 ? 'growth-positive' : 'growth-negative'}>
                              {row.momGrowthPct >= 0 ? '+' : ''}{row.momGrowthPct.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="growth-na">—</span>
                          )}
                        </td>
                        <td className="text-right growth-cell">
                          {row.yoyGrowthPct !== null && row.yoyGrowthPct !== undefined ? (
                            <span className={row.yoyGrowthPct >= 0 ? 'growth-positive' : 'growth-negative'}>
                              {row.yoyGrowthPct >= 0 ? '+' : ''}{row.yoyGrowthPct.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="growth-na">—</span>
                          )}
                        </td>
                        <td>
                          <GrowthBadge signal={row.trendSignal} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---- COHORT RETENTION HEATMAP ---- */}
            <div className="chart-panel">
              <h3>Retensi Kohort Pelanggan (90 & 180 Hari)</h3>
              <div className="cohort-table-wrapper">
                <table className="cohort-table">
                  <thead>
                    <tr>
                      <th>Kohort</th>
                      <th>Pelanggan</th>
                      <th>Avg LTV</th>
                      <th>Avg Pesanan</th>
                      <th>Retensi 90 Hari</th>
                      <th>Retensi 180 Hari</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="cohort-month">{row.cohortMonth}</td>
                        <td className="text-right">{Number(row.customers || 0).toLocaleString()}</td>
                        <td className="text-right">${Number(row.avgLTV || 0).toLocaleString()}</td>
                        <td className="text-right">{Number(row.avgOrders || 0).toFixed(1)}</td>
                        <td className="text-right cohort-retention">
                          {row.retention90d !== null && row.retention90d !== undefined ? `${Number(row.retention90d).toFixed(1)}%` : '—'}
                        </td>
                        <td className="text-right cohort-retention">
                          {row.retention180d !== null && row.retention180d !== undefined ? `${Number(row.retention180d).toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---- REVENUE TREND CHART ---- */}
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
