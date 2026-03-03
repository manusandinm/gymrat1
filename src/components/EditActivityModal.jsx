/**
 * components/EditActivityModal.jsx
 *
 * Modal para editar una actividad deportiva ya registrada.
 *
 * Permite modificar:
 *  - Fecha y hora de la actividad.
 *  - Duración en minutos (con botones +/-).
 *  - Detalles / notas de texto.
 *  - Foto adjunta (se puede reemplazar o eliminar).
 *
 * NOTA: Este modal no recalcula puntos al editar para mantener
 * la coherencia con los puntos ya distribuidos en las ligas.
 *
 * Props:
 *  - activity {Object} - Actividad a editar (id, duration, details, photo, createdAt).
 *  - onSave {Function(data)} - Callback al guardar los cambios.
 *  - onClose {Function} - Cierra el modal sin guardar.
 */
import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { resizeImage } from '../utils/imageUtils';

export default function EditActivityModal({ activity, onSave, onClose }) {
    // Convertir la fecha UTC de la BD a formato local para el input datetime-local
    const toLocalDateTimeString = (isoString) => {
        const d = new Date(isoString);
        const tzOffset = d.getTimezoneOffset() * 60000;
        return (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    };

    const [editDuration, setEditDuration] = useState(activity.duration);
    const [editDetails, setEditDetails] = useState(activity.details);
    const [editPhoto, setEditPhoto] = useState(activity.photo);
    const [editDate, setEditDate] = useState(toLocalDateTimeString(activity.createdAt));

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave({
            id: activity.id,
            duration: editDuration,
            details: editDetails,
            photo: editPhoto,
            date: editDate
        });
        onClose();
    };

    return (
        <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            {/* ── Cabecera ── */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center rounded-b-3xl shadow-lg">
                <h2 className="text-xl font-bold">Editar Actividad</h2>
                <button onClick={onClose} className="bg-white/10 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    {/* Fecha */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                            required
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold"
                        />
                    </div>

                    {/* Duración con +/- */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Duración (Minutos)</label>
                        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-2">
                            <button type="button" onClick={() => setEditDuration(Math.max(1, editDuration - 5))}
                                className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors active:scale-95">
                                <span className="text-2xl font-black">-</span>
                            </button>
                            <div className="text-center">
                                <span className="text-3xl font-black text-slate-800">{editDuration}</span>
                                <span className="text-sm font-bold text-slate-400 ml-1">min</span>
                            </div>
                            <button type="button" onClick={() => setEditDuration(editDuration + 5)}
                                className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors active:scale-95">
                                <span className="text-2xl font-black">+</span>
                            </button>
                        </div>
                    </div>

                    {/* Detalles */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Detalles / Notas</label>
                        <input
                            type="text"
                            value={editDetails}
                            onChange={e => setEditDetails(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold"
                        />
                    </div>
                </div>

                {/* ── Foto ── */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Foto</label>
                    {!editPhoto ? (
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-white">
                            <Camera className="w-6 h-6 text-slate-400 mb-1" />
                            <span className="text-xs font-semibold text-slate-500">Subir foto nueva</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) setEditPhoto(await resizeImage(file, 800, 800));
                                }}
                            />
                        </label>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden h-40">
                            <img src={editPhoto} alt="Preview" className="w-full h-full object-cover object-center" />
                            <button type="button" onClick={() => setEditPhoto(null)} className="absolute top-2 right-2 bg-slate-900/60 p-1.5 rounded-full text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Guardar ── */}
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg mt-auto">
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
}
