import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Mail, Lock, User, AtSign, ArrowRight } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isLogin) {
                // LOG IN FLOW
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (fetchError || !data) {
                    setError('Invalid credentials');
                    setIsLoading(false);
                    return;
                }

                // Check password with bcryptjs directly
                // Note: Normally hashing/comparing happens on backend. Requested to do it here purely on frontend.
                const isMatch = bcrypt.compareSync(password, data.password_hash);

                if (!isMatch) {
                    setError('Invalid credentials');
                    setIsLoading(false);
                    return;
                }

                // Authentication successful
                const userProfile = {
                    id: data.id,
                    email: data.email,
                    full_name: data.full_name,
                    username: data.username,
                    timezone: data.timezone,
                };
                setUser(userProfile);
                navigate('/sentience'); // Dashboard wait, it's either /sentience or /

            } else {
                // SIGN UP FLOW
                // Basic validation
                if (!email || !password || !fullName || !username) {
                    setError('Please fill in all fields');
                    setIsLoading(false);
                    return;
                }

                // Capture Timezone
                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                // Hash password
                const salt = bcrypt.genSaltSync(10);
                const passwordHash = bcrypt.hashSync(password, salt);

                // Insert to Supabase 
                // We're omitting 'id' assuming it's an auto-increment or auto-generated UUID on Supabase side
                const { data, error: insertError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            email: email,
                            password_hash: passwordHash,
                            full_name: fullName,
                            username: username,
                            timezone: timeZone,
                        }
                    ])
                    .select()
                    .single();

                if (insertError) {
                    setError(insertError.message || 'Error creating account. Email or username might be taken.');
                    setIsLoading(false);
                    return;
                }

                if (data) {
                    // Sign-up successful, auto-login
                    const userProfile = {
                        id: data.id, // Ensure this exists on DB response
                        email: data.email,
                        full_name: data.full_name,
                        username: data.username,
                        timezone: data.timezone,
                    };
                    setUser(userProfile);
                    navigate('/sentience');
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center relative overflow-hidden p-4">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-light tracking-tight mb-2">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h1>
                    <p className="text-white/40 text-sm">
                        {isLogin
                            ? 'Enter your details to access your safe space'
                            : 'Join Sentience to start your mindful journey'}
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {/* Tab Navigation */}
                    <div className="flex bg-black/20 p-1 rounded-2xl mb-8">
                        <button
                            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
                            onClick={() => { setIsLogin(true); setError(null); }}
                            type="button"
                        >
                            Log In
                        </button>
                        <button
                            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${!isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
                            onClick={() => { setIsLogin(false); setError(null); }}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {!isLogin && (
                                <motion.div
                                    key="signup-fields"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <AtSign className="h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                                            placeholder="Choose a Username"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            <motion.div key="email-field" className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                                    placeholder="Email Address"
                                />
                            </motion.div>

                            <motion.div key="password-field" className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                                    placeholder="Password"
                                />
                            </motion.div>
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-white text-black font-medium py-3.5 px-4 rounded-2xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{isLogin ? 'Authenticating...' : 'Creating Account...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
