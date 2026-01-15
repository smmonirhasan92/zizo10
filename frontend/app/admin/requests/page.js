'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import Link from 'next/link';
// import Image from 'next/image'; // Assuming we might verify images later, check usage
import { ArrowLeft, Check, X, Clock } from 'lucide-react';

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState({}); // Map of requestId -> agentId

    const fetchRequests = async () => {
        try {
            const res = await api.get('/admin/recharges');
            setRequests(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        try {
            const res = await api.get('/admin/agents');
            setAgents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchAgents();
    }, []);

    const handleAction = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action}?`)) return;
        try {
            await api.post('/admin/deposit-request', { requestId: id, action });
            fetchRequests();
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleAssign = async (requestId) => {
        const agentId = selectedAgents[requestId];
        if (!agentId) return alert('Select an agent first');

        try {
            await api.post('/admin/deposit-assign', { requestId, agentId });
            alert('Assigned to Agent Successfully');
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert('Assignment Failed');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm z-10 border-b border-gray-100">
                <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-6 h-6 text-gray-700" /></Link>
                <h1 className="text-lg font-bold text-gray-800">Recharge Requests</h1>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                {loading ? (
                    <p className="text-center text-gray-500 mt-10">Loading...</p>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Clock className="w-12 h-12 mb-2 opacity-20" />
                        <p>No pending requests</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-gray-800">{req.User?.fullName || 'Unknown User'}</p>
                                        <p className="text-xs text-gray-500">{req.User?.phone}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${req.assignedAgentId ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {req.assignedAgentId ? 'Assigned' : 'Pending'}
                                    </span>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-xl mb-4 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Amount Returns</span>
                                    <span className="font-bold text-lg text-pink-600">৳ {req.amount}</span>
                                </div>

                                {req.proofImage && (
                                    <div className="mb-4">
                                        <p className="text-xs text-slate-500 mb-1 font-bold">Payment Proof:</p>
                                        {(() => {
                                            // Robust Path Cleaning: Remove 'api/' or 'backend/' prefixes
                                            let cleanPath = req.proofImage.replace(/\\/g, '/');
                                            cleanPath = cleanPath.replace(/^api\//, '').replace(/^backend\//, '');
                                            if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

                                            // Final URL (Assumes served from http://localhost:5000/uploads/...)
                                            const imgUrl = `http://localhost:5000/${cleanPath}`;

                                            return (
                                                <>
                                                    <div className="relative w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-2 flex justify-center">
                                                        <img
                                                            src={imgUrl}
                                                            alt="Proof"
                                                            className="h-auto max-h-64 object-contain"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                        <span className="hidden text-xs text-red-400 py-4">Image Failed to Load</span>
                                                    </div>
                                                    <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline flex items-center gap-1 font-bold">
                                                        View Full Proof
                                                    </a>
                                                    {/* Debugging Text for Admin - Remove later */}
                                                    <span className="text-[10px] text-slate-400 font-mono block mt-1 break-all">
                                                        src: {cleanPath}
                                                    </span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Admin Mediator Assign UI */}
                                {!req.assignedAgentId && (
                                    <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wide">Assign Agent for Verification</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <select
                                                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 appearance-none bg-white transition-all"
                                                    value={selectedAgents[req.id] || ''}
                                                    onChange={(e) => setSelectedAgents(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                >
                                                    <option value="">Select Agent...</option>
                                                    {agents.map(agent => (
                                                        <option key={agent.id} value={agent.id}>
                                                            {agent.fullName} ({agent.phone})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAssign(req.id)}
                                                className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/20 active:scale-95 flex items-center gap-2"
                                            >
                                                SEND REQUEST
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleAction(req.id, 'reject')} className="py-3 rounded-xl border border-red-100 text-red-600 font-bold text-sm hover:bg-red-50 transition flex justify-center items-center gap-2">
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                    <button onClick={() => handleAction(req.id, 'approve')} className="py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition flex justify-center items-center gap-2 shadow-lg shadow-green-500/20">
                                        <Check className="w-4 h-4" /> Direct Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
