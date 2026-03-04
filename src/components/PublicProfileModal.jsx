import React from 'react';
import { X, Clock, Activity, Medal } from 'lucide-react';

export default function PublicProfileModal({ user, activities, sports, onClose }) {
    if (!user) return null;

    // Obtener actividades solo de este usuario
    const userActivities = activities.filter(act => act.userId === user.id);

    return (
        <div className="absolute inset-0 z-[60] bg-slate-50 animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            {/* ── Cabecera ── */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start shadow-lg relative overflow-hidden pb-12">
                <div className="absolute -right-10 -top-10 opacity-5"><Activity className="w-64 h-64" /></div>

                <div className="flex gap-4 items-center z-10">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-700 bg-indigo-100 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
                        {(user.avatar && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http'))) ? (
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover object-center" />
                        ) : (
                            user.avatar || '😎'
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">{user.name}</h2>
                        {user.bio && <p className="text-slate-300 text-sm font-medium mt-1 italic">{user.bio}</p>}
                    </div>
                </div>

                <button onClick={onClose} className="bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-full z-10 flex-shrink-0">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* ── Estadísticas Rápidas ── */}
            <div className="flex justify-around bg-white border-b border-slate-100 py-4 shadow-sm z-10 relative -mt-6 mx-4 rounded-2xl">
                <div className="text-center px-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pts</p>
                    <p className="text-xl font-black text-indigo-700">{Math.floor(user.totalPoints || 0)}</p>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div className="text-center px-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Actividades</p>
                    <p className="text-xl font-black text-slate-800">{userActivities.length}</p>
                </div>
            </div>

            {/* ── Feed de Actividades del Usuario ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <Medal className="w-5 h-5 text-indigo-500" /> Historial de {user.name}
                </h3>

                {userActivities.length === 0 ? (
                    <div className="bg-white p-6 rounded-3xl text-center border border-slate-100 shadow-sm">
                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Aún no tiene actividades registradas.</p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-20">
                        {userActivities.map(act => {
                            const sport = sports.find(s => s.id === act.sportId) || sports[0];
                            return (
                                <div key={act.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Icono del deporte */}
                                            <div className={`w-12 h-12 rounded-full ${sport.color} flex items-center justify-center text-xl shadow-inner text-white flex-shrink-0`}>
                                                {sport.icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{sport.name}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{act.details}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" /> {act.duration} min • {act.date}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="text-emerald-500 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm shadow-sm">
                                                +{Math.floor(act.points)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Foto adjunta (si existe) */}
                                    {act.photo && (
                                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 relative max-h-48">
                                            <img src={act.photo} alt="Prueba de entrenamiento" className="w-full h-full object-cover object-center" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
