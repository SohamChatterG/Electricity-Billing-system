import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

interface Bill {
    id: string;
    amount: number;
    dueDate: string;
    isPaid: boolean;
    createdAt: string;
    reading?: {
        id: string;
        value: number;
    };
    payment?: {
        id: string;
        method: string;
    };
    customer?: {
        id: string;
        name: string;
    };
}

const Bills = () => {
    const { isLoggedIn, userRole, logout } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [currentBill, setCurrentBill] = useState<Bill | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

    const fetchBills = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Only proceed if user is authenticated
            if (!isLoggedIn || !userRole) {
                throw new Error('User not authenticated');
            }

            const params = {
                status: filter === 'all' ? undefined : filter,
                // Only include customerId if user is a customer
                customerId: userRole === 'admin' ? undefined : localStorage.getItem('userId')
            };

            const response = await axios.get('http://localhost:8000/api/bills', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setBills(response.data.bills);
        } catch (error) {
            toast.error('Failed to fetch bills');
            // If unauthorized, log the user out
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = (bill: Bill) => {
        setCurrentBill(bill);
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        if (!currentBill) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8000/api/payment',
                {
                    billId: currentBill.id,
                    method: paymentMethod,
                    amount: currentBill.amount
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success(response.data.message);
            setShowPaymentModal(false);
            fetchBills(); // Refresh bills list
        } catch (error) {
            toast.error('Payment failed');
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchBills();
        }
    }, [filter, isLoggedIn]);

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Bills</h2>
                    <p className="text-gray-600">Please log in to view your bills</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">
                {userRole === 'admin' ? 'All Bills' : 'My Bills'}
            </h1>

            {/* Filter Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center space-x-4">
                    <span className="font-medium">Filter:</span>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('paid')}
                        className={`px-4 py-2 rounded-md ${filter === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Paid
                    </button>
                    <button
                        onClick={() => setFilter('unpaid')}
                        className={`px-4 py-2 rounded-md ${filter === 'unpaid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Unpaid
                    </button>
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
                {loading ? (
                    <div className="text-center py-8">Loading bills...</div>
                ) : bills.length === 0 ? (
                    <div className="text-center py-8">No bills found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Bill ID</th>
                                    <th className="text-left py-2">Amount</th>
                                    <th className="text-left py-2">Due Date</th>
                                    <th className="text-left py-2">Status</th>
                                    {userRole === 'admin' && <th className="text-left py-2">Customer</th>}
                                    <th className="text-left py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill.id} className="border-b">
                                        <td className="py-2">{bill.id.slice(0, 8)}...</td>
                                        <td className="py-2">₹{bill.amount.toFixed(2)}</td>
                                        <td className="py-2">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                        <td className="py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${bill.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {bill.isPaid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        {userRole === 'admin' && (
                                            <td className="py-2">
                                                {bill.customer?.name || 'N/A'}
                                            </td>
                                        )}
                                        <td className="py-2">
                                            {!bill.isPaid && (
                                                <button
                                                    onClick={() => handlePayment(bill)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && currentBill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Make Payment</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium">Bill ID:</p>
                                <p>{currentBill.id}</p>
                            </div>
                            <div>
                                <p className="font-medium">Amount:</p>
                                <p>₹{currentBill.amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="font-medium">Due Date:</p>
                                <p>{new Date(currentBill.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="block mb-2">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md"
                                >
                                    <option value="credit_card">Credit Card</option>
                                    <option value="debit_card">Debit Card</option>
                                    <option value="net_banking">Net Banking</option>
                                    <option value="upi">UPI</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={processPayment}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Confirm Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bills;