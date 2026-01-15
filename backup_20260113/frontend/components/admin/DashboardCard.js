import Link from 'next/link';

export default function DashboardCard({ href, title, description, icon: Icon, colorClass, badge }) {
    // Generate classes based on colorClass (assuming e.g., 'blue', 'green', 'indigo')
    // We need map for Tailwind Safe List or just accept full class strings.
    // For simplicity/safety, let's accept direct classes or maps.

    const colorMap = {
        blue: { bg: 'bg-blue-500', text: 'text-blue-600', shape: 'bg-blue-500/10' },
        green: { bg: 'bg-emerald-500', text: 'text-emerald-600', shape: 'bg-emerald-500/10' },
        indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', shape: 'bg-indigo-500/10' },
        purple: { bg: 'bg-violet-500', text: 'text-violet-600', shape: 'bg-violet-500/10' },
        emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', shape: 'bg-emerald-500/10' },
        teal: { bg: 'bg-teal-500', text: 'text-teal-600', shape: 'bg-teal-500/10' },
        orange: { bg: 'bg-orange-500', text: 'text-orange-600', shape: 'bg-orange-500/10' },
        red: { bg: 'bg-rose-500', text: 'text-rose-600', shape: 'bg-rose-500/10' },
        pink: { bg: 'bg-pink-500', text: 'text-pink-600', shape: 'bg-pink-500/10' },
        cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', shape: 'bg-cyan-500/10' },
        amber: { bg: 'bg-amber-500', text: 'text-amber-600', shape: 'bg-amber-500/10' },
        gray: { bg: 'bg-slate-500', text: 'text-slate-600', shape: 'bg-slate-500/10' },
    };

    const styles = colorMap[colorClass] || colorMap.gray;

    return (
        <Link href={href} className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group active:scale-[0.98] transition-all hover:shadow-lg">
            <div className={`absolute right-0 top-0 w-32 h-32 ${styles.shape} rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125`}></div>

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${styles.bg} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:shadow-xl transition-all`}>
                        <Icon className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                        <p className="text-slate-400 text-xs font-medium">{description}</p>
                    </div>
                </div>
                {badge && (
                    <div className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-red-200 shadow-lg animate-pulse">
                        {badge}
                    </div>
                )}
            </div>
        </Link>
    );
}
