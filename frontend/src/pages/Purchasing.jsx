import React from 'react';

const Customer = ({ vendorData }) => {
    return (
        <>
            <div className="pivot-panel">
                <div className="pivot-header">
                    <h3>Customer / Vendor Data</h3>
                </div>

                <div className="pivot-table-wrapper">
                    <table className="pivot-table">
                        <thead>
                            <tr>
                                <th>ID Vendor</th>
                                <th>Vendor Account Number</th>
                                <th>Nama Vendor</th>
                                <th>Effective From</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendorData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center">
                                        Tidak ada data vendor
                                    </td>
                                </tr>
                            ) : (
                                vendorData.map((vendor, idx) => (
                                    <tr key={idx}>
                                        <td>{vendor.id_vendor}</td>
                                        <td>{vendor.vendor_account_number}</td>
                                        <td>{vendor.vendor_name}</td>
                                        <td>
                                            {vendor.effective_from
                                                ? new Date(vendor.effective_from).toLocaleDateString()
                                                : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <p></p>
            <div className="pivot-panel">
                <div className="pivot-header">
                    <h3>OLAP Purchasing</h3>
                </div>
                <iframe
                    src="http://localhost:8080/mondrian/testpage.jsp?query=purchasing"
                    title="Mondrian OLAP"
                    style={{ width: '100%', height: '600px', border: 'none' }}
                />
            </div>
        </>
    );
};

export default Customer;
