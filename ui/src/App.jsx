import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout, Server, Settings, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:4000/api/config';

function App() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('endpoints');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEndpoint, setCurrentEndpoint] = useState(null);
    const [formData, setFormData] = useState({
        method: 'GET',
        path: '/',
        targetUrl: '',
        authRequired: false,
        rateLimit: 100
    });

    // Queries
    const { data: endpoints = [], isLoading, error } = useQuery({
        queryKey: ['endpoints'],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/endpoints`);
            return res.data;
        }
    });

    const { data: configs = [] } = useQuery({
        queryKey: ['configs'],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/config`);
            return res.data;
        }
    });

    // Mutations
    const submitMutation = useMutation({
        mutationFn: async (data) => {
            if (currentEndpoint) {
                return axios.put(`${API_BASE}/endpoints/${currentEndpoint.id}`, data);
            } else {
                return axios.post(`${API_BASE}/endpoints`, data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['endpoints'] });
            setIsModalOpen(false);
            setCurrentEndpoint(null);
            setFormData({ method: 'GET', path: '/', targetUrl: '', authRequired: false, rateLimit: 100 });
        },
        onError: (err) => {
            alert('Error saving endpoint: ' + (err.response?.data?.message || err.message));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return axios.delete(`${API_BASE}/endpoints/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['endpoints'] });
        },
        onError: () => {
            alert('Error deleting endpoint');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        submitMutation.mutate(formData);
    };

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this endpoint?')) return;
        deleteMutation.mutate(id);
    };

    return (
        <div className="flex h-screen bg-[#09090b] text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 border-r border-[#27272a] p-6 flex flex-col gap-6">
                <div className="flex items-center gap-2 text-xl font-bold">
                    <Server className="w-6 h-6 text-blue-500" />
                    <span>API Engine</span>
                </div>
                <nav className="flex flex-col gap-2 flex-1">
                    <button
                        onClick={() => setActiveTab('endpoints')}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'endpoints' ? 'bg-[#27272a] text-white shadow-lg' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white'}`}
                    >
                        <Layout className="w-5 h-5" />
                        Endpoints
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'settings' ? 'bg-[#27272a] text-white shadow-lg' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white'}`}
                    >
                        <Settings className="w-5 h-5" />
                        Registry & Keys
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-[#27272a] px-8 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
                    {activeTab === 'endpoints' && (
                        <button
                            onClick={() => { setCurrentEndpoint(null); setFormData({ method: 'GET', path: '/', targetUrl: '', authRequired: false, rateLimit: 100 }); setIsModalOpen(true); }}
                            className="bg-white text-black px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-[#e4e4e7] transition-all transform active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            New Endpoint
                        </button>
                    )}
                </header>

                <main className="flex-1 overflow-auto p-8 bg-[#0c0c0e]">
                    {error && (
                        <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <AlertCircle className="w-5 h-5" />
                            <span>Failed to fetch endpoints. Make sure the backend is running.</span>
                        </div>
                    )}

                    {activeTab === 'endpoints' ? (
                        <div className="grid gap-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center p-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : endpoints.length === 0 ? (
                                <div className="text-center py-20 bg-[#18181b] rounded-xl border border-dashed border-[#27272a] flex flex-col items-center gap-4">
                                    <Server className="w-12 h-12 text-[#27272a]" />
                                    <p className="text-[#a1a1aa]">No endpoints configured yet</p>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-blue-500 hover:text-blue-400 text-sm font-medium"
                                    >
                                        Create your first one
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4 animate-in fade-in duration-500">
                                    {endpoints.map(ep => (
                                        <div key={ep.id} className="group bg-[#18181b] p-5 rounded-xl border border-[#27272a] flex items-center justify-between hover:border-[#3f3f46] hover:bg-[#202024] transition-all duration-200">
                                            <div className="flex items-center gap-6">
                                                <span className={`w-16 text-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${ep.method === 'GET' ? 'bg-green-500/10 text-green-500' : ep.method === 'POST' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                    {ep.method}
                                                </span>
                                                <div>
                                                    <div className="font-mono text-sm font-semibold">{ep.path}</div>
                                                    <div className="text-[11px] text-[#71717a] mt-1 flex items-center gap-2">
                                                        <span className="opacity-50">REDIRECTS TO</span>
                                                        <span className="text-[#a1a1aa] font-medium">{ep.targetUrl}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setCurrentEndpoint(ep); setFormData(ep); setIsModalOpen(true); }}
                                                    className="p-2 text-[#a1a1aa] hover:text-white hover:bg-[#27272a] rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ep.id)}
                                                    className="p-2 text-[#a1a1aa] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-3xl animate-in fade-in duration-500">
                            <div className="bg-[#18181b] p-8 rounded-2xl border border-[#27272a] shadow-inner">
                                <h3 className="text-xl font-bold mb-2">Registry & Configuration</h3>
                                <p className="text-[#a1a1aa] text-sm mb-8">Manage global environment variables and system-wide settings.</p>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2 p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase">Engine Status</span>
                                            <span className="text-sm font-medium flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                Active (Port 4000)
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase">Config Entries</span>
                                            <span className="text-sm font-medium">{configs.length} Global Keys</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-[#27272a]">
                                        <label className="block text-xs font-bold text-[#a1a1aa] uppercase mb-4">Add Custom Configuration Key</label>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="e.g. STRIPE_API_KEY" className="flex-1 bg-[#09090b] border border-[#27272a] rounded-md px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                                            <button className="bg-[#27272a] px-6 py-2 rounded-md text-sm font-bold border border-[#3f3f46] hover:bg-[#3f3f46] transition-all">Add Key</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm z-50">
                    <div className="bg-[#18181b] border border-[#27272a] w-full max-w-md rounded-2xl shadow-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
                            <h3 className="text-lg font-bold">{currentEndpoint ? 'Update Routing' : 'Create New Route'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#a1a1aa] hover:text-white text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-[10px] font-black text-[#a1a1aa] uppercase mb-2 tracking-widest">Method</label>
                                    <select
                                        value={formData.method}
                                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                        className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option>GET</option>
                                        <option>POST</option>
                                        <option>PUT</option>
                                        <option>DELETE</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-[#a1a1aa] uppercase mb-2 tracking-widest">Entry Path</label>
                                    <input
                                        type="text"
                                        value={formData.path}
                                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                        placeholder="/v1/users"
                                        className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[#a1a1aa] uppercase mb-2 tracking-widest">Destination URL</label>
                                <input
                                    type="url"
                                    value={formData.targetUrl}
                                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                                    placeholder="https://api.internal.svc"
                                    className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#27272a]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={submitMutation.isPending}
                                    className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold text-sm hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitMutation.isPending && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                    {currentEndpoint ? 'Update' : 'Deploy'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
