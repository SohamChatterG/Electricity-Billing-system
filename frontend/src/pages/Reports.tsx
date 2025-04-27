// src/pages/Reports.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface ReportFilter {
    reportType: string;
    startDate: string;
    endDate: string;
    customerId: string;
}

const Reports = () => {
    const { isLoggedIn, userRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [filters, setFilters] = useState<ReportFilter>({
        reportType: 'customers',
        startDate: '',
        endDate: '',
        customerId: ''
    });

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/customers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCustomers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        }
    };

    useEffect(() => {
        if (isLoggedIn && userRole === 'admin') {
            fetchCustomers();
        }
    }, [isLoggedIn, userRole]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateReport = async (type: 'csv' | 'pdf' | 'excel') => {
        if (!filters.reportType) {
            toast.error('Please select a report type');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();

            params.append('reportType', filters.reportType);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.customerId) params.append('customerId', filters.customerId);

            let url = '';
            let contentType = '';
            let fileExtension = '';

            switch (type) {
                case 'csv':
                    url = `http://localhost:8000/api/reports`;
                    contentType = 'text/csv';
                    fileExtension = 'csv';
                    break;
                case 'pdf':
                    url = `http://localhost:8000/api/reports/pdf`;
                    contentType = 'application/pdf';
                    fileExtension = 'pdf';
                    break;
                case 'excel':
                    url = `http://localhost:8000/api/reports/excel`;
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    fileExtension = 'xlsx';
                    break;
            }

            // Make the request with authorization header
            const response = await axios.get(`${url}?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': contentType
                },
                responseType: 'blob' // Important for file downloads
            });

            // Create a download link
            const blob = new Blob([response.data], { type: contentType });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${filters.reportType}_report_${format(new Date(), 'yyyyMMdd')}.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`${type.toUpperCase()} report downloaded successfully`);
        } catch (error) {
            console.error(`Error generating ${type} report:`, error);
            toast.error(`Failed to generate ${type} report`);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn || userRole !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Reports</h2>
                    <p className="text-gray-600">Admin access required</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Reports Dashboard</h1>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Report Filters</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Report Type */}
                    <div>
                        <label className="block text-gray-700 mb-2">Report Type</label>
                        <select
                            name="reportType"
                            value={filters.reportType}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border rounded-md"
                        >
                            <option value="customers">Customers</option>
                            <option value="bills">Bills</option>
                            <option value="units">Units Consumption</option>
                        </select>
                    </div>

                    {/* Customer Filter */}
                    {(filters.reportType === 'bills' || filters.reportType === 'units') && (
                        <div>
                            <label className="block text-gray-700 mb-2">Customer</label>
                            <select
                                name="customerId"
                                value={filters.customerId}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2 border rounded-md"
                            >
                                <option value="">All Customers</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} ({customer.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Date Range */}
                    <div>
                        <label className="block text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border rounded-md"
                        />
                    </div>
                </div>
            </div>

            {/* Report Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Generate Reports</h2>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => generateReport('csv')}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Download CSV'}
                    </button>

                    <button
                        onClick={() => generateReport('pdf')}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Download PDF'}
                    </button>

                    <button
                        onClick={() => generateReport('excel')}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Download Excel'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;