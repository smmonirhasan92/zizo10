'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ShieldAlert, User, Clock, Search } from 'lucide-react';

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            // Need to implement getLogs in some controller?
            // Actually, I need to create the endpoint for this first.
            // Fetch from /admin/logs (mapped to adminController.getAuditLogs)
            const res = await api.get('/admin/logs');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 pb-24">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-indigo-600" />
                Admin Action History (Audit Log)
            </h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4 border-b">Time</th>
                                <th className="p-4 border-b">Admin</th>
                                <th className="p-4 border-b">Action</th>
                                <th className="p-4 border-b">Target User</th>
                                <th className="p-4 border-b">Details</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading Logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No logs found.</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 border-b last:border-0 transition">
                                    <td className="p-4 font-mono text-xs text-slate-500">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4 font-bold text-indigo-600">
                                        ID: {log.adminId}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${log.action.includes('Ban') || log.action.includes('Lock') ? 'bg-red-100 text-red-700' :
                                            log.action.includes('Promote') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {log.targetUserId ? `User ID: ${log.targetUserId}` : 'System'}
                                    </td>
                                    <td className="p-4 text-slate-600 max-w-xs truncate" title={log.details}>
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
