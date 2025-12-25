'use client';
import AdminBottomNav from '../../components/AdminBottomNav';

export default function AdminLayout({ children }) {
    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Admin Header / Top Bar could go here */}
            <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-40">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
                    <div className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">v1.0</div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-0">
                {children}
            </main>

            <AdminBottomNav />
        </div>
    );
}
