/**
 * components/LeagueModals.jsx
 *
 * Agrupa los tres modales relacionados con la gestión de ligas:
 *
 *  1. LeagueDescriptionModal - Muestra las reglas completas de la liga activa (solo lectura).
 *  2. EditLeagueModal        - Formulario para editar nombre, descripción, fechas, etc.
 *                             También contiene el botón de eliminar liga.
 *  3. CreateOrJoinLeagueModal - Modal con dos pestañas:
 *                               · "Unirse con código" (liga privada o pública).
 *                               · "Crear nueva" liga.
 *
 * Mantenerlos en un archivo facilita compartir el estado del formulario (newLeague*)
 * que es común a la creación y edición de ligas.
 *
 * Cada modal recibe una prop `onClose` para cerrarse. Los formularios reciben
 * sus handlers correspondientes desde el hook useAppData via App.jsx.
 */
import React from 'react';
import { X, Trash2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Modal de descripción / reglas completas de la liga
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Props:
 *  - description {string} - Texto completo de las reglas.
 *  - onClose {Function} - Cierra el modal.
 */
export function LeagueDescriptionModal({ description, onClose }) {
    return (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl shadow-xl w-full max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-full duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                    <h2 className="text-xl font-bold text-slate-800">Reglas de la Liga</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-2 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{description}</p>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 pb-8">
                    <button onClick={onClose} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Modal para editar los datos de la liga activa
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Props:
 *  - newLeagueName, newLeagueDescription, newLeaguePunishment,
 *    newLeagueEndDate, newLeaguePrize, newLeagueIsPublic - Valores del formulario.
 *  - setNewLeague* - Setters de cada campo.
 *  - onSave {Function(event)} - Envía los cambios a Supabase.
 *  - onDelete {Function} - Elimina la liga permanentemente.
 *  - onClose {Function} - Cierra el modal.
 */
export function EditLeagueModal({
    newLeagueName, setNewLeagueName,
    newLeagueDescription, setNewLeagueDescription,
    newLeaguePunishment, setNewLeaguePunishment,
    newLeagueEndDate, setNewLeagueEndDate,
    newLeaguePrize, setNewLeaguePrize,
    newLeagueIsPublic, setNewLeagueIsPublic,
    onSave, onDelete, onClose
}) {
    return (
        <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center rounded-b-3xl shadow-lg">
                <h2 className="text-xl font-bold">Editar Liga</h2>
                <button onClick={onClose} className="text-slate-300 hover:text-white bg-white/10 p-2 rounded-full">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6 flex-1 flex flex-col overflow-y-auto">
                <form onSubmit={onSave} className="flex flex-col gap-6 flex-1">
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
                            <button type="button" onClick={() => setNewLeagueIsPublic(false)} className={`flex-1 py-3 text-sm font-bold rounded-xl border ${!newLeagueIsPublic ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>Privada (Código)</button>
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

                    <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-100">
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">Guardar Cambios</button>
                        <button type="button" onClick={onDelete} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-red-100">
                            <Trash2 className="w-5 h-5" /> Eliminar Liga
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Modal para unirse a una liga existente o crear una nueva
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Props:
 *  - tab {'join' | 'create'} - Pestaña activa.
 *  - setTab {Function} - Cambia la pestaña.
 *  - joinCode, setJoinCode - Código de liga privada.
 *  - joinError - Mensaje de error al unirse.
 *  - setJoinError - Limpia el error.
 *  - publicLeagues {Array} - Ligas públicas disponibles (no unidas aún).
 *  - newLeague* / setNewLeague* - Campos del formulario de creación.
 *  - onJoin {Function(event)} - Une por código.
 *  - onJoinPublic {Function(leagueId)} - Une a liga pública.
 *  - onCreate {Function(event)} - Crea una nueva liga.
 *  - onClose {Function} - Cierra el modal.
 */
export function CreateOrJoinLeagueModal({
    tab, setTab,
    joinCode, setJoinCode, joinError, setJoinError,
    publicLeagues,
    newLeagueName, setNewLeagueName,
    newLeagueDescription, setNewLeagueDescription,
    newLeaguePunishment, setNewLeaguePunishment,
    newLeagueEndDate, setNewLeagueEndDate,
    newLeaguePrize, setNewLeaguePrize,
    newLeagueIsPublic, setNewLeagueIsPublic,
    onJoin, onJoinPublic, onCreate, onClose
}) {
    return (
        <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center rounded-b-3xl shadow-lg">
                <h2 className="text-xl font-bold">Ligas</h2>
                <button onClick={onClose} className="text-slate-300 hover:text-white bg-white/10 p-2 rounded-full">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6 flex-1 flex flex-col overflow-y-auto">
                {/* Pestañas */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6 flex-shrink-0">
                    <button type="button" onClick={() => { setTab('join'); setJoinError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg ${tab === 'join' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Unirse con código</button>
                    <button type="button" onClick={() => { setTab('create'); setJoinError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg ${tab === 'create' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Crear nueva</button>
                </div>

                {tab === 'join' ? (
                    /* ── Pestaña: unirse ── */
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

                        {/* Ligas públicas disponibles */}
                        <div className="mt-4 border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-700 mb-3">Ligas Públicas Disponibles</h3>
                            <div className="space-y-3">
                                {publicLeagues.length === 0 && (
                                    <p className="text-xs text-slate-500 italic">No hay ligas públicas disponibles o ya estás en todas.</p>
                                )}
                                {publicLeagues.map(pubLeague => (
                                    <div key={pubLeague.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{pubLeague.name}</p>
                                            <p className="text-xs text-slate-500">Premio: {pubLeague.prize}</p>
                                        </div>
                                        <button onClick={() => onJoinPublic(pubLeague.id)} className="bg-indigo-50 text-indigo-600 font-bold px-4 py-2 rounded-lg text-xs hover:bg-indigo-100">
                                            Unirme
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── Pestaña: crear ── */
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
                                <button type="button" onClick={() => setNewLeagueIsPublic(false)} className={`flex-1 py-3 text-sm font-bold rounded-xl border ${!newLeagueIsPublic ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>Privada (Código)</button>
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
                        <button type="submit" className="w-full mt-auto bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">Crear Liga</button>
                    </form>
                )}
            </div>
        </div>
    );
}
