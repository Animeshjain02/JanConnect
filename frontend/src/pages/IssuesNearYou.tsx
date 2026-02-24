import NearbyIssuesPanel from '../components/NearbyIssuesPanel';
import { MapPin, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IssuesNearYou = () => {
    const navigate = useNavigate();

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 bg-auth-mesh min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/50 p-8 rounded-3xl border border-white/10 glass-card gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-slate-400 hover:text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <MapPin className="text-blue-500" size={24} />
                            <h1 className="text-3xl font-black text-white tracking-tight">Issues Near You</h1>
                        </div>
                        <p className="text-slate-400 font-medium">Identify and support local improvements in your community</p>
                    </div>
                </div>
            </header>

            <div className="glass-card p-2 md:p-8 border border-white/5">
                <NearbyIssuesPanel radiusKm={5} />
            </div>

            <footer className="text-center py-8">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    CivicAI JanConnect GÇó Hyper-local Issue Tracking
                </p>
            </footer>
        </div>
    );
};

export default IssuesNearYou;
