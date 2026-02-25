import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Mail, Lock, User as UserIcon, LogIn, Chrome } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await loginWithEmail(email, password);
                if (error) throw error;
            } else {
                const res = await registerWithEmail(email, password, name);

                if (res.error) {
                    // Si tira error de rate limit, lo interpretamos como que ya se ha enviado.
                    if (res.error.message.includes('security purposes') || res.error.status === 429) {
                        setSuccessMsg('Ya hemos enviado un correo. Revisa tu bandeja de entrada o la carpeta de spam.');
                        return;
                    }
                    throw res.error;
                }

                // Supabase permite "registrar" un email que ya existe sin emitir error (por seguridad),
                // en ese caso la matriz de identities viene vacía.
                if (res.data?.user && res.data.user.identities && res.data.user.identities.length === 0) {
                    setError('Este correo electrónico ya está registrado. Por favor, inicia sesión.');
                    return;
                }

                setSuccessMsg('¡Registro completado! Se te ha envíado un correo de confirmación. Revisa tu bandeja y verifica tu cuenta para acceder.');
            }
        } catch (err) {
            setError(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await loginWithGoogle();
            if (error) throw error;
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-slate-900 p-8 text-center relative overflow-hidden text-white">
                    <Trophy className="w-48 h-48 absolute -top-10 -right-10 opacity-10 text-indigo-500" />
                    <h1 className="text-4xl font-black mb-2 relative z-10 text-indigo-500 tracking-tighter">GYMRAT</h1>
                    <p className="text-slate-400 font-medium relative z-10">Compite con tus amigos entrenando</p>
                </div>

                <div className="p-8">
                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                        <button
                            onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                        >
                            Registrarse
                        </button>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Tu nombre (Ej: Carlos)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="password"
                                required
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm font-medium border border-emerald-100">
                                {successMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <span>Cargando...</span>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    {isLogin ? 'Entrar' : 'Crear mi cuenta'}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center bg-slate-200 h-px">
                        <span className="bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mx-auto relative -top-[10px]">
                            o continúa con
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Chrome className="w-5 h-5 text-red-500" />
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
}
