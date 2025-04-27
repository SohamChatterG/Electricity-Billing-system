import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

interface Reading {
    id: string;
    month: string;
    previousUnit: number;
    currentUnit: number;
    unitsConsumed: number;
    createdAt: string;
    bill?: {
        id: string;
        amount: number;
        dueDate: string;
        isPaid: boolean;
    };
}

interface ConnectionDetails {
    meterNumber: string;
    type: string;
    customerName: string;
    customerId: string;
}

const MeterReadings = () => {
    const { isLoggedIn, userRole } = useAuth();
    const [meterNumber, setMeterNumber] = useState('');
    const [readings, setReadings] = useState<Reading[]>([]);
    const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [showNewReadingForm, setShowNewReadingForm] = useState(false);
    const [newReading, setNewReading] = useState({
        month: '',
        currentUnit: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    });

    const fetchReadings = async (page = 1) => {
        if (!meterNumber.trim()) {
            toast.error('Please enter a meter number');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `http://localhost:8000/api/meter/meter-readings/${meterNumber}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        page,
                        limit: pagination.limit
                    }
                }
            );

            setReadings(response.data.readings);
            setConnectionDetails(response.data.connectionDetails);
            setPagination({
                page: response.data.page,
                limit: pagination.limit,
                total: response.data.total,
                totalPages: response.data.totalPages
            });
        } catch (error) {
            toast.error('Failed to fetch meter readings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReading = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await axios.post(
                'http://localhost:8000/api/meter/meter-readings',
                {
                    meterNumber,
                    month: newReading.month,
                    currentUnit: Number(newReading.currentUnit)
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Meter reading submitted successfully');
            setShowNewReadingForm(false);
            setNewReading({ month: '', currentUnit: '' });
            fetchReadings(); // Refresh the readings list
        } catch (error) {
            let errorMessage = 'Failed to submit meter reading';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (meterNumber && pagination.limit) {
            fetchReadings(1);
        }
    }, [pagination.limit]);

    if (!isLoggedIn || userRole !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Meter Readings</h2>
                    <p className="text-gray-600">Admin access required</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Meter Readings</h1>
            </div>

            {/* Meter Number Input */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-gray-700 mb-2" htmlFor="meterNumber">
                            Enter Meter Number
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="meterNumber"
                                className="w-full px-3 py-2 border rounded-md"
                                value={meterNumber}
                                onChange={(e) => setMeterNumber(e.target.value)}
                                placeholder="e.g. MET123456"
                            />
                            <button
                                onClick={() => fetchReadings(1)}
                                disabled={!meterNumber || loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {connectionDetails && (
                <>
                    {/* Connection Details */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-500">Customer</h3>
                                <p>{connectionDetails.customerName}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-500">Meter Number</h3>
                                <p>{connectionDetails.meterNumber}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-500">Connection Type</h3>
                                <p className="capitalize">{connectionDetails.type}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowNewReadingForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            New Reading
                        </button>
                    </div>

                    {/* Readings Table */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {loading && readings.length === 0 ? (
                            <div className="text-center py-8">Loading readings...</div>
                        ) : readings.length === 0 ? (
                            <div className="text-center py-8">No readings found for this meter</div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2">Month</th>
                                                <th className="text-left py-2">Previous</th>
                                                <th className="text-left py-2">Current</th>
                                                <th className="text-left py-2">Consumed</th>
                                                <th className="text-left py-2">Date Recorded</th>
                                                <th className="text-left py-2">Bill Amount</th>
                                                <th className="text-left py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {readings.map((reading) => (
                                                <tr key={reading.id} className="border-b">
                                                    <td className="py-2">{reading.month}</td>
                                                    <td className="py-2">{reading.previousUnit}</td>
                                                    <td className="py-2">{reading.currentUnit}</td>
                                                    <td className="py-2">{reading.unitsConsumed}</td>
                                                    <td className="py-2">
                                                        {new Date(reading.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-2">
                                                        {reading.bill ? `₹${reading.bill.amount.toFixed(2)}` : 'N/A'}
                                                    </td>
                                                    <td className="py-2">
                                                        {reading.bill ? (
                                                            <span className={`px-2 py-1 rounded-full text-xs ${reading.bill.isPaid
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {reading.bill.isPaid ? 'Paid' : 'Unpaid'}
                                                            </span>
                                                        ) : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex justify-between items-center mt-6">
                                    <div className="text-sm text-gray-600">
                                        Showing page {pagination.page} of {pagination.totalPages}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => fetchReadings(1)}
                                            disabled={pagination.page === 1}
                                            className="px-4 py-2 border rounded-md disabled:opacity-50"
                                        >
                                            First
                                        </button>

                                        <button
                                            onClick={() => fetchReadings(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="px-4 py-2 border rounded-md disabled:opacity-50"
                                        >
                                            Previous
                                        </button>

                                        <span className="px-4 py-2 border rounded-md">
                                            Page {pagination.page}
                                        </span>

                                        <button
                                            onClick={() => fetchReadings(pagination.page + 1)}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="px-4 py-2 border rounded-md disabled:opacity-50"
                                        >
                                            Next
                                        </button>

                                        <button
                                            onClick={() => fetchReadings(pagination.totalPages)}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="px-4 py-2 border rounded-md disabled:opacity-50"
                                        >
                                            Last
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span>Items per page:</span>
                                        <select
                                            value={pagination.limit}
                                            onChange={(e) => {
                                                setPagination(prev => ({
                                                    ...prev,
                                                    limit: Number(e.target.value),
                                                    page: 1
                                                }));
                                            }}
                                            className="border rounded-md px-2 py-1"
                                        >
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="50">50</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* New Reading Form Modal */}
            {showNewReadingForm && connectionDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Submit New Reading</h2>
                        <form onSubmit={handleSubmitReading}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="month">
                                    Month
                                </label>
                                <input
                                    type="month"
                                    id="month"
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={newReading.month}
                                    onChange={(e) => setNewReading({ ...newReading, month: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="currentUnit">
                                    Current Reading (units)
                                </label>
                                <input
                                    type="number"
                                    id="currentUnit"
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={newReading.currentUnit}
                                    onChange={(e) => setNewReading({ ...newReading, currentUnit: e.target.value })}
                                    min="0"
                                    step="1"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNewReadingForm(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Reading'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeterReadings;