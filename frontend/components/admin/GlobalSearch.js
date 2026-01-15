import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, User, CreditCard, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 3) {
                performSearch();
            } else {
                setResults(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/global-search?query=${query}`);
            setResults(res.data);
            setOpen(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-md">
            {/* Search Input */}
            <div className="relative group z-[100]">
                <input
                    type="text"
                    placeholder="Search User (Name/Phone) or Trx ID..."
                    className="w-full bg-slate-100 hover:bg-white focus:bg-white border-2 border-transparent focus:border-indigo-500 rounded-2xl py-3 pl-12 pr-10 outline-none transition-all font-bold text-slate-700 shadow-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results) setOpen(true); }}
                />
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${loading ? 'text-indigo-500 animate-pulse' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />

                {loading && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {query && !loading && (
                    <button
                        onClick={() => { setQuery(''); setResults(null); setOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                )}
            </div>

            {/* Results Dropdown - Optimized UI */}
            {open && results && (
                <div className="absolute top-14 left-0 w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[101] animate-in fade-in slide-in-from-top-4">
                    <div className="max-h-[70vh] overflow-y-auto no-scrollbar">

                        {/* Users Section */}
                        {results.users.length > 0 && (
                            <div className="p-0">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between">
                                    <span>Users Found ({results.users.length})</span>
                                    <span className="text-xs normal-case text-indigo-500 cursor-pointer">View All</span>
                                </h4>
                                {results.users.map(user => (
                                    <Link href={`/admin/user/${user.id}`} key={user.id} onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer group">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${user.role === 'agent' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                                            {user.fullName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="font-bold text-slate-800 text-sm truncate">{user.fullName}</p>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight ${user.role === 'agent' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                    }`}>{user.role}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                                <span>{user.phone}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-indigo-500 font-bold">{user.username}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800 text-sm">৳{user.Wallet ? user.Wallet.balance : '0.00'}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{user.account_tier}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Transactions Section */}
                        {results.transactions.length > 0 && (
                            <div className="p-0 border-t border-slate-100">
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-4 py-2 bg-slate-50 border-b border-slate-100">Transactions</h4>
                                {results.transactions.map(trx => (
                                    <div key={trx.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0">
                                        <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                            <CreditCard className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="font-bold text-slate-700 text-xs capitalize truncate">{trx.type ? trx.type.replace('_', ' ') : 'Unknown'}</p>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${trx.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                    trx.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                                                    }`}>{trx.status}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-mono">
                                                #{trx.id} • {trx.User?.username}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono font-bold text-slate-800 text-sm">{trx.amount}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {results.users.length === 0 && results.transactions.length === 0 && (
                            <div className="py-12 text-center">
                                <Search className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                                <p className="text-slate-400 text-sm font-medium">No results found.</p>
                                <p className="text-[10px] text-slate-300 mt-1">Try searching by ID, Phone, or Name</p>
                            </div>
                        )}
                    </div>
                    {/* Footer */}
                    <div className="bg-slate-50 p-2 text-center border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-medium">Type at least 2 characters to search</p>
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {open && (
                <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setOpen(false)}></div>
            )}
        </div>
    );
}
