'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import Link from 'next/link';
// import Image from 'next/image'; // Assuming we might verify images later, check usage
import { ArrowLeft, Check, X, Clock } from 'lucide-react';

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchRequests();
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
                                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md uppercase">Pending</span>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-xl mb-4 flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Amount Requested</span>
                                    <span className="font-bold text-lg text-pink-600">৳ {req.amount}</span>
                                </div>

                                {req.proofImage && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-1">Proof:</p>
                                        <a href={`https://zizo10.com/api/${req.proofImage}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline truncate block">
                                            View Proof Image
                                        </a>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleAction(req.id, 'reject')} className="py-3 rounded-xl border border-red-100 text-red-600 font-bold text-sm hover:bg-red-50 transition flex justify-center items-center gap-2">
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                    <button onClick={() => handleAction(req.id, 'approve')} className="py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition flex justify-center items-center gap-2 shadow-lg shadow-green-500/20">
                                        <Check className="w-4 h-4" /> Approve
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
