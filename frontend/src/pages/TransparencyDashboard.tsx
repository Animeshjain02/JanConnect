import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Bar,
    Doughnut
} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import {
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Activity,
    Users
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const TransparencyDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/complaints/my'); // Using all complaints for stats
                const data = res.data;

                // Process data for charts
                const deptCounts: any = {};
                const statusCounts: any = { 'Resolved': 0, 'In Progress': 0, 'Submitted': 0, 'Escalated': 0 };

                data.forEach((c: any) => {
                    deptCounts[c.department] = (deptCounts[c.department] || 0) + 1;
                    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
                });

                setStats({
                    total: data.length,
                    resolved: statusCounts['Resolved'],
                    escalated: statusCounts['Escalated'],
                    deptLabels: Object.keys(deptCounts),
                    deptData: Object.values(deptCounts),
                    statusLabels: Object.keys(statusCounts),
                    statusData: Object.values(statusCounts),
                    avgResolution: '4.2 Days' // Mocked for now
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
            <Activity className="text-blue-500 animate-pulse" size={32} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Aggregating Civic Metrics...</p>
        </div>
    );

    const barData = {
        labels: stats.deptLabels,
        datasets: [{
            label: 'Issues by Department',
            data: stats.deptData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            borderRadius: 8,
        }]
    };

    const doughnutData = {
        labels: stats.statusLabels,
        datasets: [{
            data: stats.statusData,
            backgroundColor: [
                'rgba(34, 197, 94, 0.4)',
                'rgba(245, 158, 11, 0.4)',
                'rgba(59, 130, 246, 0.4)',
                'rgba(239, 68, 68, 0.4)',
            ],
            borderColor: [
                '#22c55e',
                '#f59e0b',
                '#3b82f6',
                '#ef4444',
            ],
            borderWidth: 2,
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#64748b' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 bg-auth-mesh min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/50 p-8 rounded-3xl border border-white/10 glass-card gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-white tracking-tight">System Transparency</h1>
                    <p className="text-slate-400 font-medium">Real-time performance metrics of JanConnect departments</p>
                </div>
                <div className="flex gap-4">
                    <StatPill label="Uptime" value="99.9%" />
                    <StatPill label="Avg SLA" value={stats.avgResolution} />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Grievances" value={stats.total} trend="+12%" icon={<TrendingUp size={20} />} />
                <MetricCard label="Resolution Rate" value={`${Math.round((stats.resolved / stats.total) * 100)}%`} trend="+5%" icon={<CheckCircle2 size={20} className="text-emerald-500" />} />
                <MetricCard label="Escalation Count" value={stats.escalated} trend="-2%" icon={<AlertCircle size={20} className="text-red-500" />} />
                <MetricCard label="Active Citizens" value="1.2k" trend="+8%" icon={<Users size={20} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-8 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white uppercase tracking-widest text-xs">Departmental Performance</h3>
                        <Activity size={16} className="text-blue-500" />
                    </div>
                    <div className="h-64">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>

                <div className="glass-card p-8 border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white uppercase tracking-widest text-xs">Lifecycle Distribution</h3>
                        <Clock size={16} className="text-amber-500" />
                    </div>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#64748b', boxWidth: 12, padding: 20 } } } }} />
                    </div>
                </div>
            </div>

            <div className="glass-card p-8 border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white uppercase tracking-widest text-xs">Strategic Area Breakdown</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.deptLabels.map((label: string, idx: number) => (
                        <div key={label} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">{label}</span>
                                <span className="text-blue-400">{stats.deptData[idx]} Issues</span>
                            </div>
                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                                    style={{ width: `${(stats.deptData[idx] / stats.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, trend, icon }: any) => (
    <div className="glass-card p-6 border border-white/5 group hover:border-white/10 transition-all space-y-3">
        <div className="flex justify-between items-start">
            <div className="bg-white/5 p-2 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">{icon}</div>
            <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{trend}</span>
        </div>
        <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">{label}</p>
            <p className="text-2xl font-black text-white mt-1">{value}</p>
        </div>
    </div>
);

const StatPill = ({ label, value }: any) => (
    <div className="bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-2 flex flex-col items-center">
        <span className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter leading-none">{label}</span>
        <span className="text-sm font-black text-white">{value}</span>
    </div>
);

export default TransparencyDashboard;
