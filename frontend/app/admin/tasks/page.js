'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../services/api';
import { Plus, Trash2, ExternalLink, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function AdminTasksPage() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        reviewText: '',
        adLink: '',
        priority: 0
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const res = await api.get('/admin/task-ad');
            setAds(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/task-ad', formData);
            setMessage('Task Ad Created Successfully!');
            setFormData({ title: '', imageUrl: '', reviewText: '', adLink: '', priority: 0 });
            setShowForm(false);
            fetchAds();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Failed to create ad.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this ad?')) return;
        try {
            await api.delete(`/admin/task-ad/${id}`);
            fetchAds();
        } catch (err) {
            console.error(err);
            alert('Failed to delete ad');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/dashboard" className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Task Ads Management</h1>
                <div className="flex-1"></div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Add New Ad
                </button>
            </div>

            {message && (
                <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-4 border border-green-200">
                    {message}
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-8 animate-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold mb-4">Create New Task Ad</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Product Title</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. iPhone 16 Pro"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-600 mb-2">Review Text</label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                                    placeholder="Write a catchy review..."
                                    value={formData.reviewText}
                                    onChange={e => setFormData({ ...formData, reviewText: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Ad Link</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="https://"
                                    value={formData.adLink}
                                    onChange={e => setFormData({ ...formData, adLink: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Priority (Higher = First)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : 'Create Ad'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="text-center py-10 text-slate-400">Loading Ads...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ads.map(ad => (
                        <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg transition">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />
                                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-mono">
                                    P: {ad.priority}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-slate-800 mb-2 truncate">{ad.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{ad.reviewText}</p>

                                <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                                    <a
                                        href={ad.adLink}
                                        target="_blank"
                                        className="text-indigo-500 text-sm font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Link
                                    </a>
                                    <button
                                        onClick={() => handleDelete(ad.id)}
                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {ads.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500 font-medium">No Ads Found</p>
                            <p className="text-sm text-slate-400">Click &quot;Add New Ad&quot; to create one.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
