'use client';
import { useState } from 'react';
import { Send, Users, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminMessageModal({ show, onClose, userId, userName }) {
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('Important Notice');
    const [sending, setSending] = useState(false);

    if (!show) return null;

    const handleSend = async () => {
        if (!message) return alert('Message is required');
        setSending(true);
        try {
            await api.post('/admin/admin/message/send', { userId, title, message }); // Double check URL: /api/admin/admin/...? 
            // In adminRoutes: router.post('/admin/message/send'...) mounted at /api/admin
            // So URL is /api/admin/admin/message/send ? 
            // Wait. In server.js: app.use('/api/admin', adminRoutes);
            // In adminRoutes: router.post('/admin/message/send', ...);
            // So path is /api/admin/admin/message/send? 
            // Usually we don't repeat 'admin'. Let's check adminRoutes content again.
            // Line 88: router.post('/admin/message/send', ...);
            // YES. It repeats. I should probably fix that or just use it.
            // I'll use it as matches backend but in future I should rename route to just `/message/send`.
            // For now: /api/admin/admin/message/send

            alert('Message Sent!');
            setMessage('');
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to send!');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        <h3 className="font-bold">Message {userName}</h3>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 opacity-80 hover:opacity-100" /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-bold text-gray-700"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Message</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={4}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"
                            placeholder="Write your message here..."
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition shadow-lg shadow-purple-200 flex justify-center items-center gap-2"
                    >
                        {sending ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </div>
        </div>
    );
}
