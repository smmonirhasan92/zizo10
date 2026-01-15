'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Users, DollarSign, ListChecks, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminBottomNav() {
    const pathname = usePathname();

    const [role, setRole] = useState(null);

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user'));
            if (u) setRole(u.role);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const allNavItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Requests', href: '/admin/requests', icon: ListChecks },
        { name: 'Transactions', href: '/admin/transactions', icon: DollarSign },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    const navItems = allNavItems.filter(item => {
        if (role === 'agent') {
            // Agents cannot see Users or Settings
            return item.name !== 'Users' && item.name !== 'Settings';
        }
        return true;
    });

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-4 flex justify-between items-center shadow-[0_-5px_20px_rgba(0,0,0,0.2)] text-white z-50">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 transition ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-200'}`}>
                        <Icon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                )
            })}
        </div>
    );
}
