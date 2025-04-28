import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    sentAt: string;
}

const Notifications = () => {
    const { isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/notification/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            toast.error('Failed to fetch notifications');
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:8000/api/notification/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            ));

            if (selectedNotification?.id === notificationId) {
                setSelectedNotification(prev => prev ? { ...prev, isRead: true } : null);
            }

            toast.success('Notification marked as read');
        } catch (error) {
            toast.error('Failed to mark notification as read');
            console.error('Error marking notification:', error);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchNotifications();
        }
    }, [isLoggedIn]);

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Notifications</h2>
                    <p className="text-gray-600">Please log in to view your notifications</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Your Notifications</h1>

            <div className="bg-white rounded-lg shadow-md p-6">
                {loading ? (
                    <div className="text-center py-8">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8">No notifications found</div>
                ) : (
                    <div className="space-y-4">
                        {/* Notifications List */}
                        <div className="divide-y divide-gray-200">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`py-4 px-2 cursor-pointer hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                    onClick={() => {
                                        setSelectedNotification(notification);
                                        if (!notification.isRead) {
                                            markAsRead(notification.id);
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={`font-medium ${!notification.isRead ? 'text-blue-600' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(notification.sentAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Notification Detail View */}
                        {selectedNotification && (
                            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">{selectedNotification.title}</h2>
                                    <span className="text-sm text-gray-500">
                                        {new Date(selectedNotification.sentAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="prose max-w-none">
                                    <p className="whitespace-pre-line">{selectedNotification.message}</p>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => {
                                            if (!selectedNotification.isRead) {
                                                markAsRead(selectedNotification.id);
                                            }
                                        }}
                                        disabled={selectedNotification.isRead}
                                        className={`px-4 py-2 rounded-md ${selectedNotification.isRead
                                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    >
                                        {selectedNotification.isRead ? 'Already Read' : 'Mark as Read'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;