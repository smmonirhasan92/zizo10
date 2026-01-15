'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function TaskSchedulePage() {
    const [schedules, setSchedules] = useState([]);
    const [formData, setFormData] = useState({
        targetPackage: 'Starter',
        weekNumber: 1,
        taskType: 'review_task',
        taskCount: 10
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // fetchSchedules(); // Implement GET endpoint later
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Need to implement POST endpoint
            await api.post('/admin/task-schedule', formData);
            setMessage('✅ Schedule Rule Added!');
        } catch (err) {
            setMessage('❌ Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto text-white">
            <h1 className="text-2xl font-bold mb-6">📅 Task Matrix & Scheduling</h1>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-lg font-bold mb-4">Create New Schedule Rule</h2>
                {message && <div className="mb-4 p-2 bg-blue-500/20 text-blue-200 rounded">{message}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Target Package</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2"
                            value={formData.targetPackage}
                            onChange={e => setFormData({ ...formData, targetPackage: e.target.value })}
                        >
                            <option value="Starter">Starter</option>
                            <option value="Gold">Gold</option>
                            <option value="VIP">VIP</option>
                            <option value="All">All Packages</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Week Number (User Age)</label>
                        <input
                            type="number" min="1" max="52"
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2"
                            value={formData.weekNumber}
                            onChange={e => setFormData({ ...formData, weekNumber: parseInt(e.target.value) })}
                        />
                        <p className="text-[10px] text-slate-500 mt-1">E.g., Week 1 = First 7 days of user</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Task Type</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2"
                            value={formData.taskType}
                            onChange={e => setFormData({ ...formData, taskType: e.target.value })}
                        >
                            <option value="review_task">Smart Reviews (New)</option>
                            <option value="ad_task">Video Ads (Old)</option>
                            <option value="mixed">Mixed (Both)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Task Count</label>
                        <input
                            type="number" min="1" max="50"
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2"
                            value={formData.taskCount}
                            onChange={e => setFormData({ ...formData, taskCount: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition">
                            {loading ? 'Saving...' : 'Save Matrix Rule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
