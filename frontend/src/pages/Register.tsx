import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, UserPlus, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Citizen',
        department: 'General Administration'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-auth-mesh p-4 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-slow-spin" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-slow-spin" />

            <div className="w-full max-w-[480px] z-10 py-8">
                <div className="glass-card p-8 md:p-12 space-y-8">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-2">
                            <UserPlus className="w-8 h-8 text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Create Account</h1>
                        <p className="text-slate-400">Join the JanConnect civic network</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="input-field"
                                        style={{ paddingLeft: '3.25rem' }}
                                        placeholder="Animesh Jain"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="input-field"
                                        style={{ paddingLeft: '3.25rem' }}
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="input-field"
                                    style={{ paddingLeft: '3.25rem' }}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Your Role</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                                    <select
                                        name="role"
                                        className="input-field appearance-none cursor-pointer"
                                        style={{ colorScheme: 'dark', paddingLeft: '3.25rem' }}
                                        value={formData.role}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Citizen">Citizen</option>
                                        <option value="Officer">Officer</option>
                                    </select>
                                </div>
                            </div>

                            {formData.role === 'Officer' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-right-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Department</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                                        <select
                                            name="department"
                                            className="input-field appearance-none cursor-pointer"
                                            style={{ colorScheme: 'dark', paddingLeft: '3.25rem' }}
                                            value={formData.department}
                                            onChange={handleInputChange}
                                        >
                                            <option value="General Administration">General Administration</option>
                                            <option value="Public Works">Public Works</option>
                                            <option value="Health">Health</option>
                                            <option value="Education">Education</option>
                                            <option value="Sanitation">Sanitation</option>
                                            <option value="Water Authority">Water Authority</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary mt-4 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    <span>Create Account</span>
                                    <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-950 px-2 text-slate-500 font-medium">Already have an account?</span>
                        </div>
                    </div>

                    <Link
                        to="/login"
                        className="w-full flex items-center justify-center p-3 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 font-medium transition-all group"
                    >
                        Sign in instead
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <p className="mt-8 text-center text-xs text-slate-500">
                    By joining, you agree to our Terms of Service.
                </p>
            </div>
        </div>
    );
};

export default Register;
