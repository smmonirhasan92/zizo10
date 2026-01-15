'use client';
import { useState } from 'react';
import api from '@/services/api';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateTaskPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        type: 'standard_review', // Default: Option B
        productName: '',
        reviewText: '',
        targetPackage: 'All',
        adCode: '',
        productImage: null
    });

    const handleFileChange = (e) => {
        setFormData({ ...formData, productImage: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const data = new FormData();
        data.append('type', formData.type);
        data.append('productName', formData.productName);
        data.append('reviewText', formData.reviewText);
        data.append('targetPackage', formData.targetPackage);
        if (formData.adCode) data.append('adCode', formData.adCode);
        if (formData.productImage) data.append('photo', formData.productImage);

        try {
            await api.post('/admin/tasks/create', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('✅ Task Created Successfully!');
            setFormData({
                type: 'standard_review',
                productName: '',
                reviewText: '',
                targetPackage: 'All',
                adCode: '',
                productImage: null
            });
        } catch (err) {
            setMessage('❌ Error: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">📢 Post New Task</h1>

            {message && (
                <div className={`p-4 mb-6 rounded-xl border ${message.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 shadow-xl">

                {/* Task Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        onClick={() => setFormData({ ...formData, type: 'standard_review' })}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.type === 'standard_review' ? 'border-yellow-400 bg-yellow-400/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'}`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className={`w-5 h-5 ${formData.type === 'standard_review' ? 'text-yellow-400' : 'text-slate-500'}`} />
                            <h3 className="font-bold text-white">Standard Review</h3>
                        </div>
                        <p className="text-xs text-slate-400">User sees Image + Text and ticks a box.</p>
                    </div>

                    <div
                        onClick={() => setFormData({ ...formData, type: 'ad_integrated' })}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.type === 'ad_integrated' ? 'border-rose-500 bg-rose-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'}`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className={`w-5 h-5 ${formData.type === 'ad_integrated' ? 'text-rose-500' : 'text-slate-500'}`} />
                            <h3 className="font-bold text-white">Ad-Integrated</h3>
                        </div>
                        <p className="text-xs text-slate-400">Includes hidden/visible Ad Code/Link.</p>
                    </div>
                </div>

                {/* Common Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">Product Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-400 outline-none"
                            value={formData.productName}
                            onChange={e => setFormData({ ...formData, productName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">Review Text (Short Description)</label>
                        <textarea
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-400 outline-none h-24"
                            value={formData.reviewText}
                            onChange={e => setFormData({ ...formData, reviewText: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">Target Package</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-yellow-400 outline-none"
                            value={formData.targetPackage}
                            onChange={e => setFormData({ ...formData, targetPackage: e.target.value })}
                        >
                            <option value="All">All Users</option>
                            <option value="Starter">Starter Only</option>
                            <option value="Gold">Gold Only</option>
                            <option value="VIP">VIP Only</option>
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">Product Image</label>
                        <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-6 hover:border-slate-500 transition-colors cursor-pointer group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center text-slate-400">
                                <Upload className="w-8 h-8 mb-2 group-hover:text-white transition" />
                                <span className="text-sm">{formData.productImage ? formData.productImage.name : 'Click to Upload Image'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conditional Ad Code */}
                {formData.type === 'ad_integrated' && (
                    <div className="animate-in fade-in slide-in-from-top-4">
                        <label className="block text-xs font-bold text-rose-400 mb-2">Ad Code / Link (HTML/JS allowed)</label>
                        <textarea
                            className="w-full bg-slate-900 border border-rose-500/30 rounded-xl p-3 text-white focus:border-rose-500 outline-none h-32 font-mono text-xs"
                            placeholder="<script>...</script> or https://..."
                            value={formData.adCode}
                            onChange={e => setFormData({ ...formData, adCode: e.target.value })}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl font-bold text-slate-900 shadow-lg hover:shadow-yellow-500/20 active:scale-95 transition-all"
                >
                    {loading ? 'Creating Task...' : '🚀 Post Task'}
                </button>

            </form>
        </div>
    );
}
