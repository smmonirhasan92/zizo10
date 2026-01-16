'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../services/api'; // Correct path to services/api
import { ArrowLeft, Save, Lock, Unlock, ShieldAlert, Award, AlertTriangle, Activity } from 'lucide-react';

export default function UserProfileClient() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        phone: '',
        role: 'user',
        accountStatus: 'active',
        mainBalance: 0,
        incomeBalance: 0,
        gameBalance: 0,
        password: '' // Optional reset
    });

    useEffect(() => {
        if (id) fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            const res = await api.get(`/admin/user/${id}`);
            const u = res.data.user;
            setUser(u);
            setFormData({
                fullName: u.fullName || '',
                username: u.username || '',
                phone: u.phone || '',
                role: u.role || 'user',
                accountStatus: u.accountStatus || 'active',
                mainBalance: u.Wallet?.balance || 0,
                incomeBalance: u.income_balance || 0,
                gameBalance: u.Wallet?.game_balance || 0,
                password: ''
            });
        } catch (err) {
            console.error('FETCH ERROR:', err);
            alert(`Failed to load user: ${err.message} (${err.response?.status})`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Clean undefined/empty password
            const payload = { ...formData };
            if (!payload.password) delete payload.password;

            await api.put(`/admin/user/${id}`, payload);
            alert('✅ User Updated Successfully');
            fetchUserDetails(); // Refresh
        } catch (err) {
            console.error(err);
            alert('❌ Update Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-500 font-bold">Loading Profile...</div>;
    if (!user) return <div className="p-10 text-center">User not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* 1. Header with Gradient */}
            <div className="bg-slate-900 text-white p-6 pb-24 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600/30 rounded-full blur-3xl -ml-16 -mb-16"></div>

                <div className="relative z-10 max-w-5xl mx-auto flex justify-between items-center">
                    <button onClick={() => router.back()} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Profile Editor</h1>
                    <div className="w-12"></div> {/* Spacer */}
                </div>
            </div>

            {/* 2. Main Content Card */}
            <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">

                    {/* User ID Badge */}
                    <div className="flex justify-center -mt-16 mb-6">
                        <div className="bg-white p-2 rounded-full shadow-lg">
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-700 border-4 border-indigo-500 relative">
                                {user.fullName?.[0]}
                                <div className={`absolute bottom-1 right-1 w-6 h-6 border-4 border-white rounded-full ${user.accountStatus === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-2">Personal Information</h3>

                            <div className="form-group">
                                <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                                <input
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-indigo-500"
                                />
                            </div>

                            <div className="form-group">
                                <label className="text-xs font-bold text-slate-500 ml-1">Phone Number</label>
                                <input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-indigo-500"
                                />
                            </div>

                            <div className="form-group">
                                <label className="text-xs font-bold text-slate-500 ml-1">Username</label>
                                <input
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-indigo-500"
                                />
                            </div>

                            <div className="form-group">
                                <label className="text-xs font-bold text-slate-500 ml-1">Set New Password (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Type to reset..."
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full p-3 bg-rose-50 border border-rose-100 rounded-xl font-mono text-rose-600 placeholder:text-rose-300 focus:outline-rose-500"
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Financials & Status */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-2">Financials & Status</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-emerald-600 ml-1">Main Balance</label>
                                    <input
                                        type="number"
                                        value={formData.mainBalance}
                                        onChange={e => setFormData({ ...formData, mainBalance: e.target.value })}
                                        className="w-full p-3 bg-emerald-50 border border-emerald-100 rounded-xl font-mono font-bold text-emerald-700 focus:outline-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-purple-600 ml-1">Income Balance</label>
                                    <input
                                        type="number"
                                        value={formData.incomeBalance}
                                        onChange={e => setFormData({ ...formData, incomeBalance: e.target.value })}
                                        className="w-full p-3 bg-purple-50 border border-purple-100 rounded-xl font-mono font-bold text-purple-700 focus:outline-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Game Balance Removed as per User Request */}

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-1">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-indigo-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="agent">Agent</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 ml-1">Status</label>
                                    <select
                                        value={formData.accountStatus}
                                        onChange={e => setFormData({ ...formData, accountStatus: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-indigo-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {/* Stats */}
                            <span className="bg-slate-100 px-3 py-1 rounded-full">Referrals: {user.stats?.totalReferrals || 0}</span>
                            <span className="bg-slate-100 px-3 py-1 rounded-full">Tier: {user.account_tier || 'Starter'}</span>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Update Information'}
                        </button>
                    </div>

                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:bg-rose-50 hover:border-rose-200 transition group pointer-events-none opacity-50">
                        <Lock className="w-6 h-6 text-rose-500 mb-1" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-rose-600">Lock Withdraw</span>
                        <span className="text-[10px] text-slate-400">(Coming Soon via Modal)</span>
                    </button>
                    <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:bg-amber-50 hover:border-amber-200 transition group pointer-events-none opacity-50">
                        <AlertTriangle className="w-6 h-6 text-amber-500 mb-1" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-amber-600">Impose Penalty</span>
                    </button>
                    <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 transition group pointer-events-none opacity-50">
                        <Award className="w-6 h-6 text-emerald-500 mb-1" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-600">Promote Rank</span>
                    </button>
                    <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition group">
                        <Activity className="w-6 h-6 text-blue-500 mb-1" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">Activity Logs</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
