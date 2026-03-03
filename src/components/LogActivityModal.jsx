/**
 * components/LogActivityModal.jsx
 *
 * Modal de pantalla completa para registrar una nueva actividad deportiva.
 *
 * Responsabilidades:
 *  - Selección del deporte.
 *  - Configuración de duración, fecha y distancia (si aplica).
 *  - Para el gimnasio: lista de ejercicios de fuerza y cardio, y gestión de rutinas guardadas.
 *  - Subida y previsualización de foto (comprimida en el cliente).
 *  - Cálculo en tiempo real de los puntos a obtener.
 *  - Envío del formulario mediante la función `onSubmit` recibida por props.
 *
 * Props:
 *  - sports {Array} - Lista de deportes disponibles.
 *  - savedRoutines {Array} - Rutinas previamente guardadas del usuario.
 *  - onSubmit {Function(data)} - Llamado al guardar. Recibe el objeto con todos los datos.
 *  - onClose {Function} - Cierra el modal sin guardar.
 */
import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Trash2, Camera, Activity, Bookmark } from 'lucide-react';
import { resizeImage } from '../utils/imageUtils';

// ─── Lógica de puntos ────────────────────────────────────────────────────────
/**
 * Calcula los puntos que se obtendrán según el deporte, la duración,
 * la distancia y los ejercicios registrados.
 */
function calculatePoints(sport, duration, distance, exercises, gymIntensity = 'media') {
    let pts = 0;
    const baseHourRate = (rate) => rate * (duration / 60);
    const dist = parseFloat(distance) || 0;
    switch (sport.id) {
        case 'running': pts = baseHourRate(20) + (dist * 5); break;
        case 'cycling': pts = baseHourRate(20) + (dist * 2.5); break;
        case 'swimming': pts = baseHourRate(20) + ((dist / 100) * 3); break;
        case 'gym': {
            const intensityMultiplier = gymIntensity === 'baja' ? 1.5 : gymIntensity === 'media' ? 2 : 2.5;
            pts = baseHourRate(20 * intensityMultiplier);
            break;
        }
        case 'playbacks': pts = baseHourRate(30); break;
        case 'rugby': pts = baseHourRate(40); break;
        case 'b3b': pts = baseHourRate(60); break;
        case 'esquí': pts = baseHourRate(5) + (dist * 1.5); break;
        case 'pádel': pts = baseHourRate(40); break;
        default: pts = 0;
    }
    return Math.floor(pts);
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function LogActivityModal({ sports, savedRoutines, onSubmit, onClose }) {
    const getDefaultDate = () => {
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        return (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
    };

    const [selectedSport, setSelectedSport] = useState(sports[0]);
    const [duration, setDuration] = useState(45);
    const [activityDate, setActivityDate] = useState(getDefaultDate());
    const [distance, setDistance] = useState('');
    const [exercises, setExercises] = useState([]);
    const [gymTrainingName, setGymTrainingName] = useState('');
    const [gymIntensity, setGymIntensity] = useState('media');
    const [photo, setPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setDistance('');
        setExercises([]);
        setGymTrainingName('');
        setGymIntensity('media');
    }, [selectedSport]);

    // ─── Cálculo de detalles para guardar en BD ─────────────────────────
    const buildDetailsText = () => {
        if (selectedSport.id === 'gym') {
            return `${gymTrainingName || 'Entrenamiento de gimnasio'} (Intensidad ${gymIntensity})`;
        }
        if (selectedSport.unit) return `${distance} ${selectedSport.unit}`;
        return `${duration} minutos`;
    };

    // ─── Envío del formulario ────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const points = calculatePoints(selectedSport, duration, distance, exercises, gymIntensity);
            await onSubmit({
                sport: selectedSport,
                duration,
                points,
                detailsText: buildDetailsText(),
                photoUrl: photo,
                activityDate,
                gymTrainingName,
                gymIntensity
            });
            onClose();
        } catch (err) {
            console.error('Error al guardar actividad:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const points = calculatePoints(selectedSport, duration, distance, exercises, gymIntensity);

    return (
        <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            {/* ── Cabecera ── */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center rounded-b-3xl shadow-lg">
                <h2 className="text-xl font-bold">Registrar Entrenamiento</h2>
                <button onClick={onClose} className="bg-white/10 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">

                {/* ── Selector de deporte ── */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">¿Qué deporte has hecho?</label>
                    <div className="grid grid-cols-2 gap-3">
                        {sports.map(sport => (
                            <button
                                key={sport.id}
                                type="button"
                                onClick={() => setSelectedSport(sport)}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 ${selectedSport.id === sport.id
                                    ? `border-${sport.color.split('-')[1]}-500 bg-${sport.color.split('-')[1]}-50`
                                    : 'border-slate-100 bg-white'
                                    }`}
                            >
                                <span className="text-3xl">{sport.icon}</span>
                                <span className="font-semibold text-sm">{sport.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Fecha, duración y distancia ── */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    {/* Fecha */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            value={activityDate}
                            onChange={e => setActivityDate(e.target.value)}
                            required
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold"
                        />
                    </div>

                    {/* Duración con botones +/- */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Duración (Minutos)</label>
                        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-2">
                            <button type="button" onClick={() => setDuration(Math.max(1, duration - 5))}
                                className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors active:scale-95">
                                <span className="text-2xl font-black">-</span>
                            </button>
                            <div className="text-center">
                                <span className="text-3xl font-black text-slate-800">{duration}</span>
                                <span className="text-sm font-bold text-slate-400 ml-1">min</span>
                            </div>
                            <button type="button" onClick={() => setDuration(duration + 5)}
                                className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors active:scale-95">
                                <span className="text-2xl font-black">+</span>
                            </button>
                        </div>
                    </div>

                    {/* Distancia (solo si el deporte la requiere y no es gimnasio) */}
                    {selectedSport.id !== 'gym' && selectedSport.unit && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Distancia ({selectedSport.unit})</label>
                            <input
                                type="number"
                                step={selectedSport.step}
                                min="0"
                                required
                                value={distance}
                                onChange={e => setDistance(e.target.value)}
                                className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold"
                            />
                        </div>
                    )}

                    {/* Detalles de gimnasio */}
                    {selectedSport.id === 'gym' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Nombre del entrenamiento</label>
                                <input
                                    type="text"
                                    placeholder='Ej: "Upper Body", "Pierna", etc.'
                                    value={gymTrainingName}
                                    onChange={e => setGymTrainingName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2">Intensidad</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['baja', 'media', 'alta'].map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setGymIntensity(level)}
                                            className={`p-3 rounded-xl border-2 text-sm font-bold capitalize transition-colors ${gymIntensity === level
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-slate-100 bg-white text-slate-500'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Foto opcional ── */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Foto (Opcional)</label>
                    {!photo ? (
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-white">
                            <Camera className="w-6 h-6 text-slate-400 mb-1" />
                            <span className="text-xs font-semibold text-slate-500">Subir foto</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) setPhoto(await resizeImage(file, 800, 800));
                                }}
                            />
                        </label>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden h-40">
                            <img src={photo} alt="Preview" className="w-full h-full object-cover object-center" />
                            <button type="button" onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-slate-900/60 p-1.5 rounded-full text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Puntos a ganar ── */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                    <p className="text-sm text-emerald-700 font-semibold">Puntos a ganar</p>
                    <div className="text-3xl font-black text-emerald-600">+{points}</div>
                </div>

                {/* ── Botón guardar ── */}
                <button
                    type="submit"
                    disabled={points === 0 || isSubmitting}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50"
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar Actividad'}
                </button>
            </form>
        </div>
    );
}
