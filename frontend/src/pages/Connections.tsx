// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// interface Connection {
//     id: string;
//     meterNumber: string;
//     type: string;
//     isActive: boolean;
//     customerId: string;
//     createdAt: string;
// }

// interface Customer {
//     id: string;
//     name: string;
//     email: string;
//     phone: string;
//     address: string;
//     createdAt: string;
// }

// interface CustomerWithConnections {
//     customer: Customer;
//     connections: Connection[];
// }


// const ConnectionsPage = () => {
//     const [customerId, setCustomerId] = useState('');
//     const [customerData, setCustomerData] = useState<CustomerWithConnections | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [showCreateForm, setShowCreateForm] = useState(false);
//     const [newConnection, setNewConnection] = useState({
//         customerId: '',
//         connectionType: 'residential'
//     });


//     const isAdmin = localStorage.getItem('role') === 'admin';

//     const handleSearch = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!customerId) {
//             toast.error('Please enter a customer ID');
//             return;
//         }

//         try {
//             setLoading(true);
//             const token = localStorage.getItem('token');
//             const response = await axios.get(
//                 `http://localhost:8000/api/connection/get-connection/${customerId}`,
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );
//             if (response.data.customer) {
//                 setCustomerData({
//                     customer: response.data.customer,
//                     connections: response.data.connections || []
//                 });
//                 toast.success(`Found ${response.data.connections?.length || 0} connections`);
//             } else {
//                 toast.error('Customer data not found in response');
//                 setCustomerData(null);
//             }
//         } catch (error) {
//             toast.error('Failed to fetch connections');
//             setCustomerData(null);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleCreateConnection = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             setLoading(true);
//             const token = localStorage.getItem('token');
//             const response = await axios.post(
//                 'http://localhost:8000/api/connection/create-connection',
//                 {
//                     customerId: newConnection.customerId,
//                     connectionType: newConnection.connectionType
//                 },
//                 {
//                     headers: { Authorization: `Bearer ${token}` }
//                 }
//             );
//             toast.success('Connection created successfully');
//             setShowCreateForm(false);
//             // Refresh the connections list if we're viewing the same customer
//             if (newConnection.customerId === customerId) {
//                 await handleSearch(e);
//             }
//         } catch (error) {
//             toast.error('Failed to create connection');
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isAdmin) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <div className="bg-white p-8 rounded-lg shadow-md text-center">
//                     <h2 className="text-2xl font-bold mb-4">Connections</h2>
//                     <p className="text-gray-600">You must be an admin to view this page</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-3xl font-bold mb-6">Connection Management</h1>

//             {/* Search Section */}
//             <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//                 <h2 className="text-xl font-semibold mb-4">Find Connections</h2>
//                 <form onSubmit={handleSearch} className="flex gap-4">
//                     <div className="flex-grow">
//                         <input
//                             type="text"
//                             value={customerId}
//                             onChange={(e) => setCustomerId(e.target.value)}
//                             className="w-full px-4 py-2 border rounded-md"
//                             placeholder="Enter Customer ID"
//                         />
//                     </div>
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
//                     >
//                         {loading ? 'Searching...' : 'Search'}
//                     </button>
//                 </form>
//             </div>

//             {/* Create Connection Button */}
//             <div className="mb-8">
//                 <button
//                     onClick={() => setShowCreateForm(!showCreateForm)}
//                     className="bg-green-600 text-white px-4 py-2 rounded-md"
//                 >
//                     {showCreateForm ? 'Cancel' : 'Create New Connection'}
//                 </button>
//             </div>

//             {/* Create Connection Form */}
//             {showCreateForm && (
//                 <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//                     <h2 className="text-xl font-semibold mb-4">Create New Connection</h2>
//                     <form onSubmit={handleCreateConnection} className="space-y-4">
//                         <div>
//                             <label className="block mb-2">Customer ID</label>
//                             <input
//                                 type="text"
//                                 value={newConnection.customerId}
//                                 onChange={(e) => setNewConnection({ ...newConnection, customerId: e.target.value })}
//                                 className="w-full px-4 py-2 border rounded-md"
//                                 required
//                             />
//                         </div>
//                         <div>
//                             <label className="block mb-2">Connection Type</label>
//                             <select
//                                 value={newConnection.connectionType}
//                                 onChange={(e) => setNewConnection({ ...newConnection, connectionType: e.target.value })}
//                                 className="w-full px-4 py-2 border rounded-md"
//                             >
//                                 <option value="residential">Residential</option>
//                                 <option value="commercial">Commercial</option>
//                                 <option value="industrial">Industrial</option>
//                             </select>
//                         </div>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
//                         >
//                             {loading ? 'Creating...' : 'Create Connection'}
//                         </button>
//                     </form>
//                 </div>
//             )}

//             {/* Customer and Connections Table */}
//             {customerData?.customer ? (
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                     <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
//                     <div className="mb-6">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <p className="font-medium">Name:</p>
//                                 <p>{customerData.customer.name}</p>
//                             </div>
//                             <div>
//                                 <p className="font-medium">Email:</p>
//                                 <p>{customerData.customer.email}</p>
//                             </div>
//                             <div>
//                                 <p className="font-medium">Phone:</p>
//                                 <p>{customerData.customer.phone}</p>
//                             </div>
//                             <div>
//                                 <p className="font-medium">Address:</p>
//                                 <p>{customerData.customer.address}</p>
//                             </div>
//                             <div>
//                                 <p className="font-medium">Customer Since:</p>
//                                 <p>{new Date(customerData.customer.createdAt).toLocaleDateString()}</p>
//                             </div>
//                         </div>
//                     </div>

//                     <h2 className="text-xl font-semibold mb-4">Connection Details</h2>
//                     {customerData.connections.length > 0 ? (
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full">
//                                 <thead>
//                                     <tr className="border-b">
//                                         <th className="text-left py-2">Meter Number</th>
//                                         <th className="text-left py-2">Type</th>
//                                         <th className="text-left py-2">Status</th>
//                                         <th className="text-left py-2">Created At</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {customerData.connections.map((conn) => (
//                                         <tr key={conn.id} className="border-b">
//                                             <td className="py-2">{conn.meterNumber}</td>
//                                             <td className="py-2">{conn.type}</td>
//                                             <td className="py-2">
//                                                 <span className={`px-2 py-1 rounded-full text-xs ${conn.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                                                     }`}>
//                                                     {conn.isActive ? 'Active' : 'Inactive'}
//                                                 </span>
//                                             </td>
//                                             <td className="py-2">{new Date(conn.createdAt).toLocaleDateString()}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     ) : (
//                         <p className="text-gray-600">No connections found for this customer.</p>
//                     )}
//                 </div>
//             ) : (
//                 <div className="bg-white rounded-lg shadow-md p-6 text-center">
//                     <p className="text-gray-600">No customer data found. Search for a customer to view their details.</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ConnectionsPage;

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Connection {
    id: string;
    meterNumber: string;
    type: string;
    isActive: boolean;
    customerId: string;
    createdAt: string;
    updatedAt: string;
}

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    createdAt: string;
}

interface CustomerWithConnections {
    customer: Customer;
    connections: Connection[];
}

const ConnectionsPage = () => {
    const [customerId, setCustomerId] = useState('');
    const [customerData, setCustomerData] = useState<CustomerWithConnections | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [currentConnection, setCurrentConnection] = useState<Connection | null>(null);
    const [newConnection, setNewConnection] = useState({
        customerId: '',
        connectionType: 'residential'
    });
    const [editConnection, setEditConnection] = useState({
        type: 'residential',
        status: 'active'
    });

    const isAdmin = localStorage.getItem('role') === 'admin';

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId) {
            toast.error('Please enter a customer ID');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8000/api/connection/get-connection/${customerId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.customer) {
                setCustomerData({
                    customer: response.data.customer,
                    connections: response.data.connections || []
                });
                toast.success(`Found ${response.data.connections?.length || 0} connections`);
            } else {
                toast.error('Customer data not found in response');
                setCustomerData(null);
            }
        } catch (error) {
            toast.error('Failed to fetch connections');
            setCustomerData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConnection = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8000/api/connection/create-connection',
                {
                    customerId: newConnection.customerId,
                    connectionType: newConnection.connectionType
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Connection created successfully');
            setShowCreateForm(false);
            // Refresh the connections list
            if (newConnection.customerId === customerId) {
                await handleSearch(e);
            }
        } catch (error) {
            toast.error('Failed to create connection');
        } finally {
            setLoading(false);
        }
    };

    const handleEditConnection = (connection: Connection) => {
        setCurrentConnection(connection);
        setEditConnection({
            type: connection.type,
            status: connection.isActive ? 'active' : 'inactive'
        });
        setShowEditForm(true);
    };

    const handleUpdateConnection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentConnection) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8000/api/connection/update-connection/${currentConnection.id}`,
                {
                    type: editConnection.type,
                    status: editConnection.status
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Connection updated successfully');
            setShowEditForm(false);
            // Refresh the connections list
            await handleSearch(e);
        } catch (error) {
            toast.error('Failed to update connection');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateConnection = async (connectionId: string) => {


        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `http://localhost:8000/api/connection/deactivate-connection/${connectionId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success(response.data.message);
            // Refresh the connections list
            const e = new Event('submit') as unknown as React.FormEvent;
            await handleSearch(e);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to deactivate connection');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Connections</h2>
                    <p className="text-gray-600">You must be an admin to view this page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Connection Management</h1>

            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Find Connections</h2>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-grow">
                        <input
                            type="text"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                            placeholder="Enter Customer ID"
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

            {/* Create Connection Button */}
            <div className="mb-8">
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                >
                    {showCreateForm ? 'Cancel' : 'Create New Connection'}
                </button>
            </div>

            {/* Create Connection Form */}
            {showCreateForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Create New Connection</h2>
                    <form onSubmit={handleCreateConnection} className="space-y-4">
                        <div>
                            <label className="block mb-2">Customer ID</label>
                            <input
                                type="text"
                                value={newConnection.customerId}
                                onChange={(e) => setNewConnection({ ...newConnection, customerId: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Connection Type</label>
                            <select
                                value={newConnection.connectionType}
                                onChange={(e) => setNewConnection({ ...newConnection, connectionType: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md"
                            >
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Connection'}
                        </button>
                    </form>
                </div>
            )}

            {/* Edit Connection Form */}
            {showEditForm && currentConnection && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Edit Connection</h2>
                    <form onSubmit={handleUpdateConnection} className="space-y-4">
                        <div>
                            <label className="block mb-2">Meter Number</label>
                            <input
                                type="text"
                                value={currentConnection.meterNumber}
                                className="w-full px-4 py-2 border rounded-md bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Connection Type</label>
                            <select
                                value={editConnection.type}
                                onChange={(e) => setEditConnection({ ...editConnection, type: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md"
                            >
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2">Status</label>
                            <select
                                value={editConnection.status}
                                onChange={(e) => setEditConnection({ ...editConnection, status: e.target.value })}
                                className="w-full px-4 py-2 border rounded-md"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Connection'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEditForm(false)}
                                className="bg-gray-500 text-white px-6 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Customer and Connections Table */}
            {customerData ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="font-medium">Name:</p>
                                <p>{customerData.customer.name}</p>
                            </div>
                            <div>
                                <p className="font-medium">Email:</p>
                                <p>{customerData.customer.email}</p>
                            </div>
                            <div>
                                <p className="font-medium">Phone:</p>
                                <p>{customerData.customer.phone}</p>
                            </div>
                            <div>
                                <p className="font-medium">Address:</p>
                                <p>{customerData.customer.address}</p>
                            </div>
                            <div>
                                <p className="font-medium">Customer Since:</p>
                                <p>{new Date(customerData.customer.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mb-4">Connection Details</h2>
                    {customerData.connections.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Meter Number</th>
                                        <th className="text-left py-2">Type</th>
                                        <th className="text-left py-2">Status</th>
                                        <th className="text-left py-2">Created At</th>
                                        <th className="text-left py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerData.connections.map((conn) => (
                                        <tr key={conn.id} className="border-b">
                                            <td className="py-2">{conn.meterNumber}</td>
                                            <td className="py-2">{conn.type}</td>
                                            <td className="py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${conn.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {conn.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-2">{new Date(conn.createdAt).toLocaleDateString()}</td>
                                            <td className="py-2 space-x-2">
                                                <button
                                                    onClick={() => handleEditConnection(conn)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>
                                                {conn.isActive && (
                                                    <button
                                                        onClick={() => handleDeactivateConnection(conn.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-600">No connections found for this customer.</p>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600">No customer data found. Search for a customer to view their details.</p>
                </div>
            )}
        </div>
    );
};

export default ConnectionsPage;