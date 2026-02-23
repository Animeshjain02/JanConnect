import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Complaint } from '../types';
import {
    CheckCircle,
    AlertCircle,
    Clock,
    User,
    UserCheck,
    MapPin,
    FileText,
    History,
    RefreshCw,
    CheckCircle2,
    Loader2,
    BarChart3,
    Map as MapIcon,
    Construction,
    Mic
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OfficerDashboard = () => {
    const { user, logout } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [officerNameInputs, setOfficerNameInputs] = useState<Record<string, string>>({});

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await api.get('/complaints/my');
            setComplaints(response.data);
        } catch (err) {
            console.error('Failed to fetch officer complaints', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            setUpdatingId(id);
            await api.patch(`/complaints/${id}/status`, { status: newStatus });
            await fetchComplaints();
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Failed to update status. Please try again.');
        } finally {
            setUpdatingId(null);
        }
    };

    const assignOfficer = async (id: string) => {
        const name = officerNameInputs[id]?.trim();
        if (!name) return;
        try {
            setAssigningId(id);
            await api.patch(`/complaints/${id}/assign`, { officerName: name });
            await fetchComplaints();
        } catch (err) {
            console.error('Failed to assign officer', err);
            alert('Failed to assign officer. Please try again.');
        } finally {
            setAssigningId(null);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-red-500/20 text-red-500 border-red-500/20';
            case 'High': return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
            case 'Medium': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20';
            case 'In Progress': return 'bg-amber-500/20 text-amber-500 border-amber-500/20';
            case 'Pending': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 bg-auth-mesh min-h-screen">
            <header className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/10 glass-card">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Officer Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1 uppercase font-bold tracking-widest">{user?.department} Command Centre</p>
                </div>
                <button
                    onClick={logout}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all rounded-xl font-bold border border-white/5"
                >
                    System Logout
                </button>
            </header>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NavCard to="/map" icon={<MapIcon size={20} />} title="Strategic Map" desc="Incident hotspots" color="text-blue-500" />
                <NavCard to="/transparency" icon={<BarChart3 size={20} />} title="Analytics" desc="Dept performance" color="text-emerald-500" />
                <NavCard to="/projects" icon={<Construction size={20} />} title="Project Manager" desc="Oversee civic works" color="text-amber-500" />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Assigned Tasks"
                    value={complaints.length}
                    icon={<FileText className="text-blue-500" />}
                    loading={loading}
                />
                <StatCard
                    title="Critical Issues"
                    value={complaints.filter(c => c.severity === 'Critical').length}
                    icon={<AlertCircle className="text-red-500" />}
                    loading={loading}
                />
                <StatCard
                    title="In Progress"
                    value={complaints.filter(c => c.status === 'In Progress').length}
                    icon={<RefreshCw className="text-amber-500 animate-spin-slow" />}
                    loading={loading}
                />
                <StatCard
                    title="Resolved"
                    value={complaints.filter(c => c.status === 'Resolved').length}
                    icon={<CheckCircle2 className="text-emerald-500" />}
                    loading={loading}
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-500" />
                        Departmental Task Board
                    </h2>
                    <div className="flex gap-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Updated just now
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 glass-card flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                            <p className="text-slate-400">Loading tasks...</p>
                        </div>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="h-48 glass-card flex items-center justify-center border-dashed border-white/5">
                        <div className="text-center space-y-2">
                            <CheckCircle className="w-12 h-12 text-slate-800 mx-auto" />
                            <p className="text-slate-500 font-medium">No tasks found for your department</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {complaints.map((complaint) => (
                            <div key={complaint._id} className="glass-card overflow-hidden border border-white/5 group hover:border-blue-500/30 transition-all duration-300">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            {/* Title & Badges */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-lg font-bold text-white uppercase tracking-tight">#{complaint.complaintId}</h3>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getSeverityColor(complaint.severity)}`}>
                                                    {complaint.severity.toUpperCase()}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(complaint.status)}`}>
                                                    {complaint.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <h4 className="text-xl font-semibold text-slate-100">{complaint.title}</h4>

                                            {/* Description */}
                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                <p className="text-slate-400 text-sm leading-relaxed italic">"{complaint.description}"</p>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                                                        <MapPin size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Location</p>
                                                        <p className="text-sm text-slate-300 font-medium">{complaint.location.address || `${complaint.location.lat.toFixed(4)}, ${complaint.location.lng.toFixed(4)}`}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reported By</p>
                                                        <p className="text-sm text-slate-300 font-medium">
                                                            {typeof complaint.userId === 'object' ? complaint.userId.name : 'Unknown Citizen'}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {typeof complaint.userId === 'object' ? complaint.userId.email : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Media Attachments */}
                                            {(complaint.imageUrl || complaint.voiceUrl) && (
                                                <div className="pt-4 border-t border-white/5 flex gap-3 flex-wrap">
                                                    {complaint.imageUrl && (
                                                        <div
                                                            className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:scale-105 transition-transform group/img relative"
                                                            onClick={() => window.open(complaint.imageUrl, '_blank')}
                                                        >
                                                            <img src={complaint.imageUrl} alt="evidence" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                                <span className="text-[8px] font-black text-white uppercase tracking-tighter">Full View</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {complaint.voiceUrl && (
                                                        <div className="flex flex-col gap-1.5 px-4 py-2 bg-slate-900/70 border border-white/5 rounded-xl">
                                                            <div className="flex items-center gap-2">
                                                                <Mic size={12} className="text-purple-400" />
                                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Voice Note</span>
                                                            </div>
                                                            <audio src={complaint.voiceUrl} controls className="h-6 min-w-[140px]" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Section */}
                                        <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-6">
                                            <div className="space-y-4">

                                                {/* Assignment Panel */}
                                                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Assigned Officer</p>

                                                    {complaint.assignedOfficerName ? (
                                                        // Already assigned — show name with edit option
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                                                                    <User size={14} />
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-200 truncate">{complaint.assignedOfficerName}</span>
                                                            </div>
                                                            {/* Allow reassignment */}
                                                            <div className="flex gap-1.5">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Reassign to..."
                                                                    value={officerNameInputs[complaint._id] || ''}
                                                                    onChange={e => setOfficerNameInputs(prev => ({ ...prev, [complaint._id]: e.target.value }))}
                                                                    onKeyDown={e => e.key === 'Enter' && assignOfficer(complaint._id)}
                                                                    className="flex-1 min-w-0 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
                                                                />
                                                                <button
                                                                    disabled={assigningId === complaint._id || !officerNameInputs[complaint._id]?.trim()}
                                                                    onClick={() => assignOfficer(complaint._id)}
                                                                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-40 transition-all flex-shrink-0"
                                                                >
                                                                    {assigningId === complaint._id ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={11} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // Not yet assigned — show input form
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-600 italic py-1">
                                                                <User size={12} />
                                                                <span>No officer assigned yet</span>
                                                            </div>
                                                            <div className="flex gap-1.5">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter officer name..."
                                                                    value={officerNameInputs[complaint._id] || ''}
                                                                    onChange={e => setOfficerNameInputs(prev => ({ ...prev, [complaint._id]: e.target.value }))}
                                                                    onKeyDown={e => e.key === 'Enter' && assignOfficer(complaint._id)}
                                                                    className="flex-1 min-w-0 bg-slate-950/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
                                                                />
                                                                <button
                                                                    disabled={assigningId === complaint._id || !officerNameInputs[complaint._id]?.trim()}
                                                                    onClick={() => assignOfficer(complaint._id)}
                                                                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 disabled:opacity-40 transition-all flex-shrink-0"
                                                                >
                                                                    {assigningId === complaint._id ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={11} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Update Status</p>
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            disabled={updatingId === complaint._id || complaint.status === 'In Progress'}
                                                            onClick={() => updateStatus(complaint._id, 'In Progress')}
                                                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border
                                                                ${complaint.status === 'In Progress'
                                                                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 cursor-default'
                                                                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/30'}`}
                                                        >
                                                            {updatingId === complaint._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                            MARK IN PROGRESS
                                                        </button>

                                                        <button
                                                            disabled={updatingId === complaint._id || complaint.status === 'Resolved'}
                                                            onClick={() => updateStatus(complaint._id, 'Resolved')}
                                                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border
                                                                ${complaint.status === 'Resolved'
                                                                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 cursor-default'
                                                                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30'}`}
                                                        >
                                                            {updatingId === complaint._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                                            MARK RESOLVED
                                                        </button>

                                                        <button
                                                            disabled={updatingId === complaint._id || complaint.status === 'Submitted'}
                                                            onClick={() => updateStatus(complaint._id, 'Submitted')}
                                                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border
                                                                ${complaint.status === 'Submitted'
                                                                    ? 'bg-blue-500/20 text-blue-500 border-blue-500/30 cursor-default'
                                                                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30'}`}
                                                        >
                                                            {updatingId === complaint._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                                                            PENDING / SUBMITTED
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 flex items-center gap-2">
                                                <Clock size={12} />
                                                Reported: {new Date(complaint.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, loading }: { title: string, value: string | number, icon: React.ReactNode, loading?: boolean }) => (
    <div className="glass-card p-6 border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all duration-300">
        <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{title}</p>
            {loading ? (
                <div className="h-8 w-12 bg-white/5 animate-pulse rounded" />
            ) : (
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            )}
        </div>
        <div className="bg-white/5 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300 border border-white/5">
            {React.cloneElement(icon as any, { size: 28 })}
        </div>
    </div>
);

const NavCard = ({ to, icon, title, desc, color }: { to: string, icon: React.ReactNode, title: string, desc: string, color: string }) => (
    <Link to={to} className="glass-card p-6 border border-white/5 hover:border-white/20 transition-all group flex items-center gap-4">
        <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${color}`}>
            {icon}
        </div>
        <div>
            <h4 className="text-white font-bold text-sm tracking-tight">{title}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
        </div>
    </Link>
);

export default OfficerDashboard;
