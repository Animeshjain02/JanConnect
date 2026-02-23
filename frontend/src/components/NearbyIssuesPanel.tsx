import { useState, useEffect } from 'react';
import { MapPin, ThumbsUp, Loader2, LocateOff, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface NearbyComplaint {
    _id: string;
    complaintId: string;
    title: string;
    description: string;
    department: string;
    status: string;
    priorityLevel: string;
    location: { lat: number; lng: number; address?: string };
    imageUrl?: string;
    upvotes: number;
    upvotedBy: string[];
    distanceKm: number;
}

const statusColor: Record<string, string> = {
    'Submitted': 'bg-blue-500/20 text-blue-400',
    'Under Review': 'bg-yellow-500/20 text-yellow-400',
    'In Progress': 'bg-orange-500/20 text-orange-400',
    'Assigned': 'bg-purple-500/20 text-purple-400',
    'Resolved': 'bg-green-500/20 text-green-400',
    'Escalated': 'bg-red-500/20 text-red-400',
};

interface NearbyIssuesPanelProps {
    radiusKm?: number;
}

const NearbyIssuesPanel = ({ radiusKm = 3 }: NearbyIssuesPanelProps) => {
    const { user } = useAuth();
    const [state, setState] = useState<'idle' | 'requesting' | 'loading' | 'denied' | 'done'>('idle');
    const [issues, setIssues] = useState<NearbyComplaint[]>([]);
    const [upvotedSet, setUpvotedSet] = useState<Set<string>>(new Set());

    useEffect(() => {
        setState('requesting');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setState('loading');
                try {
                    const res = await api.get(`/complaints/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`);
                    setIssues(res.data);
                    // Pre-populate upvoted set from response
                    if (user) {
                        const myUpvotes = new Set<string>(
                            res.data
                                .filter((c: NearbyComplaint) => c.upvotedBy?.includes(user.id))
                                .map((c: NearbyComplaint) => c._id)
                        );
                        setUpvotedSet(myUpvotes);
                    }
                } catch (e) {
                    console.error('Failed to load nearby complaints', e);
                } finally {
                    setState('done');
                }
            },
            () => setState('denied')
        );
    }, []);

    const handleUpvote = async (id: string) => {
        if (!user) return;
        try {
            const res = await api.post(`/complaints/${id}/upvote`);
            setIssues(prev =>
                prev.map(c => c._id === id ? { ...c, upvotes: res.data.upvotes } : c)
            );
            setUpvotedSet(prev => {
                const next = new Set(prev);
                if (res.data.upvoted) next.add(id); else next.delete(id);
                return next;
            });
        } catch (e) {
            console.error('Upvote failed', e);
        }
    };

    if (state === 'idle' || state === 'requesting') {
        return (
            <div className="glass-card p-8 border border-white/5 flex items-center gap-3 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Requesting location to find nearby issues...</span>
            </div>
        );
    }

    if (state === 'denied') {
        return (
            <div className="glass-card p-8 border border-white/5 flex items-center gap-3 text-slate-500">
                <LocateOff size={20} />
                <div>
                    <p className="text-sm font-semibold text-white">Location access denied</p>
                    <p className="text-xs mt-1">Enable location in your browser to see issues near you.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-400" />
                    <h3 className="font-bold text-white uppercase tracking-widest text-xs">
                        Issues Near You ({radiusKm}km radius)
                    </h3>
                </div>
                {state === 'loading' && <Loader2 size={14} className="animate-spin text-blue-400" />}
                <span className="text-xs text-slate-500">{issues.length} found</span>
            </div>

            {issues.length === 0 && state === 'done' && (
                <div className="glass-card p-8 border border-white/5 text-center text-slate-500 text-sm">
                    🎉 No reported issues in your area!
                </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {issues.map(issue => (
                    <div
                        key={issue._id}
                        className="glass-card border border-white/5 hover:border-blue-500/20 transition-all overflow-hidden group"
                    >
                        {issue.imageUrl && (
                            <div className="relative h-28 overflow-hidden">
                                <img
                                    src={issue.imageUrl}
                                    alt={issue.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                                <span className="absolute bottom-2 left-3 text-xs font-bold text-white/90">{issue.department}</span>
                            </div>
                        )}
                        <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-white leading-tight line-clamp-2">{issue.title}</p>
                                <ArrowUpRight size={14} className="text-slate-500 shrink-0 mt-0.5" />
                            </div>
                            {!issue.imageUrl && (
                                <p className="text-xs text-slate-500">{issue.department}</p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[issue.status] || 'bg-slate-700 text-slate-400'}`}>
                                    {issue.status}
                                </span>
                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <MapPin size={10} /> {issue.distanceKm} km away
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <p className="text-[10px] text-slate-600 truncate">{issue.complaintId}</p>
                                <button
                                    onClick={() => handleUpvote(issue._id)}
                                    disabled={!user}
                                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${upvotedSet.has(issue._id)
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                                        } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={!user ? 'Login to upvote' : upvotedSet.has(issue._id) ? 'Remove upvote' : 'Upvote this issue'}
                                >
                                    <ThumbsUp size={12} />
                                    {issue.upvotes ?? 0}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NearbyIssuesPanel;
