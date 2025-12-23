import React from 'react';
import './TableOlap.css'; // uses your existing styles

const TableOlap = ({ data }) => {

    const getTerritoryClass = (territory) => {
        switch (territory) {
            case 'United States of America':
                return 'tag-usa';
            case 'Canada':
                return 'tag-canada';
            case 'United Kingdom':
                return 'tag-uk';
            default:
                return 'tag-default';
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
                        <th className="text-right">Total Penjualan ($)</th>
                    </tr>
                </thead>

                <tbody>
                    {(!data || data.length === 0) ? (
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
                                    <span
                                        className={`category-tag ${getTerritoryClass(item.sk_territory)}`}
                                    >
                                        {item.sk_territory}
                                    </span>
                                </td>
                                <td className="text-right">
                                    {item.quantity_sold}
                                </td>
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

export default TableOlap;
