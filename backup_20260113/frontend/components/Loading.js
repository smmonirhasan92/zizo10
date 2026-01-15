export default function Loading() {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-[#1A1F2B] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>

            {/* Pulsing Logo */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-20 animate-ping"></div>
                    <img src="/logo.png" className="w-16 h-16 rounded-xl shadow-2xl relative z-10 animate-bounce-slight" alt="Loading..." />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 w-1/2 animate-loading-bar rounded-full"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 1s infinite linear;
                }
                .animate-bounce-slight {
                    animation: bounce-slight 2s infinite ease-in-out;
                }
                @keyframes bounce-slight {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </div>
    );
}
