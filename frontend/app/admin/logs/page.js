'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
// Layout is handled by app/admin/layout.js
import { format } from 'date-fns';
import { ShieldAlert, User, Wallet, Settings, Lock, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ActionLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/admin/audit-logs');
            setLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch logs', err);
        } finally {
            setLoading(false);
        }
    };

    // Group logs by Date (YYYY-MM-DD)
    const groupedLogs = logs.reduce((groups, log) => {
        const date = format(new Date(log.createdAt), 'yyyy-MM-dd');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(log);
        return groups;
    }, {});

    // Sort dates descending
    const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b) - new Date(a));

    const getIcon = (action) => {
        const lower = action.toLowerCase();
        if (lower.includes('lock')) return <Lock className="w-4 h-4 text-rose-400" />;
        if (lower.includes('promote')) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
        if (lower.includes('penalty')) return <ShieldAlert className="w-4 h-4 text-amber-400" />;
        if (lower.includes('status')) return <Settings className="w-4 h-4 text-blue-400" />;
        if (lower.includes('deposit') || lower.includes('withdraw')) return <Wallet className="w-4 h-4 text-purple-400" />;
        return <Clock className="w-4 h-4 text-slate-400" />;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Action Logs</h1>
                    <p className="text-slate-400 mt-1">Immutable daily timeline of administrative actions</p>
                </div>
                <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-white/5">
                    <span className="text-sm text-slate-400">Total Records: <span className="text-white font-bold">{logs.length}</span></span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-800 ml-4 space-y-12">
                    {sortedDates.map(date => (
                        <div key={date} className="relative pl-8">
                            {/* Date Header Marker */}
                            <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-indigo-500 border-4 border-[#0f172a] shadow-lg shadow-indigo-500/20"></div>

                            <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3">
                                {format(new Date(date), 'MMMM do, yyyy')}
                                <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-white/5">
                                    {format(new Date(date), 'eeee')}
                                </span>
                            </h2>

                            <div className="space-y-3">
                                {groupedLogs[date].map((log) => (
                                    <div key={log.id} className="group bg-[#1e293b]/50 hover:bg-[#1e293b] border border-white/5 p-4 rounded-xl transition-all duration-200 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 p-2 rounded-lg bg-slate-800 border border-white/5 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-colors">
                                                    {getIcon(log.action)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-bold text-white">{log.action}</span>
                                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                                                            {format(new Date(log.createdAt), 'hh:mm a')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                        {log.details}
                                                    </p>

                                                    {/* Context Metadata */}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="w-3 h-3" />
                                                            <span>By: <span className="text-slate-300 font-semibold">{log.adminName || `Admin #${log.adminId}`}</span></span>
                                                        </div>
                                                        {log.targetUserId && (
                                                            <div className="flex items-center gap-1.5">
                                                                <User className="w-3 h-3 text-emerald-500" />
                                                                <span>Target: <span className="text-emerald-400 font-semibold">{log.targetUserName || `User #${log.targetUserId}`}</span></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-[10px] text-slate-600 font-mono">
                                                ID: {log.id}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
