import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { Complaint } from '../types';
import {
    PlusCircle,
    Clock,
    AlertCircle,
    CheckCircle2,
    User as UserIcon,
    AlertTriangle,
    Check,
    History,
    Map as MapIcon,
    MapPin,
    BarChart3,
    Construction,
    Mic
} from 'lucide-react';
import { Link } from 'react-router-dom';

import ComplaintForm from '../components/ComplaintForm';
import PublicWorksPanel from '../components/PublicWorksPanel';
import ImageLightbox from '../components/ImageLightbox';

const stages = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Escalated'];

const CitizenDashboard = () => {
    const { user, logout } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/complaints/my');
            setComplaints(response.data);
        } catch (err) {
            console.error('Failed to fetch complaints', err);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleConfirmResolution = async (id: string, confirmed: boolean) => {
        try {
            if (confirmed) {
                await api.patch(`/complaints/${id}/confirm`);
            } else {
                await api.patch(`/complaints/${id}/reopen`);
            }
            setConfirmingId(null);
            fetchComplaints();
        } catch (err) {
            console.error('Action failed', err);
        }
    };

    const getStatusIndex = (status: string) => stages.indexOf(status);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 bg-auth-mesh min-h-screen">
            {showForm && (
                <ComplaintForm
                    onSuccess={() => {
                        setShowForm(false);
                        fetchComplaints();
                    }}
                    onClose={() => setShowForm(false)}
                />
            )}

            {selectedImage && (
                <ImageLightbox
                    src={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}

            {/* Resolution Confirmation Modal */}
            {confirmingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="glass-card max-w-md w-full p-8 space-y-6 border border-white/10 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Has your issue been resolved?</h3>
                            <p className="text-slate-400 text-sm">Please let us know if the actions taken were satisfactory.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleConfirmResolution(confirmingId, true)}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                <Check size={20} /> YES, IT'S RESOLVED
                            </button>
                            <button
                                onClick={() => handleConfirmResolution(confirmingId, false)}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <AlertTriangle size={18} /> NO, REOPEN CASE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/10 glass-card gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}</h1>
                    <p className="text-slate-400 text-sm mt-1">Track your active issues and civic contributions</p>
                </div>
                <div className="flex w-full md:w-auto gap-4">
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl transition-all font-bold text-white shadow-lg shadow-blue-600/20"
                    >
                        <PlusCircle size={20} />
                        Submit New Grievance
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium border border-white/5 rounded-xl hover:bg-white/5"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <NavCard to="/nearby" icon={<MapPin size={20} />} title="Issues Near You" desc="Find & support local issues" color="text-red-500" />
                <NavCard to="/map" icon={<MapIcon size={20} />} title="Civic Map" desc="Visualise local issues" color="text-blue-500" />
                <NavCard to="/transparency" icon={<BarChart3 size={20} />} title="Transparency" desc="System performance" color="text-emerald-500" />
                <NavCard to="/projects" icon={<Construction size={20} />} title="Works Portal" desc="Ongoing government projects" color="text-amber-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Raised" value={complaints.length} icon={<PlusCircle className="text-blue-500" />} />
                <StatCard title="In Progress" value={complaints.filter(c => !['Resolved', 'Submitted'].includes(c.status)).length} icon={<Clock className="text-amber-500" />} />
                <StatCard title="Successful" value={complaints.filter(c => c.status === 'Resolved').length} icon={<CheckCircle2 className="text-emerald-500" />} />
                <StatCard title="Critical" value={complaints.filter(c => c.priorityLevel === 'Critical').length} icon={<AlertCircle className="text-red-500" />} />
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 px-2">
                    <History className="w-5 h-5 text-blue-500" />
                    Active Tracking
                </h2>

                {complaints.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl border border-white/5 border-dashed">
                        <p className="text-slate-500 font-medium">You haven't submitted any complaints yet.</p>
                        <button onClick={() => setShowForm(true)} className="mt-4 text-blue-500 hover:underline text-sm font-bold">Start by reporting an issue</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {complaints.map(complaint => (
                            <div key={complaint._id} className="glass-card overflow-hidden border border-white/5 group hover:border-blue-500/30 transition-all duration-300">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                                        <div className="flex-1 space-y-6">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-xl text-white tracking-tight">{complaint.title}</h3>
                                                    <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">ID: {complaint.complaintId}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getPrioColor(complaint.priorityLevel)}`}>
                                                        {complaint.priorityLevel?.toUpperCase() || 'MEDIUM'} PRIORITY
                                                    </span>
                                                    {complaint.status === 'Resolved' && !complaint.history.some(h => h.note?.includes('confirmed')) && (
                                                        <button
                                                            onClick={() => setConfirmingId(complaint._id)}
                                                            className="text-[10px] bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-2 py-1 rounded font-bold hover:bg-emerald-500/30 animate-pulse"
                                                        >
                                                            CONFIRM RESOLUTION?
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 7-Stage Tracker */}
                                            <div className="relative pt-4 pb-8">
                                                <div className="absolute top-[35px] left-0 w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-1000"
                                                        style={{ width: `${(getStatusIndex(complaint.status) / (stages.length - 1)) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="relative flex justify-between items-center">
                                                    {stages.map((stage, idx) => {
                                                        const isCompleted = idx < getStatusIndex(complaint.status);
                                                        const isCurrent = idx === getStatusIndex(complaint.status);
                                                        return (
                                                            <div key={stage} className="flex flex-col items-center gap-3 z-10 w-8">
                                                                <div className={`w-4 h-4 rounded-full border-4 transition-all duration-500 
                                                                    ${isCompleted ? 'bg-blue-500 border-blue-500' :
                                                                        isCurrent ? 'bg-slate-900 border-blue-500 w-5 h-5 shadow-[0_0_15px_rgba(59,130,246,0.5)]' :
                                                                            'bg-slate-900 border-slate-700'}`}
                                                                />
                                                                <span className={`absolute -bottom-6 text-[8px] font-bold uppercase tracking-tighter whitespace-nowrap
                                                                    ${isCurrent ? 'text-blue-400 opacity-100' : 'text-slate-600 opacity-50'}`}>
                                                                    {stage}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Details Metadata */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-white/5">
                                                <DetailItem label="Department" value={complaint.department} />
                                                <DetailItem
                                                    label="Assigned Officer"
                                                    value={complaint.assignedOfficerName || complaint.assignedOfficerId?.name || 'Pending Assignment'}
                                                    icon={<UserIcon size={12} className="text-slate-500" />}
                                                />
                                                <DetailItem
                                                    label="SLA Deadline"
                                                    value={new Date(complaint.slaDeadline).toLocaleDateString()}
                                                    isOverdue={new Date(complaint.slaDeadline) < new Date() && complaint.status !== 'Resolved'}
                                                />
                                                <DetailItem label="Similar Issues" value={`${complaint.upvotes || 0} merged`} />
                                            </div>

                                            {(complaint.imageUrl || complaint.voiceUrl) && (
                                                <div className="pt-4 border-t border-white/5 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                                    {complaint.imageUrl && (
                                                        <div className="flex-shrink-0 w-24 h-24 rounded-xl border border-white/10 overflow-hidden bg-slate-900 group/img relative">
                                                            <img src={complaint.imageUrl} alt="evidence" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button onClick={() => setSelectedImage(complaint.imageUrl!)} className="text-[8px] font-black text-white uppercase tracking-tighter">View Full</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {complaint.voiceUrl && (
                                                        <div className="flex-shrink-0 flex flex-col justify-center gap-2 px-4 py-2 bg-slate-900 border border-white/5 rounded-xl min-w-[140px]">
                                                            <div className="flex items-center gap-2">
                                                                <Mic size={14} className="text-purple-400" />
                                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Voice Note</span>
                                                            </div>
                                                            <audio src={complaint.voiceUrl} controls className="h-6 w-full filter invert hue-rotate-180 opacity-70" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-12 border-t border-white/5">
                <PublicWorksPanel />
            </div>
        </div>
    );
};

const DetailItem = ({ label, value, icon, isOverdue }: { label: string, value: string, icon?: React.ReactNode, isOverdue?: boolean }) => (
    <div className="space-y-1">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-1.5">
            {icon}
            <p className={`text-xs font-medium truncate ${isOverdue ? 'text-red-500' : 'text-slate-300'}`}>
                {value}
            </p>
        </div>
    </div>
);

const getPrioColor = (prio: string) => {
    switch (prio) {
        case 'Critical': return 'bg-red-500/20 text-red-500 border-red-500/20';
        case 'High': return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
        case 'Medium': return 'bg-blue-500/20 text-blue-500 border-blue-500/20';
        default: return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
    }
};

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
    <div className="glass-card p-6 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
        <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
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

export default CitizenDashboard;
