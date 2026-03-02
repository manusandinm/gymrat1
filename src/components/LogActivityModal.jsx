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
function calculatePoints(sport, duration, distance, exercises) {
    let pts = 0;
    const baseHourRate = (rate) => rate * (duration / 60);
    const dist = parseFloat(distance) || 0;
    switch (sport.id) {
        case 'running': pts = baseHourRate(20) + (dist * 5); break;
        case 'cycling': pts = baseHourRate(20) + (dist * 2.5); break;
        case 'swimming': pts = baseHourRate(20) + ((dist / 100) * 3); break;
        case 'gym': {
            const totalSets = exercises.reduce((acc, curr) =>
                acc + (curr.type === 'cardio' ? 0 : (parseInt(curr.sets) || 0)), 0);
            pts = baseHourRate(20) + (totalSets * 2);
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
    const [exercises, setExercises] = useState([{ id: 1, name: '', type: 'strength', sets: 3, reps: 10, weight: '' }]);
    const [photo, setPhoto] = useState(null);
    const [routineName, setRoutineName] = useState('');
    const [selectedRoutineId, setSelectedRoutineId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reiniciar campos al cambiar de deporte
    useEffect(() => {
        setDistance('');
        setExercises([{ id: 1, name: '', type: 'strength', sets: 3, reps: 10, weight: '' }]);
        setRoutineName('');
        setSelectedRoutineId('');
    }, [selectedSport]);

    // ─── Gestión de ejercicios ──────────────────────────────────────────
    const addExercise = () => setExercises([...exercises, { id: Date.now(), name: '', type: 'strength', sets: 3, reps: 10, weight: '' }]);
    const addCardioExercise = () => setExercises([...exercises, { id: Date.now(), name: '', type: 'cardio', duration: 10, distance: '' }]);
    const removeExercise = (id) => { if (exercises.length > 1) setExercises(exercises.filter(ex => ex.id !== id)); };
    const updateExercise = (id, field, value) => setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));

    const handleLoadRoutine = (routineId) => {
        setSelectedRoutineId(routineId);
        if (routineId) {
            const routine = savedRoutines.find(r => r.id === routineId);
            if (routine) {
                setExercises(routine.exercises.map(ex => ({ ...ex, id: Date.now() + Math.random(), type: ex.type || 'strength' })));
                setRoutineName(routine.name);
            }
        } else {
            setExercises([{ id: Date.now(), name: '', type: 'strength', sets: 3, reps: 10, weight: '' }]);
            setRoutineName('');
        }
    };

    // ─── Cálculo de detalles para guardar en BD ─────────────────────────
    const buildDetailsText = () => {
        if (selectedSport.id === 'gym') {
            const totalSets = exercises.reduce((acc, curr) => acc + (curr.type === 'cardio' ? 0 : (parseInt(curr.sets) || 0)), 0);
            const strengthExCount = exercises.filter(ex => ex.type !== 'cardio').length;
            const cardioExCount = exercises.filter(ex => ex.type === 'cardio').length;
            let exText = [];
            if (strengthExCount > 0) exText.push(`${strengthExCount} ej (${totalSets} series)`);
            if (cardioExCount > 0) exText.push(`${cardioExCount} cardio`);
            const summaryText = exText.join(', ');
            return routineName.trim() !== ''
                ? `${routineName} (${summaryText})`
                : summaryText.charAt(0).toUpperCase() + summaryText.slice(1);
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
            const points = calculatePoints(selectedSport, duration, distance, exercises);
            await onSubmit({
                sport: selectedSport,
                duration,
                points,
                detailsText: buildDetailsText(),
                photoUrl: photo,
                activityDate,
                exercises,
                routineName
            });
            onClose();
        } catch (err) {
            console.error('Error al guardar actividad:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const points = calculatePoints(selectedSport, duration, distance, exercises);

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

                    {/* Ejercicios de gimnasio */}
                    {selectedSport.id === 'gym' && (
                        <div>
                            {/* Selector de rutina guardada */}
                            {savedRoutines.length > 0 && (
                                <div className="mb-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                    <label className="block text-[10px] font-bold text-indigo-500 mb-1.5 uppercase tracking-wider">Cargar rutina</label>
                                    <select
                                        value={selectedRoutineId}
                                        onChange={e => handleLoadRoutine(e.target.value)}
                                        className="w-full bg-white border border-indigo-100 px-3 py-2.5 rounded-lg text-sm font-bold outline-none cursor-pointer"
                                    >
                                        <option value="">-- Empezar de cero --</option>
                                        {savedRoutines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Nombre de la rutina (para guardarla) */}
                            <div className="mb-4 relative group">
                                <Bookmark className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder='Nombre (Ej: "Día 1 - Pierna")'
                                    value={routineName}
                                    onChange={e => setRoutineName(e.target.value)}
                                    className="w-full bg-white border border-slate-200 pl-10 pr-3 py-2.5 rounded-xl text-sm font-bold outline-none"
                                />
                            </div>

                            {/* Lista de ejercicios */}
                            <div className="space-y-3">
                                {exercises.map(ex => (
                                    <div key={ex.id} className="bg-white border border-slate-200 p-3 rounded-xl relative group">
                                        <input
                                            type="text"
                                            placeholder={ex.type === 'cardio' ? 'Cardio (ej: Cinta)' : 'Nombre (ej: Press Banca)'}
                                            value={ex.name}
                                            onChange={e => updateExercise(ex.id, 'name', e.target.value)}
                                            className="w-full bg-transparent font-semibold outline-none mb-3"
                                            required
                                        />
                                        {ex.type === 'cardio' ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold">Minutos</label>
                                                    <input type="number" min="1" value={ex.duration || 10} onChange={e => updateExercise(ex.id, 'duration', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-bold" required />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold">Distancia (opc.)</label>
                                                    <input type="text" placeholder="Ej: 2km" value={ex.distance || ''} onChange={e => updateExercise(ex.id, 'distance', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-bold" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold">Series</label>
                                                    <input type="number" min="1" value={ex.sets} onChange={e => updateExercise(ex.id, 'sets', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-bold" required />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold">Reps</label>
                                                    <input type="number" min="1" value={ex.reps} onChange={e => updateExercise(ex.id, 'reps', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-bold" required />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 font-bold">Peso</label>
                                                    <input type="number" min="0" placeholder="0" value={ex.weight} onChange={e => updateExercise(ex.id, 'weight', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-bold" />
                                                </div>
                                            </div>
                                        )}
                                        {exercises.length > 1 && (
                                            <button type="button" onClick={() => removeExercise(ex.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1.5 rounded-full">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Botones para añadir ejercicios */}
                            <div className="flex gap-2 mt-3">
                                <button type="button" onClick={addExercise} className="flex-1 border-2 border-dashed border-slate-200 text-slate-500 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                                    <PlusCircle className="w-4 h-4" /> Añadir pesas
                                </button>
                                <button type="button" onClick={addCardioExercise} className="flex-1 border-2 border-dashed border-slate-200 text-slate-500 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                                    <Activity className="w-4 h-4" /> Añadir cardio
                                </button>
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
                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
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
