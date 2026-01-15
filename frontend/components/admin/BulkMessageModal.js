'use client';
import { useState } from 'react';
import { Send, Users, X, Filter } from 'lucide-react';
import api from '../../services/api';

export default function BulkMessageModal({ show, onClose }) {
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('System Announcement');
    const [roleFilter, setRoleFilter] = useState(''); // '' (All), 'user', 'agent'
    const [tierFilter, setTierFilter] = useState(''); // '' (All), 'VIP', 'Gold', etc.
    const [sending, setSending] = useState(false);

    if (!show) return null;

    const handleSend = async () => {
        if (!message) return alert('Message is required');
        if (!confirm('Are you sure you want to send this to MANY users?')) return;

        setSending(true);
        try {
            await api.post('/admin/admin/message/bulk', {
                roleFilter: roleFilter || null,
                tierFilter: tierFilter || null, // Backend handles null/empty
                title,
                message
            });

            alert('Bulk Message Sent Successfully!');
            setMessage('');
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to send bulk message!');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-purple-100">
                <div className="bg-purple-900 p-5 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-purple-300" />
                        <div>
                            <h3 className="font-bold text-lg">Bulk Messaging</h3>
                            <p className="text-xs text-purple-300">Send announcements to multiple users</p>
                        </div>
                    </div>
                    <button onClick={onClose}><X className="w-6 h-6 opacity-70 hover:opacity-100" /></button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Filters */}
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Role Filter</label>
                            <select
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none"
                            >
                                <option value="">All Roles</option>
                                <option value="user">Users Only</option>
                                <option value="agent">Agents Only</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tier Filter</label>
                            <select
                                value={tierFilter}
                                onChange={e => setTierFilter(e.target.value)}
                                className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 outline-none"
                            >
                                <option value="">All Tiers</option>
                                <option value="VIP">VIP</option>
                                <option value="Diamond">Diamond</option>
                                <option value="Platinum">Platinum</option>
                                <option value="Gold">Gold</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Announcement Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-bold text-gray-700"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Message Content</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={5}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"
                            placeholder="Write your announcement here..."
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-purple-200 flex justify-center items-center gap-2 transform active:scale-[0.98]"
                    >
                        {sending ? 'Broadcasting...' : '📢 Broadcast Message'}
                    </button>

                    <p className="text-center text-[10px] text-gray-400">
                        This message will be sent to all users matching the filters above.
                    </p>
                </div>
            </div>
        </div>
    );
}
