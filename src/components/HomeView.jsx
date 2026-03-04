/**
 * components/HomeView.jsx
 *
 * Vista principal (pestaña "Inicio") de la aplicación GymRat.
 *
 * Muestra:
 *  - Tarjeta resumen con la puntuación total del usuario y distancia al líder.
 *  - Feed de actividad reciente de todos los usuarios (últimas 10 entradas).
 *  - Botones de editar y borrar actividad para las propias del usuario.
 *
 * Props:
 *  - currentUser {Object} - Datos del usuario autenticado.
 *  - globalLeaderboard {Array} - Ranking global por puntos.
 *  - activities {Array} - Lista de actividades recientes.
 *  - users {Array} - Lista de todos los usuarios (para mostrar nombre/avatar).
 *  - userId {string} - ID del usuario autenticado (para mostrar sus controles).
 *  - sports {Array} - Lista de deportes disponibles.
 *  - onEditActivity {Function} - Callback al pulsar "Editar" en una actividad.
 *  - onDeleteActivity {Function} - Callback al pulsar "Borrar" en una actividad.
 */
import React, { useState } from 'react';
import { Activity, Clock, Target, Zap, Pencil, Trash2, ChevronLeft, ChevronRight, Flame } from 'lucide-react';

export default function HomeView({ currentUser, globalLeaderboard, activities, userActivities = [], users, userId, sports, leagues = [], activeLeagueId, onEditActivity, onDeleteActivity, onOpenUserProfile, onToggleReaction }) {
    const actualNow = new Date();
    const actualCurrentMonth = actualNow.getMonth();
    const actualCurrentYear = actualNow.getFullYear();

    const currentMonthPoints = userActivities.reduce((acc, act) => {
        const d = new Date(act.createdAt);
        if (d.getMonth() === actualCurrentMonth && d.getFullYear() === actualCurrentYear) {
            return acc + act.points;
        }
        return acc;
    }, 0);

    // Calcular distancia al lider
    let leaderPoints = 0;
    let distanceToLeader = 0;
    let isLeader = false;
    let leagueName = "Global";

    const myLeagues = leagues.filter(l => currentUser.leaguePoints[l.id] !== undefined);
    const activeLeague = myLeagues.find(l => l.id === activeLeagueId) || myLeagues[0];

    if (activeLeague) {
        const leagueUsers = users.filter(u => u.leaguePoints[activeLeague.id] !== undefined);
        const topUser = leagueUsers.sort((a, b) => b.leaguePoints[activeLeague.id] - a.leaguePoints[activeLeague.id])[0];
        leaderPoints = topUser ? topUser.leaguePoints[activeLeague.id] : 0;
        const myPoints = currentUser.leaguePoints[activeLeague.id] || 0;
        distanceToLeader = Math.floor(leaderPoints - myPoints);
        isLeader = distanceToLeader <= 0;
        leagueName = activeLeague.name;
    } else {
        const topUser = globalLeaderboard[0];
        leaderPoints = topUser ? topUser.totalPoints : 0;
        const myPoints = currentUser.totalPoints || 0;
        distanceToLeader = Math.floor(leaderPoints - myPoints);
        isLeader = distanceToLeader <= 0;
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-200">

            {/* ── Tarjeta Principal (Compacta) ── */}
            <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
                {/* Cabecera Puntos */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-white/70 text-[10px] font-bold uppercase mb-0.5 tracking-wider">Puntuación Total</p>
                        <div className="text-3xl font-black tracking-tight flex items-baseline gap-1">
                            {Math.floor(currentUser.totalPoints)} <span className="text-sm font-medium text-white/50">pts</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white/70 text-[10px] font-bold uppercase mb-0.5 tracking-wider">Mes actual</p>
                        <div className="text-2xl font-bold tracking-tight text-emerald-300 flex items-baseline gap-1 justify-end">
                            +{Math.floor(currentMonthPoints)} <span className="text-xs font-medium text-emerald-300/70">pts</span>
                        </div>
                    </div>
                </div>

                {/* Distancia al Líder */}
                <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-300" />
                        <div>
                            <p className="text-[10px] font-bold text-white/70 uppercase">Distancia al líder</p>
                            <p className="text-xs font-medium text-white/90 truncate max-w-[120px]">Liga: {leagueName}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        {isLeader ? (
                            <span className="text-sm font-bold text-yellow-400">¡Eres el líder! 🏆</span>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-red-300">-{Math.floor(distanceToLeader)}</span>
                                <span className="text-xs font-medium text-red-300/70">pts</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Feed de actividad reciente ── */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Actividad Reciente
                </h2>

                {activities.length === 0 ? (
                    <p className="text-slate-400 text-sm italic">Nadie ha hecho deporte todavía. ¡Sé el primero!</p>
                ) : (
                    <div className="space-y-3">
                        {activities.slice(0, 10).map(act => {
                            const u = users.find(uu => uu.id === act.userId) || { name: 'Alguien' };
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
                                                <p className="font-bold text-slate-800 text-sm">
                                                    <button onClick={() => u.id && onOpenUserProfile && onOpenUserProfile(u)} className="hover:underline hover:text-indigo-600 transition-colors text-left">
                                                        {u.name}
                                                    </button>
                                                    <span className="font-normal text-slate-500"> hizo {sport.name}</span>
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{act.details}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" /> {act.duration} min • {act.date}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            {/* Puntos obtenidos */}
                                            <div className="text-emerald-500 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm">
                                                +{Math.floor(act.points)}
                                            </div>
                                            {/* Controles solo para las actividades propias */}
                                            {act.userId === userId && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => onEditActivity(act)} className="text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 p-2 rounded-full border border-slate-100 shadow-sm">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => onDeleteActivity(act)} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-full border border-slate-100 shadow-sm">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Foto adjunta (si existe) */}
                                    {act.photo && (
                                        <div className="mt-1 rounded-xl overflow-hidden border border-slate-100 relative max-h-48">
                                            <img src={act.photo} alt="Prueba de entrenamiento" className="w-full h-full object-cover object-center" />
                                        </div>
                                    )}

                                    {/* Area de reacciones */}
                                    <div className="flex gap-2 items-center mt-1 pt-3 border-t border-slate-50">
                                        <button
                                            onClick={() => onToggleReaction && onToggleReaction(act.id, '🔥')}
                                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${act.reactions && act.reactions[userId] === '🔥' ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            <Flame className={`w-4 h-4 ${act.reactions && act.reactions[userId] === '🔥' ? 'fill-orange-500 text-orange-500' : ''}`} />
                                            {Object.keys(act.reactions || {}).length > 0 && <span>{Object.keys(act.reactions).length}</span>}
                                        </button>
                                        {Object.keys(act.reactions || {}).length > 0 && (
                                            <div className="flex -space-x-1.5 overflow-hidden">
                                                {Object.keys(act.reactions).slice(0, 3).map(rUserId => {
                                                    const rUser = users.find(u => u.id === rUserId);
                                                    if (!rUser) return null;
                                                    return (
                                                        <div key={rUserId} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] overflow-hidden shadow-sm" title={rUser.name}>
                                                            {rUser.avatar?.startsWith('http') || rUser.avatar?.startsWith('data:') ? <img src={rUser.avatar} className="w-full h-full object-cover" /> : rUser.avatar || '😎'}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
