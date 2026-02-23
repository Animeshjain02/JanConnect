import React, { useState, useRef } from 'react';
import api from '../services/api';
import { Loader2, Camera, Mic, MapPin, Send, Check, X } from 'lucide-react';

interface ComplaintFormProps {
    onSuccess: () => void;
    onClose: () => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: { lat: 0, lng: 0, address: '' },
        imageUrl: '',
        voiceUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [recording, setRecording] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const handleGetLocation = () => {
        setLocating(true);
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        address: 'Detected via GPS'
                    }
                });
                setLocating(false);
            },
            () => {
                setError('Unable to retrieve your location');
                setLocating(false);
            }
        );
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, voiceUrl: reader.result as string }));
                };
                reader.readAsDataURL(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecording(true);
            setError('');
        } catch (err) {
            setError('Microphone access denied or not available.');
            console.error(err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.location.lat === 0) {
            setError('Please provide your location');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/complaints', formData);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Report Civic Issue</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-hide">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm flex items-center gap-3">
                            <X size={18} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Issue Summary</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-medium"
                                placeholder="What's the problem?"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Evidence & Context</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none font-medium text-sm leading-relaxed"
                                placeholder="Describe the severity and impact. Our AI will analyze this to assign priority."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                        <button
                            type="button"
                            className={`flex flex-col items-center justify-center gap-2 border rounded-2xl p-4 transition-all ${formData.imageUrl ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900 border-white/5 hover:border-blue-500/30'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {formData.imageUrl ? <Check className="text-blue-400" size={24} /> : <Camera size={24} className="text-slate-400" />}
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                {formData.imageUrl ? 'Photo Added' : 'Add Photo'}
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`flex flex-col items-center justify-center gap-2 border rounded-2xl p-4 transition-all ${recording ? 'bg-red-500/20 border-red-500/50 animate-pulse' : formData.voiceUrl ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-900 border-white/5 hover:border-purple-500/30'}`}
                            onClick={recording ? stopRecording : startRecording}
                        >
                            {recording ? <Mic className="text-red-500" size={24} /> : formData.voiceUrl ? <Check className="text-purple-400" size={24} /> : <Mic size={24} className="text-slate-400" />}
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                {recording ? 'Recording...' : formData.voiceUrl ? 'Voice Saved' : 'Voice Memo'}
                            </span>
                        </button>

                        <button
                            type="button"
                            disabled={locating}
                            className={`flex flex-col items-center justify-center gap-2 border rounded-2xl p-4 transition-all ${formData.location.lat !== 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-white/5 hover:border-emerald-500/30'}`}
                            onClick={handleGetLocation}
                        >
                            {locating ? <Loader2 size={24} className="animate-spin text-emerald-400" /> : <MapPin size={24} className={formData.location.lat !== 0 ? 'text-emerald-400' : 'text-slate-400'} />}
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                {locating ? 'Locating...' : formData.location.lat !== 0 ? 'Geo-Tagged' : 'Get Location'}
                            </span>
                        </button>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-slate-400 hover:text-white transition-all text-xs uppercase tracking-widest"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-white text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Dispatch Grievance
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComplaintForm;
