import { useState, useEffect } from 'react';
import api from '../services/api';
import { KeyRound, X, LineChart, Search, Edit2, ShieldAlert, Lock, Unlock, TrendingUp, AlertTriangle } from 'lucide-react';
import GameStatsModal from './admin/GameStatsModal';
import AdminMessageModal from './admin/AdminMessageModal';
import BulkMessageModal from './admin/BulkMessageModal';
import AdminBalanceModal from './admin/AdminBalanceModal';
import PromoteModal from './admin/PromoteModal'; // New
import PenaltyModal from './admin/PenaltyModal'; // New

export default function UserManagement() {
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [messageModal, setMessageModal] = useState({ show: false, userId: null, userName: '' });
    const [promoteModal, setPromoteModal] = useState({ show: false, userId: null, username: '', currentTier: '' });
    const [penaltyModal, setPenaltyModal] = useState({ show: false, userId: null, username: '' });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resetModal, setResetModal] = useState({ show: false, userId: null, username: '' });
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [statsModal, setStatsModal] = useState({ show: false, userId: null, username: '' });
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No authentication token found. Please login.");

            const res = await api.get('/admin/users');
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else {
                throw new Error("Invalid data format received from server");
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            const status = err.response?.status;
            let msg = "Failed to load users.";
            if (err.message === "No authentication token found. Please login.") {
                msg = err.message;
            } else if (status === 401 || status === 403) {
                msg = `Access Denied (${status}). Your session may have expired.`;
            } else {
                msg = `Error: ${err.message}`;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put('/admin/user/role', { userId, role: newRole });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to update role");
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await api.put('/admin/user/status', { userId, status: newStatus });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    const handleLockWithdraw = async (userId, currentStatus) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'UNLOCK' : 'LOCK'} withdrawals for this user?`)) return;
        try {
            await api.post('/admin/user/lock-withdraw', { userId, isLocked: !currentStatus });
            fetchUsers(); // Refresh to show new state
        } catch (err) {
            console.error(err);
            alert("Failed to update withdraw lock status");
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword) return;
        setResetLoading(true);
        try {
            await api.put('/admin/user/reset-password', { userId: resetModal.userId, newPassword });
            setResetModal({ show: false, userId: null, username: '' });
            setNewPassword('');
            alert('Password reset successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to reset password');
        } finally {
            setResetLoading(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'super_admin': return 'bg-purple-100 text-purple-600 border-purple-200';
            case 'employee_admin': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'agent': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-400 font-medium">Loading users...</p>
        </div>
    );

    if (error) return (
        <div className="flex justify-center py-12">
            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200 shadow-sm max-w-md text-center">
                <p className="font-bold mb-2">Access Issue</p>
                <p>{error}</p>
                <button onClick={() => window.location.href = '/'} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition">Go to Login</button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                    <p className="text-slate-400 text-sm">Manage users, roles, and balances.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        📢 Bulk Message
                    </button>
                    {/* Add Logs Button */}
                    <button
                        onClick={() => window.location.href = '/admin/logs'}
                        className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition shadow-lg shadow-slate-200 flex items-center gap-2"
                    >
                        📜 Action Logs
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                    <div key={user.id} className={`bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition relative overflow-hidden ${user.isWithdrawLocked ? 'border-rose-200' : 'border-slate-100'}`}>
                        {user.isWithdrawLocked && (
                            <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg">
                                Withdrawal Locked
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold relative">
                                    {user.fullName?.[0]}
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                        <div className={`w-3 h-3 rounded-full ${user.accountStatus === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{user.fullName}</h3>
                                    <p className="text-xs text-slate-500">{user.phone} <span className="text-slate-300">|</span> {user.username}</p>
                                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                                        {user.account_tier || 'Starter'}
                                    </span>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getRoleColor(user.role)}`}>
                                {user.role}
                            </span>
                        </div>

                        {/* Step 8: Referral Stats */}
                        <div className="mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Referrals</div>
                            <div className="text-xs font-bold text-slate-700">
                                <span className="text-emerald-500">{user.stats?.activeReferrals || 0}</span> Active
                                <span className="text-slate-300 mx-1">/</span>
                                {user.stats?.totalReferrals || 0} Total
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Main Balance</p>
                                <p className="font-bold text-slate-700">৳ {user.Wallet?.balance || 0}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl">
                                <p className="text-[10px] text-purple-400 uppercase font-bold">Income</p>
                                <p className="font-bold text-purple-700">৳ {user.income_balance || 0}</p>
                            </div>
                        </div>

                        {/* Status & Role Management */}
                        <div className="flex gap-2 mb-3">
                            <select
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                                value={user.accountStatus || 'pending'}
                                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            >
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <select
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            >
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                                <option value="employee_admin">Employee</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>

                        {/* Step 8: Action Buttons (Promote, Penalty, Lock) */}
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <button
                                onClick={() => setPromoteModal({ show: true, userId: user.id, username: user.fullName, currentTier: user.account_tier })}
                                className="py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5"
                            >
                                <TrendingUp className="w-3 h-3" /> Promote
                            </button>
                            <button
                                onClick={() => setPenaltyModal({ show: true, userId: user.id, username: user.fullName })}
                                className="py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5"
                            >
                                <AlertTriangle className="w-3 h-3" /> Penalty
                            </button>
                            <button
                                onClick={() => handleLockWithdraw(user.id, user.isWithdrawLocked)}
                                className={`py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 border ${user.isWithdrawLocked
                                    ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                                    }`}
                            >
                                {user.isWithdrawLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                {user.isWithdrawLocked ? 'Unlock' : 'Lock'}
                            </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="space-y-2">
                            <button onClick={() => setMessageModal({ show: true, userId: user.id, userName: user.fullName })} className="w-full py-2 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition flex justify-center items-center gap-2">
                                📩 Send Message
                            </button>
                            {/* Legacy Edit Balance - Keeping it but putting it lower priority or removing if specific 'edit' isn't needed with new tools */}
                            <button onClick={() => setSelectedUser(user)} className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition flex justify-center items-center gap-2">
                                <Edit2 className="w-3 h-3" /> Edit Balance
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedUser && (<AdminBalanceModal user={selectedUser} onClose={() => { setSelectedUser(null); fetchUsers(); }} />)}

            {/* Password Reset Modal */}
            {resetModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">Reset Password</h3>
                            <button onClick={() => setResetModal({ show: false })} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <input type="text" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold mb-4 outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button onClick={handleResetPassword} disabled={resetLoading} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition">{resetLoading ? 'Resetting...' : 'Confirm Reset'}</button>
                    </div>
                </div>
            )}

            <GameStatsModal isOpen={statsModal.show} onClose={() => setStatsModal({ show: false, userId: null, username: '' })} userId={statsModal.userId} username={statsModal.username} />

            {/* Step 7 Modals */}
            <AdminMessageModal
                show={messageModal.show}
                onClose={() => setMessageModal({ show: false, userId: null, userName: '' })}
                userId={messageModal.userId}
                userName={messageModal.userName}
            />
            <BulkMessageModal
                show={showBulkModal}
                onClose={() => setShowBulkModal(false)}
            />
            {/* Step 8 Modals */}
            <PromoteModal
                show={promoteModal.show}
                onClose={() => { setPromoteModal({ show: false, userId: null }); fetchUsers(); }}
                userId={promoteModal.userId}
                username={promoteModal.username}
                currentTier={promoteModal.currentTier}
            />
            <PenaltyModal
                show={penaltyModal.show}
                onClose={() => { setPenaltyModal({ show: false, userId: null }); fetchUsers(); }}
                userId={penaltyModal.userId}
                username={penaltyModal.username}
            />
        </div>
    );
}
