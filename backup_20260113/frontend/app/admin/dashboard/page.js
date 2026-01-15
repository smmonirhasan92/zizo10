'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../services/api';
import { ArrowLeft, Users, FileText, Settings, Shield, ShieldCheck, Wallet, Trophy, Briefcase, Crown, MessageSquare } from 'lucide-react';
import DashboardCard from '../../../components/admin/DashboardCard';
// import AdminBottomNav from '../../../components/AdminBottomNav'; // Keeping if needed or remove if Layout handles it

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        todayDeposits: 0,
        todayWithdraws: 0,
        totalCreated: 0,
        totalWithdraws: 0,
        pendingActions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/audit/financial').then(res => {
            const overview = res.data.overview || {};
            setStats({
                todayDeposits: overview.today_deposits || 0,
                todayWithdraws: overview.today_withdraws || 0,
                totalCreated: overview.total_created || 0,
                totalWithdraws: overview.total_withdraws || 0,
                pendingActions: (overview.pending_deposits || 0) + (overview.pending_withdraws || 0)
            });
        }).catch(err => {
            console.error(err);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header Section */}
            <div className="bg-[#0f172a] text-white p-5 pt-8 md:p-6 md:pb-12 rounded-b-[2rem] md:rounded-b-[2.5rem] relative shadow-2xl overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                {/* Top Nav */}
                <div className="relative z-10 flex justify-between items-center mb-6 max-w-7xl mx-auto">
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md active:scale-95 transition hover:bg-white/20">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="px-4 py-1.5 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold border border-rose-500/30 shadow-lg backdrop-blur-md flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" />
                        ADMIN PANEL
                    </div>
                </div>

                {/* Greeting & Quick Stats */}
                <div className="relative z-10 max-w-7xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-black mb-1 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Overview</h1>
                    <p className="text-slate-400 text-xs md:text-sm font-medium mb-6">Real-time Business Insights</p>

                    {/* Stats Scroller (Mobile Horizontal, Desktop Grid) */}
                    <div className="flex overflow-x-auto pb-4 gap-3 md:grid md:grid-cols-4 md:pb-0 snap-x snap-mandatory hide-scrollbar">
                        {/* 1. Today's Deposit */}
                        <div className="min-w-[85%] md:min-w-0 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md snap-center">
                            <p className="text-slate-400 text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider">Today&apos;s Deposit</p>
                            <h3 className="text-2xl font-black text-emerald-400">
                                {loading ? '...' : `৳${Number(stats.todayDeposits).toLocaleString()}`}
                            </h3>
                        </div>

                        {/* 2. Lifetime Create (System Created) */}
                        <div className="min-w-[85%] md:min-w-0 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md snap-center">
                            <p className="text-slate-400 text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider">Lifetime Create</p>
                            <h3 className="text-2xl font-black text-purple-400">
                                {loading ? '...' : `৳${Number(stats.totalCreated).toLocaleString()}`}
                            </h3>
                        </div>

                        {/* 3. Today's Withdraw */}
                        <div className="min-w-[85%] md:min-w-0 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md snap-center">
                            <p className="text-slate-400 text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider">Today&apos;s Withdraw</p>
                            <h3 className="text-2xl font-black text-rose-400">
                                {loading ? '...' : `৳${Number(stats.todayWithdraws).toLocaleString()}`}
                            </h3>
                        </div>

                        {/* 4. Lifetime Withdraw */}
                        <div className="min-w-[85%] md:min-w-0 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md snap-center">
                            <p className="text-slate-400 text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider">Lifetime Withdraw</p>
                            <h3 className="text-2xl font-black text-orange-400">
                                {loading ? '...' : `৳${Number(stats.totalWithdraws).toLocaleString()}`}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="px-5 -mt-6 relative z-20 pb-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <DashboardCard
                        href="/admin/transactions"
                        title="Transactions"
                        description="Approve deposits & tasks"
                        icon={FileText}
                        colorClass="blue"
                        badge="Action"
                    />

                    <DashboardCard
                        href="/admin/agents"
                        title="Agents"
                        description="Create & manage agents"
                        icon={Users}
                        colorClass="green"
                    />

                    <DashboardCard
                        href="/admin/tasks"
                        title="Task Ads"
                        description="Manage Dynamic Tasks"
                        icon={Briefcase}
                        colorClass="cyan"
                        badge="New"
                    />

                    <DashboardCard
                        href="/admin/users"
                        title="Users"
                        description="Roles & permissions"
                        icon={Users}
                        colorClass="indigo"
                    />

                    <DashboardCard
                        href="/admin/plans"
                        title="Membership Plans"
                        description="Tiers & Rewards"
                        icon={Crown}
                        colorClass="amber"
                    />

                    <DashboardCard
                        href="/admin/game-settings"
                        title="Game Settings"
                        description="Game & system rules"
                        icon={Settings}
                        colorClass="purple"
                    />

                    <DashboardCard
                        href="/admin/settings"
                        title="System Control"
                        description="Limits & Rewards"
                        icon={Settings}
                        colorClass="teal"
                    />

                    <DashboardCard
                        href="/admin/game-history"
                        title="Game History"
                        description="View all game bets"
                        icon={Trophy}
                        colorClass="orange"
                    />

                    <DashboardCard
                        href="/admin/deposit-settings"
                        title="Deposit Settings"
                        description="Manage Admin Numbers"
                        icon={Wallet}
                        colorClass="emerald"
                    />

                    <DashboardCard
                        href="/admin/audit"
                        title="Financial Audit"
                        description="Detect fake money & integrity"
                        icon={Shield}
                        colorClass="red"
                        badge="Security"
                    />

                    <DashboardCard
                        href="/admin/support"
                        title="Support Center"
                        description="Reply to user tickets"
                        icon={MessageSquare}
                        colorClass="pink"
                        badge="Tickets"
                    />

                    <DashboardCard
                        href="/admin/agents/settlements"
                        title="Agent Settlements"
                        description="Approve payouts & dues"
                        icon={Wallet}
                        colorClass="green"
                        badge="Dena-Pawna"
                    />

                    <DashboardCard
                        href="/admin/logs"
                        title="Audit Logs"
                        description="View system activities"
                        icon={FileText}
                        colorClass="gray"
                    />
                </div>
            </div>

            {/* <AdminBottomNav /> */}
        </div>
    );
}
