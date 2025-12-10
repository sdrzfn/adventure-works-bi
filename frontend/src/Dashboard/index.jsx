import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, DollarSign,
  ShoppingBag, PieChart as PieIcon, Activity, ListOrdered
} from 'lucide-react';
import "./index.css";

// ========== API BASE URL ==============
const API_URL = process.env.REACT_API_URL;

// Komponen Card KPI
const KPICard = ({ title, value, icon, color }) => (
  <div className="kpi-card" style={{ borderLeftColor: color }}>
    <div>
      <p className="kpi-title">{title}</p>
      <h3 className="kpi-value">{value}</h3>
    </div>
    <div className="kpi-icon-container" style={{ backgroundColor: color, opacity: 0.2 }}>
      {React.cloneElement(icon, { color: color, size: 24 })}
    </div>
  </div>
);

const PivotTable = ({ data }) => {
  const getCategoryClass = (category) => {
    switch (category) {
      case 'Bikes': return 'tag-bikes';
      case 'Accessories': return 'tag-accessories';
      case 'Clothing': return 'tag-clothing';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="pivot-table-wrapper">
      <table className="pivot-table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Wilayah</th>
            <th>Kategori</th>
            <th className="text-right">Jumlah ($)</th>
            <th className="text-right">Profit ($)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.date}</td>
              <td>{item.region}</td>
              <td>
                <span className={`category-tag ${getCategoryClass(item.category)}`}>
                  {item.category}
                </span>
              </td>
              <td className="text-right">${item.amount.toLocaleString()}</td>
              <td className="text-right">${item.profit.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const [kpi, setKpi] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const COLORS = ['#4299e1', '#48bb78', '#9f7aea', '#ecc94b'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, catRes, trendRes, rawRes] = await Promise.all([
          axios.get(`${API_URL}/api/kpi`),
          axios.get(`${API_URL}/api/sales-by-category`),
          axios.get(`${API_URL}/api/sales-trend`),
          axios.get(`${API_URL}/api/raw-data`)
        ]);

        setKpi(kpiRes.data);
        setCategoryData(catRes.data);
        setTrendData(trendRes.data);
        setRawData(rawRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);

        // Fallback dummy
        setKpi({ totalSales: 76000, totalProfit: 25900, margin: 34.08, totalOrders: 10 });
        setCategoryData([
          { name: 'Bikes', value: 67000 },
          { name: 'Accessories', value: 6500 },
          { name: 'Clothing', value: 5500 }
        ]);
        setTrendData([
          { date: '2023-01', Sales: 17000, Profit: 5300 },
          { date: '2023-02', Sales: 15500, Profit: 4200 }
        ]);
        setRawData([]);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading || !kpi) return <div className="loading-screen">Memuat Dashboard Adventure Works...</div>;

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>ADVENTURE <span>WORKS</span></h1>
        </div>
        <nav className="sidebar-nav">
          <a className="active"><LayoutDashboard size={20} /> Executive Dashboard</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header-bar">
          <h2>Tinjauan Business Intelligence</h2>
        </header>

        {/* KPI */}
        <div className="kpi-grid">
          <KPICard title="Total Pendapatan" value={`$${kpi.totalSales.toLocaleString()}`} icon={<DollarSign />} color="#4299e1" />
          <KPICard title="Total Profit" value={`$${kpi.totalProfit.toLocaleString()}`} icon={<TrendingUp />} color="#48bb78" />
          <KPICard title="Margin Profit" value={`${kpi.margin}%`} icon={<Activity />} color="#9f7aea" />
          <KPICard title="Total Pesanan" value={kpi.totalOrders} icon={<ShoppingBag />} color="#ecc94b" />
        </div>

        {/* Sales Trend */}
        <div className="charts-grid">
          <div className="chart-panel">
            <h3>Tren Penjualan</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <Line dataKey="Sales" stroke="#4299e1" strokeWidth={3} />
                <Line dataKey="Profit" stroke="#48bb78" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="chart-panel">
            <h3>Pendapatan per Kategori</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" outerRadius={100}>
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pivot Table */}
        <div className="pivot-panel">
          <h3>Transaksi Detail (OLAP Drill Through)</h3>
          <PivotTable data={rawData} />
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
