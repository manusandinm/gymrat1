/**
 * components/ProfileModal.jsx
 *
 * Modal de pantalla completa para editar el perfil del usuario.
 *
 * Permite modificar:
 *  - Foto de perfil (imagen o emoji, comprimida en el cliente).
 *  - Nombre visible.
 *  - Bio / frase motivadora.
 *  - Peso (kg) y Altura (cm).
 *
 * También incluye el botón de "Cerrar sesión".
 *
 * Props:
 *  - editName, editAvatar, editBio, editWeight, editHeight - Valores controlados del formulario.
 *  - setEditName, setEditAvatar, setEditBio, setEditWeight, setEditHeight - Setters del formulario.
 *  - onSave {Function(event)} - Llamado al hacer submit del formulario.
 *  - onClose {Function} - Cierra el modal sin guardar.
 *  - onLogout {Function} - Cierra la sesión del usuario.
 */
import React from 'react';
import { X, Camera, Save, LogOut } from 'lucide-react';
import { resizeImage } from '../utils/imageUtils';

export default function ProfileModal({
    editName, setEditName,
    editAvatar, setEditAvatar,
    editBio, setEditBio,
    editWeight, setEditWeight,
    editHeight, setEditHeight,
    onSave, onClose, onLogout
}) {
    return (
        <div className="absolute inset-0 z-50 bg-slate-50 animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            {/* ── Cabecera ── */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-lg">
                <h2 className="text-xl font-bold">Editar Perfil</h2>
                <button onClick={onClose} className="bg-white/10 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={onSave} className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">

                {/* ── Avatar / foto de perfil ── */}
                <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-indigo-100 flex items-center justify-center text-4xl">
                        {(editAvatar.startsWith('data:image') || editAvatar.startsWith('http')) ? (
                            <img src={editAvatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            editAvatar
                        )}
                    </div>
                    <label className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full cursor-pointer hover:bg-indigo-100 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span>Cambiar Foto</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) setEditAvatar(await resizeImage(file, 400, 400));
                            }}
                        />
                    </label>
                </div>

                {/* ── Datos personales ── */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                        <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            required
                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bio / Frase Motivadora</label>
                        <input
                            type="text"
                            value={editBio}
                            onChange={e => setEditBio(e.target.value)}
                            placeholder="¡A darlo todo!"
                            className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={editWeight}
                                onChange={e => setEditWeight(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Altura (cm)</label>
                            <input
                                type="number"
                                value={editHeight}
                                onChange={e => setEditHeight(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Acciones ── */}
                <div className="mt-auto space-y-3 pt-6">
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" /> Guardar Cambios
                    </button>
                    <div className="h-px bg-slate-200 my-4" />
                    <button type="button" onClick={onLogout} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100">
                        <LogOut className="w-5 h-5" /> Cerrar sesión
                    </button>
                </div>
            </form>
        </div>
    );
}
