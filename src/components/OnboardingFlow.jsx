/**
 * components/OnboardingFlow.jsx
 *
 * Flujo de bienvenida para nuevos usuarios de GymRat.
 *
 * Consta de dos pasos:
 *
 *  Paso 1 (onboardingStep === 1):
 *    - Invita al usuario a unirse a una liga existente (por código o pública)
 *      o a crear una nueva, para empezar a competir.
 *    - Reutiliza los formularios del modal de ligas.
 *
 *  Paso "view_league" (onboardingStep === 'view_league'):
 *    - Overlay que confirma que se ha unido/creado la liga con éxito
 *      y lleva al Paso 2.
 *
 *  Paso "pwa" (onboardingStep === 'pwa'):
 *    - Slideshow de 3 capturas de pantalla explicando cómo instalar
 *      GymRat en la pantalla de inicio del móvil.
 *
 * El onboarding se guarda en localStorage por userId para no repetirlo.
 *
 * Props:
 *  - onboardingStep {number|string} - Paso actual del onboarding.
 *  - setOnboardingStep {Function} - Avanza o retrocede entre pasos.
 *  - leagueModalTab {'join'|'create'} - Pestaña activa del formulario de ligas.
 *  - setLeagueModalTab {Function} - Cambia la pestaña.
 *  - joinCode, setJoinCode - Código para unirse a liga privada.
 *  - joinError, setJoinError - Error del form de unirse.
 *  - leagues {Array} - Todas las ligas (para filtrar públicas).
 *  - currentUser {Object} - Usuario actual (para saber qué ligas ya tiene).
 *  - newLeague* / setNewLeague* - Campos del formulario de creación de liga.
 *  - onJoin, onJoinPublic, onCreate - Handlers de las acciones de liga.
 *  - onSkip {Function} - Salta y cierra el onboarding completamente.
 */
import React, { useState } from 'react';

export default function OnboardingFlow({
    onboardingStep, setOnboardingStep,
    leagueModalTab, setLeagueModalTab,
    joinCode, setJoinCode, joinError, setJoinError,
    leagues, currentUser,
    newLeagueName, setNewLeagueName,
    newLeagueDescription, setNewLeagueDescription,
    newLeaguePunishment, setNewLeaguePunishment,
    newLeagueEndDate, setNewLeagueEndDate,
    newLeaguePrize, setNewLeaguePrize,
    newLeagueIsPublic, setNewLeagueIsPublic,
    onJoin, onJoinPublic, onCreate,
    onSkip
}) {
    const [pwaSlide, setPwaSlide] = useState(0);

    // Ligas públicas a las que el usuario aún no pertenece
    const availablePublicLeagues = leagues.filter(
        l => l.isPublic && currentUser.leaguePoints[l.id] === undefined
    );

    return (
        <>
            {/* ── Paso 1: unirse o crear liga ── */}
            {onboardingStep === 1 && (
                <div className="absolute inset-0 z-[100] bg-indigo-600 animate-in slide-in-from-bottom-full duration-300 flex flex-col pt-10 px-6">
                    <div className="text-white flex justify-between items-start pb-8">
                        <div>
                            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Paso 1 de 2</span>
                            <h2 className="text-3xl font-black mt-3 leading-tight">Tu primera<br />Liga 🏆</h2>
                        </div>
                        <button onClick={() => setOnboardingStep('pwa')} className="text-xs bg-white/10 text-white font-bold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
                            Saltar paso
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col bg-white rounded-t-3xl shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.3)] mt-2 -mx-6 px-6 pt-6 overflow-y-auto">
                        <p className="font-medium text-slate-500 mb-6 text-sm text-center">
                            Para empezar a competir, necesitas unirte a una liga con tus amigos o crear la tuya propia.
                        </p>

                        {/* Pestañas unirse / crear */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 flex-shrink-0">
                            <button type="button" onClick={() => { setLeagueModalTab('join'); setJoinError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg ${leagueModalTab === 'join' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Unirse con código</button>
                            <button type="button" onClick={() => { setLeagueModalTab('create'); setJoinError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg ${leagueModalTab === 'create' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Crear nueva</button>
                        </div>

                        {leagueModalTab === 'join' ? (
                            /* Formulario para unirse */
                            <div className="flex flex-col gap-6 flex-1">
                                <form onSubmit={onJoin} className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Código de Liga Privada</label>
                                        <div className="flex gap-2">
                                            <input type="text" required placeholder="Ej: INVIERNO26" value={joinCode} onChange={e => setJoinCode(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none uppercase" />
                                            <button type="submit" disabled={!joinCode.trim()} className="bg-indigo-600 px-6 text-white font-bold rounded-xl shadow-lg disabled:opacity-50">Unirse</button>
                                        </div>
                                        {joinError && <p className="text-red-500 text-xs font-bold mt-2">{joinError}</p>}
                                    </div>
                                </form>
                                <div className="mt-4 border-t border-slate-100 pt-6">
                                    <h3 className="text-sm font-bold text-slate-700 mb-3">Ligas Públicas Disponibles</h3>
                                    <div className="space-y-3">
                                        {availablePublicLeagues.map(pubLeague => (
                                            <div key={pubLeague.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800">{pubLeague.name}</p>
                                                    <p className="text-xs text-slate-500">Premio: {pubLeague.prize}</p>
                                                </div>
                                                <button onClick={() => onJoinPublic(pubLeague.id)} className="bg-indigo-50 text-indigo-600 font-bold px-4 py-2 rounded-lg text-xs hover:bg-indigo-100">Unirme</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Formulario para crear */
                            <form onSubmit={onCreate} className="flex flex-col gap-6 flex-1">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la liga</label>
                                    <input type="text" required value={newLeagueName} onChange={e => setNewLeagueName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Descripción o Reglas (Opcional)</label>
                                    <textarea placeholder="Ej: Puntos dobles los domingos..." value={newLeagueDescription} onChange={e => setNewLeagueDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-medium outline-none text-sm min-h-[80px]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Privacidad de la liga</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setNewLeagueIsPublic(false)} className={`flex-1 py-3 text-sm font-bold rounded-xl border ${!newLeagueIsPublic ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>Privada</button>
                                        <button type="button" onClick={() => setNewLeagueIsPublic(true)} className={`flex-1 py-3 text-sm font-bold rounded-xl border ${newLeagueIsPublic ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>Pública</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Premio</label>
                                        <input type="text" required value={newLeaguePrize} onChange={e => setNewLeaguePrize(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Castigo (Opcional)</label>
                                        <input type="text" placeholder="Ej: Paga la cena" value={newLeaguePunishment} onChange={e => setNewLeaguePunishment(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Fecha de fin</label>
                                        <input type="date" required value={newLeagueEndDate} onChange={e => setNewLeagueEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full mt-auto bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">Comenzar</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ── Paso intermedio: confirmar liga creada/unida ── */}
            {onboardingStep === 'view_league' && (
                <div className="absolute inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-end pb-32 px-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center mb-8 animate-in slide-in-from-bottom-8">
                        <h3 className="text-xl font-black text-slate-800 mb-2">¡Aquí tienes tu liga! 🎉</h3>
                        <p className="text-slate-600 text-sm mb-6">Hemos creado tu espacio. Aquí podrás ver la clasificación actual y quién va ganando.</p>
                        <button onClick={() => setOnboardingStep('pwa')} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition">
                            Siguiente paso 👉
                        </button>
                    </div>
                </div>
            )}

            {/* ── Paso 2: guía de instalación PWA ── */}
            {onboardingStep === 'pwa' && (
                <div className="absolute inset-0 z-[100] bg-indigo-600 animate-in slide-in-from-right duration-300 flex flex-col justify-start pt-6 px-6 overflow-y-auto">
                    <div className="flex-shrink-0 text-white flex justify-between items-start pb-4">
                        <div>
                            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Paso 2 de 2</span>
                            <h2 className="text-2xl font-black mt-2 leading-tight">Instala la<br />App 📱</h2>
                        </div>
                        <button onClick={onSkip} className="text-xs bg-white/10 text-white font-bold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">Omitir todo</button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.3)] mt-2 mb-8 px-5 pt-5 pb-5 h-auto flex flex-col items-center">
                        <div className="text-center mb-4">
                            <h3 className="font-bold text-indigo-600 mb-1">Captura {pwaSlide + 1} de 3</h3>
                            <p className="text-slate-500 text-xs font-medium leading-tight">
                                Sigue estas instrucciones para tener GymRat en tu pantalla de inicio.
                            </p>
                        </div>

                        {/* Imagen del paso actual */}
                        <div className="w-full relative rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 mb-5 h-auto max-h-[50vh]">
                            {pwaSlide === 0 && <img src="/install_step_1.png" alt="Paso 1" className="max-w-full max-h-full object-contain rounded-lg" />}
                            {pwaSlide === 1 && <img src="/install_step_2.png" alt="Paso 2" className="max-w-full max-h-full object-contain rounded-lg" />}
                            {pwaSlide === 2 && <img src="/install_step_3.png" alt="Paso 3" className="max-w-full max-h-full object-contain rounded-lg" />}
                        </div>

                        {/* Indicadores de progreso */}
                        <div className="w-full flex justify-center gap-2 mb-4">
                            {[0, 1, 2].map(i => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${pwaSlide === i ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                            ))}
                        </div>

                        {/* Navegación entre slides */}
                        <div className="w-full flex gap-3">
                            {pwaSlide > 0 && (
                                <button onClick={() => setPwaSlide(pwaSlide - 1)} className="font-bold py-3 px-5 rounded-2xl text-slate-500 bg-slate-100 text-sm">Atrás</button>
                            )}
                            {pwaSlide < 2 ? (
                                <button onClick={() => setPwaSlide(pwaSlide + 1)} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg text-sm">Siguiente</button>
                            ) : (
                                <button onClick={onSkip} className="flex-1 bg-emerald-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-200 text-sm">¡Terminar tutorial!</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
