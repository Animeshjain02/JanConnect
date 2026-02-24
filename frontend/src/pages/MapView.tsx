import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Complaint } from '../types';
import api from '../services/api';
import L from 'leaflet';
import { Filter } from 'lucide-react';

const MapView = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'All',
        priority: 'All',
        department: 'All'
    });

    useEffect(() => {
        const fetchAllComplaints = async () => {
            try {
                // Fetch all complaints for the region (admin view)
                const response = await api.get('/complaints/my');
                setComplaints(response.data);
                setFilteredComplaints(response.data);
            } catch (err) {
                console.error('Failed to fetch complaints for map', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllComplaints();
    }, []);

    useEffect(() => {
        let result = complaints;
        if (filters.status !== 'All') result = result.filter(c => c.status === filters.status);
        if (filters.priority !== 'All') result = result.filter(c => c.priorityLevel === filters.priority);
        if (filters.department !== 'All') result = result.filter(c => c.department === filters.department);
        setFilteredComplaints(result);
    }, [filters, complaints]);

    const getMarkerIcon = (status: string) => {
        let color = '#3b82f6'; // blue
        if (status === 'Resolved') color = '#22c55e'; // green
        if (status === 'Escalated' || status === 'Critical') color = '#ef4444'; // red
        if (status === 'In Progress') color = '#f59e0b'; // amber

        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });
    };

    // Auto-centers map on user's GPS location
    const UserLocationCenterer = () => {
        const map = useMap();
        useEffect(() => {
            navigator.geolocation?.getCurrentPosition(pos => {
                map.setView([pos.coords.latitude, pos.coords.longitude], 14);
            });
        }, [map]);
        return null;
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-900 border border-white/5 rounded-2xl gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Calibrating Satellite Mapping...</p>
        </div>
    );

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 h-full relative bg-slate-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                {/* Filter Overlay */}
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                    <div className="glass-card p-4 border border-white/10 space-y-4 min-w-[200px]">
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest pb-2 border-b border-white/5">
                            <Filter size={14} className="text-blue-500" />
                            Smart Filters
                        </div>

                        <div className="space-y-3">
                            <FilterSelect
                                label="Status"
                                value={filters.status}
                                options={['All', 'Submitted', 'In Progress', 'Resolved', 'Escalated']}
                                onChange={(v: string) => setFilters({ ...filters, status: v })}
                            />
                            <FilterSelect
                                label="Priority"
                                value={filters.priority}
                                options={['All', 'Low', 'Medium', 'High', 'Critical']}
                                onChange={(v: string) => setFilters({ ...filters, priority: v })}
                            />
                            <FilterSelect
                                label="Department"
                                value={filters.department}
                                options={['All', 'Public Works', 'Health', 'Education', 'Sanitation', 'Water Authority']}
                                onChange={(v: string) => setFilters({ ...filters, department: v })}
                            />
                        </div>

                        <div className="pt-2 text-[10px] text-slate-500 font-medium flex justify-between">
                            <span>Showing:</span>
                            <span className="text-blue-400">{filteredComplaints.length} issues</span>
                        </div>
                    </div>
                </div>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 z-[1000] glass-card p-3 border border-white/10 text-[10px] space-y-2">
                    <LegendItem color="#3b82f6" label="Standard" />
                    <LegendItem color="#f59e0b" label="In Progress" />
                    <LegendItem color="#22c55e" label="Resolved" />
                    <LegendItem color="#ef4444" label="Critical / Escalated" />
                </div>

                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{ height: '100%', width: '100%', background: '#0f172a' }}
                    className="z-0"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="map-tiles"
                    />
                    <UserLocationCenterer />
                    {filteredComplaints.map(complaint => (
                        complaint.location?.lat && complaint.location?.lng && (
                            <Marker
                                key={complaint._id}
                                position={[complaint.location.lat, complaint.location.lng]}
                                icon={getMarkerIcon(complaint.status)}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-2 space-y-2 min-w-[200px]">
                                        {(complaint as any).imageUrl && (
                                            <img
                                                src={(complaint as any).imageUrl}
                                                alt={complaint.title}
                                                className="w-full h-24 object-cover rounded-lg mb-2"
                                            />
                                        )}
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-bold text-slate-900 text-sm">{complaint.title}</h3>
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${getPrioBadge(complaint.priorityLevel)}`}>
                                                {complaint.priorityLevel?.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{complaint.description}</p>
                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                                            <span className="text-blue-600 font-bold uppercase">{complaint.department}</span>
                                            <span className="text-slate-400">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

const FilterSelect = ({ label, value, options, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-1 px-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const LegendItem = ({ color, label }: { color: string, label: string }) => (
    <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: color }} />
        <span className="text-slate-400 font-medium uppercase tracking-tighter">{label}</span>
    </div>
);

const getPrioBadge = (prio: string) => {
    switch (prio) {
        case 'Critical': return 'bg-red-100 text-red-700';
        case 'High': return 'bg-orange-100 text-orange-700';
        case 'Medium': return 'bg-blue-100 text-blue-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

export default MapView;
