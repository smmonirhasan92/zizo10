'use client';
import Link from 'next/link';
import { Home, CreditCard, Send, Gamepad2, Settings, Headset } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/dashboard', icon: Home },
        { name: 'Recharge', href: '/wallet/recharge', icon: CreditCard },
        { name: 'Send', href: '/wallet/send', icon: Send },
        { name: 'Game', href: '/game', icon: Gamepad2 },
        { name: 'Support', href: '/support', icon: Headset },
    ];

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[calc(100%-2rem)] md:max-w-7xl bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl z-50 flex justify-between items-center px-6 py-3 ring-1 ring-black/5">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${isActive ? 'text-[#C2105E] -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}>
                        {isActive && <div className="absolute -top-10 w-8 h-8 bg-[#C2105E]/10 rounded-full blur-md"></div>}
                        <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                        <span className={`text-[9px] font-bold ${isActive ? 'opacity-100' : 'opacity-0 scale-0'} transition-all absolute -bottom-3 w-max`}>{item.name}</span>
                    </Link>
                )
            })}
        </div>
    );
}
