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
import React from 'react';
import { Activity, Clock, Target, Zap, Pencil, Trash2 } from 'lucide-react';

export default function HomeView({ currentUser, globalLeaderboard, activities, users, userId, sports, onEditActivity, onDeleteActivity }) {
    return (
        <div className="space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-200 pt-8">

            {/* ── Tarjeta de puntuación del usuario ── */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium">Hola, {currentUser.name}</p>
                        <h1 className="text-2xl font-bold">Tu Puntuación</h1>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <Zap className="text-yellow-300 w-6 h-6" />
                    </div>
                </div>

                <div className="text-5xl font-black mb-2 tracking-tight">
                    {Math.floor(currentUser.totalPoints)} <span className="text-xl font-medium text-indigo-200">pts</span>
                </div>

                {/* Distancia al primer puesto */}
                {globalLeaderboard.length > 0 && currentUser.id !== globalLeaderboard[0].id && (
                    <div className="bg-white/10 rounded-xl p-3 mt-4 flex items-center text-sm">
                        <Target className="w-4 h-4 mr-2 text-indigo-200" />
                        <span>A {Math.floor(globalLeaderboard[0].totalPoints - currentUser.totalPoints)} pts del líder ({globalLeaderboard[0].name})</span>
                    </div>
                )}
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
                                                <p className="font-bold text-slate-800 text-sm">{u.name} <span className="font-normal text-slate-500">hizo {sport.name}</span></p>
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
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
