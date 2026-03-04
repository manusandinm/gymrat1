/**
 * components/LeagueView.jsx
 *
 * Vista de la pestaña "Liga" de GymRat.
 *
 * Muestra:
 *  - Selector de liga activa (entre las ligas en las que participa el usuario).
 *  - Botón para unirse/crear una nueva liga.
 *  - Tarjeta informativa de la liga activa (nombre, código, descripción, premio, castigo).
 *  - Clasificación ordenada de los participantes de la liga activa.
 *
 * Si el usuario no pertenece a ninguna liga, muestra un estado vacío con acceso rápido
 * al modal de unirse/crear.
 *
 * Props:
 *  - currentUser {Object} - Datos del usuario autenticado.
 *  - users {Array} - Lista de todos los usuarios.
 *  - leagues {Array} - Lista de ligas en las que participa el usuario.
 *  - activeLeagueId {string} - ID de la liga seleccionada.
 *  - setActiveLeagueId {Function} - Cambia la liga activa.
 *  - userId {string} - ID del usuario autenticado.
 *  - onOpenCreateModal {Function} - Abre el modal de unirse/crear liga.
 *  - onOpenEditLeague {Function} - Abre el modal de editar liga.
 *  - onOpenDescription {Function} - Abre el modal de reglas completas.
 */
import React from 'react';
import { Trophy, Users, Award, Clock, ChevronRight, PlusCircle, Settings, Share2 } from 'lucide-react';

export default function LeagueView({
    currentUser, users, leagues, activeLeagueId, setActiveLeagueId,
    userId, onOpenCreateModal, onOpenEditLeague, onOpenDescription,
    onOpenUserProfile
}) {
    // Ligas en las que participa el usuario actual
    const myLeagues = leagues.filter(l => currentUser.leaguePoints[l.id] !== undefined);
    const activeLeague = myLeagues.find(l => l.id === activeLeagueId) || myLeagues[0];

    // Estado vacío: el usuario aún no está en ninguna liga
    if (!activeLeague) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 mt-10">
                <Trophy className="w-16 h-16 text-slate-300" />
                <p className="text-center font-medium">Aún no estás en ninguna liga.</p>
                <button
                    onClick={() => onOpenCreateModal('join')}
                    className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl mt-4"
                >
                    Unirse o Crear Liga
                </button>
            </div>
        );
    }

    // Ranking de la liga activa
    const leagueLeaderboard = users
        .filter(u => u.leaguePoints[activeLeagueId] !== undefined)
        .sort((a, b) => b.leaguePoints[activeLeagueId] - a.leaguePoints[activeLeagueId]);

    // Función para compartir liga
    const handleShareLeague = async () => {
        const shareText = `¡Únete a mi liga "${activeLeague.name}" en GymRat! Usa el código: ${activeLeague.code}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Liga en GymRat',
                    text: shareText,
                });
            } catch (err) {
                // El usuario posiblemente canceló, o hubo otro error no crítico
                console.error('Error compartiendo:', err);
            }
        } else {
            // Fallback: copiar al portapapeles
            try {
                await navigator.clipboard.writeText(shareText);
                alert('¡Código y mensaje copiados al portapapeles! Listo para pegar en WhatsApp u otra app.');
            } catch (err) {
                alert('No se pudo copiar el código automáticamente. Tu código es: ' + activeLeague.code);
            }
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-200">

            {/* ── Selector de liga + botón nueva liga ── */}
            <div className="flex gap-2">
                <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center overflow-hidden flex-1">
                    <select
                        value={activeLeague?.id || ''}
                        onChange={e => setActiveLeagueId(e.target.value)}
                        className="w-full bg-transparent font-bold text-slate-800 text-lg outline-none appearance-none pl-4 pr-12 py-4 cursor-pointer z-10"
                    >
                        {myLeagues.map(league => (
                            <option key={league.id} value={league.id}>🏆 {league.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-0">
                        <ChevronRight className="w-5 h-5 text-slate-400 rotate-90" />
                    </div>
                </div>
                <button
                    onClick={() => onOpenCreateModal('join')}
                    className="bg-indigo-600 text-white px-5 py-4 rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-bold text-sm flex-shrink-0"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">Nueva Liga</span>
                    <span className="inline sm:hidden">Liga</span>
                </button>
            </div>

            {/* ── Tarjeta de la liga activa ── */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
                <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none"><Trophy className="w-48 h-48" /></div>

                <div className="flex justify-between items-start">
                    <span className="bg-indigo-500 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                        {activeLeague.isPublic ? 'Pública' : 'Privada'}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-white/10 px-2 py-1 rounded-md">
                        Cód: {activeLeague.code}
                    </span>
                </div>

                <div className="flex justify-between items-center mt-3 mb-1">
                    <h1 className="text-2xl font-black">{activeLeague.name}</h1>
                    <div className="flex items-center gap-2 relative z-10">
                        {activeLeague.id !== 'global' && (
                            <button onClick={(e) => { e.stopPropagation(); handleShareLeague(); }} className="text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full cursor-pointer pointer-events-auto" title="Compartir Liga">
                                <Share2 className="w-4 h-4" />
                            </button>
                        )}
                        {activeLeague.id !== 'global' && (
                            <button onClick={(e) => { e.stopPropagation(); onOpenEditLeague(); }} className="text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full cursor-pointer pointer-events-auto" title="Ajustes">
                                <Settings className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-slate-400 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" /> {leagueLeaderboard.length} Participantes
                </p>

                {/* Descripción / reglas resumidas */}
                {activeLeague.description && (
                    <div className="mt-4 bg-white/5 p-3 text-sm text-slate-300 rounded-xl border border-white/10 italic">
                        <p className="line-clamp-2 truncate">{activeLeague.description}</p>
                        <button
                            onClick={onOpenDescription}
                            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded mt-2 font-bold transition-colors"
                        >
                            Ver reglas completas
                        </button>
                    </div>
                )}

                {/* Premio y castigo */}
                <div className="mt-5 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <Award className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                        <div>
                            <p className="font-bold text-sm text-yellow-400">Premio Final</p>
                            <p className="text-sm text-slate-200 mt-1">{activeLeague.prize}</p>
                        </div>
                    </div>
                    {activeLeague.punishment && (
                        <div className="flex items-start gap-3 pt-3 border-t border-white/10">
                            <div className="w-6 h-6 flex items-center justify-center bg-red-500/20 text-red-400 rounded-full flex-shrink-0">
                                <span className="text-sm font-bold">!</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-red-400">Castigo</p>
                                <p className="text-sm text-slate-200 mt-1">{activeLeague.punishment}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Clasificación de la liga ── */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                    Clasificación
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Clock className="w-3.5 h-3.5" />
                        Termina el {activeLeague.endDate}
                    </span>
                </h2>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {leagueLeaderboard.length === 0 && (
                        <p className="p-4 text-center text-slate-500">Aún no hay participantes en esta liga.</p>
                    )}
                    {leagueLeaderboard.map((u, index) => (
                        <div
                            key={u.id}
                            onClick={() => onOpenUserProfile && onOpenUserProfile(u)}
                            className={`flex items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors ${index !== leagueLeaderboard.length - 1 ? 'border-b border-slate-50' : ''} ${u.id === userId ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : ''}`}
                        >
                            {/* Medalla o número */}
                            <div className="w-8 font-black text-slate-300 text-lg">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                            </div>

                            {/* Avatar */}
                            <div className="text-2xl mr-3 bg-slate-100 w-10 h-10 flex items-center justify-center rounded-full overflow-hidden flex-shrink-0">
                                {(u.avatar && (u.avatar.startsWith('data:image') || u.avatar.startsWith('http'))) ? (
                                    <img src={u.avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    u.avatar || '😎'
                                )}
                            </div>

                            {/* Nombre y bio */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold truncate ${u.id === userId ? 'text-indigo-700' : 'text-slate-800'}`}>
                                    {u.name} {u.id === userId && '(Tú)'}
                                </p>
                                {u.bio && <p className="text-xs text-slate-500 font-medium mt-0.5 truncate pr-2">{u.bio}</p>}
                            </div>

                            {/* Puntos */}
                            <div className="font-black text-slate-800 text-lg">
                                {Math.floor(u.leaguePoints[activeLeagueId])} <span className="text-xs font-normal text-slate-500">pts</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
