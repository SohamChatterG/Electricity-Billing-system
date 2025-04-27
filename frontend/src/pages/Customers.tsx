import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    createdAt: string;
    _count: {
        connections: number;
        bills: number;
    };
}

const CustomersPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [notificationData, setNotificationData] = useState({
        title: '',
        message: ''
    });

    const isAdmin = localStorage.getItem('role') === 'admin';

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/customers', {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: searchTerm }
            });
            setCustomers(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomers();
    };

    const handleSendNotification = (customer: Customer) => {
        setCurrentCustomer(customer);
        setShowNotificationModal(true);
    };

    const handleNotificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCustomer) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:8000/api/customers/${currentCustomer.id}/send-notification`,
                notificationData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Notification sent successfully');
            setShowNotificationModal(false);
            setNotificationData({ title: '', message: '' });
        } catch (error) {
            toast.error('Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCustomers();
    }, []);

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Customers</h2>
                    <p className="text-gray-600">You must be an admin to view this page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Customer Management</h1>

            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Search Customers</h2>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-grow">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                            placeholder="Search by name, email or phone"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Name</th>
                                <th className="text-left py-2">Email</th>
                                <th className="text-left py-2">Phone</th>
                                <th className="text-left py-2">Connections</th>
                                <th className="text-left py-2">Bills</th>
                                <th className="text-left py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id} className="border-b">
                                    <td className="py-2">{customer.name}</td>
                                    <td className="py-2">{customer.email}</td>
                                    <td className="py-2">{customer.phone}</td>
                                    <td className="py-2">{customer._count.connections}</td>
                                    <td className="py-2">{customer._count.bills}</td>
                                    <td className="py-2">
                                        <button
                                            onClick={() => handleSendNotification(customer)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Send Notification
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notification Modal */}
            {showNotificationModal && currentCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">
                            Send Notification to {currentCustomer.name}
                        </h2>
                        <form onSubmit={handleNotificationSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-2">Title</label>
                                <input
                                    type="text"
                                    value={notificationData.title}
                                    onChange={(e) => setNotificationData({
                                        ...notificationData,
                                        title: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2">Message</label>
                                <textarea
                                    value={notificationData.message}
                                    onChange={(e) => setNotificationData({
                                        ...notificationData,
                                        message: e.target.value
                                    })}
                                    className="w-full px-4 py-2 border rounded-md"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNotificationModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send Notification'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersPage;