import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import TableOlap from '../components/TableOlap';
import axios from 'axios';

const Sales = ({ categoryData, rawData, COLORS }) => {

    const [selectedTerritory, setSelectedTerritory] = useState(null);
    const [drillData, setDrillData] = useState([]);

    const formatNumber = (num) =>
        Number(num).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    const handleTerritoryClick = async (data) => {
        const { sk_territory, name } = data.payload || {};

        if (!sk_territory) {
            console.warn('sk_territory not found in payload', data);
            return;
        }

        setSelectedTerritory(name);

        const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/drill-down-territory/${sk_territory}`
        );

        setDrillData(res.data);
    };

    return (
        <>
            {/* ================= PIE 1 ================= */}
            <div className="chart-panel">
                <h3>Sales by Territory</h3>

                <ResponsiveContainer width="100%" height={500}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={({ value }) => formatNumber(value)}
                            onClick={handleTerritoryClick}
                        >
                            {categoryData.map((_, idx) => (
                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatNumber(value)} />
                        <Legend layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <p></p>

            {/* ================= DRILL DOWN ================= */}
            {selectedTerritory && (
                <div className="chart-panel">
                    <h3>
                        Quantity Sold – Top 50 Customer
                        <br />
                        <small>Territory: {selectedTerritory}</small>
                    </h3>

                    <ResponsiveContainer width="100%" height={1000}>
                        <PieChart>
                            <Pie
                                data={drillData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={250}
                                label
                            >
                                {drillData.map((_, idx) => (
                                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
            <p></p>
            {/* ================= TABLE ================= */}
            <div className="pivot-panel">
                <div className="pivot-header">
                    <h3>Transaksi Detail</h3>
                </div>
                <TableOlap data={rawData} />
            </div>
            <p></p>
            <div className="pivot-panel">
                <div className="pivot-header">
                    <h3>OLAP Sales</h3>
                </div>
                <iframe
                    src="http://localhost:8080/mondrian/testpage.jsp?query=sales"
                    title="Mondrian OLAP"
                    style={{ width: '100%', height: '600px', border: 'none' }}
                />
            </div>
        </>
    );
};

export default Sales;
