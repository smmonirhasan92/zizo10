import { useState, useEffect } from 'react';
import api from '../services/api';
import { KeyRound, X, LineChart } from 'lucide-react';
import GameStatsModal from './admin/GameStatsModal';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resetModal, setResetModal] = useState({ show: false, userId: null, username: '' });
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [statsModal, setStatsModal] = useState({ show: false, userId: null, username: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            console.log('Fetching users with token:', token ? 'Token exists' : 'No token found');

            if (!token) {
                throw new Error("No authentication token found. Please login.");
            }

            const res = await api.get('/admin/users');

            console.log('Users fetched successfully:', res.data);

            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else {
                console.error('API response is not an array:', res.data);
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
            } else if (err.code === "ERR_NETWORK") {
                msg = "Cannot connect to Backend (Network Error). Check if server is running on port 5000.";
            } else if (err.response?.data?.message) {
                msg = `Server Error: ${err.response.data.message}`;
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
            const token = localStorage.getItem('token');
            await api.put('/admin/user/role',
                { userId, role: newRole }
            );
            fetchUsers(); // Refresh
        } catch (err) {
            console.error(err);
            alert("Failed to update role");
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword) return;
        setResetLoading(true);
        try {
            const token = localStorage.getItem('token');
            await api.put('/admin/user/reset-password',
                { userId: resetModal.userId, newPassword }
            );
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
                <button
                    onClick={() => window.location.href = '/'}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );

    return (
        <div className="pb-20 flex justify-center">
            <div className="w-full max-w-2xl space-y-5 px-4 md:px-0">
                {users.length === 0 ? (
                    <div className="py-20 text-center bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-sm">
                        <p className="text-slate-500 font-medium">No users found.</p>
                    </div>
                ) : (
                    users.map(user => (
                        <div key={user.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                            {/* Decorative Blur */}
                            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full mix-blend-multiply opacity-5 blur-2xl ${getRoleColor(user.role).split(' ')[0].replace('100', '500')}`}></div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold uppercase shadow-inner ${getRoleColor(user.role)}`}>
                                        {user.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{user.fullName}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-slate-500 font-mono">{user.phone}</p>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1 border-l pl-2 ml-2 border-slate-200">
                                                <button
                                                    onClick={() => setResetModal({ show: true, userId: user.id, username: user.fullName })}
                                                    className="p-1 text-slate-300 hover:text-red-500 transition hover:bg-red-50 rounded-lg"
                                                    title="Reset Password"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setStatsModal({ show: true, userId: user.id, username: user.fullName })}
                                                    className="p-1 text-slate-300 hover:text-indigo-500 transition hover:bg-indigo-50 rounded-lg"
                                                    title="View Game Stats"
                                                >
                                                    <LineChart className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Role Management */}
                                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Level</span>
                                    <div className="relative w-full md:w-48">
                                        <select
                                            className={`w-full appearance-none p-3 pr-10 rounded-xl text-sm font-bold border-2 outline-none focus:ring-4 transition-all cursor-pointer ${getRoleColor(user.role)}`}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="agent">Agent</option>
                                            <option value="employee_admin">Employee Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Reset Password Modal */}
            {resetModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">Reset Password</h3>
                            <button onClick={() => setResetModal({ show: false })} className="p-2 hover:bg-slate-100 rounded-full">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Set a new password for <span className="font-bold text-indigo-600">{resetModal.username}</span>.
                        </p>
                        <input
                            type="text"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleResetPassword}
                            disabled={resetLoading}
                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition"
                        >
                            {resetLoading ? 'Resetting...' : 'Confirm Reset'}
                        </button>
                    </div>
                </div>
            )}

            {/* Game Stats Modal */}
            <GameStatsModal
                isOpen={statsModal.show}
                onClose={() => setStatsModal({ show: false, userId: null, username: '' })}
                userId={statsModal.userId}
                username={statsModal.username}
            />
        </div>
    );
}
