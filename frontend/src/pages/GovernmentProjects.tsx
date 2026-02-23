import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import NearbyIssuesPanel from '../components/NearbyIssuesPanel';
import {
    Plus,
    MapPin,
    IndianRupee,
    Clock,
    Star,
    CheckCircle2,
    Construction,
    Briefcase
} from 'lucide-react';

const GovernmentProjects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        status: 'Started',
        location: '',
        department: 'Public Works'
    });

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/projects', formData);
            setShowForm(false);
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRate = async (id: string, score: number) => {
        try {
            const feedback = prompt('Share your feedback (optional):');
            await api.patch(`/projects/${id}/rate`, { score, feedback });
            fetchProjects();
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'Ongoing': return <Construction className="text-amber-500" size={18} />;
            default: return <Clock className="text-blue-500" size={18} />;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 bg-auth-mesh min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/50 p-8 rounded-3xl border border-white/10 glass-card gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h1 className="text-3xl font-black text-white tracking-tight">Public Works & Projects</h1>
                    <p className="text-slate-400 font-medium">Monitoring government initiatives for local transparency</p>
                </div>
                {user?.role === 'Officer' && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl transition-all font-bold text-white shadow-lg shadow-blue-600/20">
                        <Plus size={20} />
                        Launch New Project
                    </button>
                )}
            </header>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
                    <form onSubmit={handleCreate} className="glass-card max-w-lg w-full p-8 space-y-6 border border-white/10 animate-in slide-in-from-bottom-4">
                        <h3 className="text-xl font-bold text-white">Project Specification</h3>
                        <div className="space-y-4">
                            <ProjectInput label="Title" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} />
                            <ProjectInput label="Description" value={formData.description} rows={3} onChange={(v) => setFormData({ ...formData, description: v })} />
                            <div className="grid grid-cols-2 gap-4">
                                <ProjectInput label="Budget" value={formData.budget} onChange={(v) => setFormData({ ...formData, budget: v })} />
                                <ProjectInput label="Location" value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-all">Submit for Review</button>
                            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold border border-white/5">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project._id} className="glass-card overflow-hidden border border-white/5 hover:border-blue-500/20 transition-all flex flex-col group">
                        <div className="p-6 space-y-4 flex-1">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{project.title}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-widest">
                                        <Briefcase size={12} />
                                        {project.department}
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-900/50 rounded-xl border border-white/5">
                                    {getStatusIcon(project.status)}
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{project.description}</p>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                                <MetaBox icon={<IndianRupee size={12} />} label="Budget Allocation" value={project.budget} />
                                <MetaBox icon={<MapPin size={12} />} label="Target Area" value={project.location} />
                            </div>

                            <div className="space-y-3 pt-2">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Public Sentiment</p>
                                <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                size={16}
                                                className={`cursor-pointer transition-all ${star <= (project.ratings.reduce((a: any, b: any) => a + b.score, 0) / project.ratings.length || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                                                onClick={() => handleRate(project._id, star)}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                        {project.ratings.length} Feedback
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProjectInput = ({ label, value, onChange, rows }: { label: string, value: string, onChange: (v: string) => void, rows?: number }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase ml-1">{label}</label>
        {rows ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-all font-medium"
            />
        ) : (
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-all font-medium"
            />
        )}
    </div>
);

const MetaBox = ({ icon, label, value }: any) => (
    <div className="space-y-1">
        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs truncate">
            {icon}
            {value}
        </div>

        {/* Nearby Issues */}
        <div className="p-6 max-w-7xl mx-auto pb-12">
            <div className="glass-card p-8 border border-white/5 space-y-6">
                <NearbyIssuesPanel radiusKm={3} />
            </div>
        </div>
    </div>
);

export default GovernmentProjects;
