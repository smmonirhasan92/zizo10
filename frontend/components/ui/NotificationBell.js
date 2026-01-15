'use client';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../../services/api';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/user/notifications/my');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    const markAsRead = async () => {
        if (unreadCount > 0) {
            try {
                await api.post('/user/notifications/read'); // Mark all as read
                setUnreadCount(0);
                // Locally update state to read
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const toggleOpen = () => {
        if (!isOpen) {
            fetchNotifications(); // Refresh on open
            markAsRead(); // Auto mark read on open? Or maybe just fetch. Let's mark read if they open the dropdown.
            // Actually usually we mark read when they click the item OR when they open the "tray". 
            // For simplicity, let's mark all read when tray opens.
            markAsRead();
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <button onClick={toggleOpen} className="p-2 relative rounded-full hover:bg-slate-100 transition">
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-purple-600 fill-purple-100' : 'text-slate-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                    <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 text-sm">Notifications</h3>
                        <button onClick={() => setIsOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`p-4 border-b hover:bg-slate-50 transition cursor-default ${notif.isRead ? 'opacity-70' : 'bg-purple-50/30'}`}>
                                    <h4 className="font-bold text-sm text-slate-800 mb-1">{notif.title}</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                                    <span className="text-[10px] text-slate-400 mt-2 block">
                                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
