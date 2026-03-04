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
import { Activity, Clock, Target, Zap, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomeView({ currentUser, globalLeaderboard, activities, userActivities = [], users, userId, sports, onEditActivity, onDeleteActivity }) {
    const [statsSlide, setStatsSlide] = useState(0); // 0 = calendar, 1 = chart

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calcular puntos del mes actual
    const currentMonthPoints = userActivities.reduce((acc, act) => {
        const d = new Date(act.createdAt);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            return acc + act.points;
        }
        return acc;
    }, 0);

    // Días con actividad este mes (para calendario)
    const daysWithActivity = new Set(
        userActivities
            .filter(act => {
                const d = new Date(act.createdAt);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .map(act => new Date(act.createdAt).getDate())
    );

    // Obtener número de días en el mes actual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Obtener el día de la semana que empieza el mes (1 = Lunes, 7 = Domingo)
    let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    firstDayOfMonth = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;

    // Calcular datos para la gráfica de entrenamientos por mes
    const monthlyWorkouts = {};
    userActivities.forEach(act => {
        const d = new Date(act.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyWorkouts[key] = (monthlyWorkouts[key] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthlyWorkouts).sort().slice(-6); // Mostrar hasta los últimos 6 meses
    const maxWorkouts = Math.max(...sortedMonths.map(m => monthlyWorkouts[m]), 1);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-200 pt-8">

            {/* ── Tarjeta de puntuación del usuario ── */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium">Hola, {currentUser.name}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Zap className="text-yellow-300 w-5 h-5" />
                    </div>
                </div>

                {/* Fila única para tu puntuación y su valor, y debajo puntos del mes */}
                <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-bold text-indigo-100">Puntuación Total</h1>
                        <div className="text-4xl font-black tracking-tight flex items-baseline gap-1">
                            {Math.floor(currentUser.totalPoints)} <span className="text-sm font-medium text-indigo-200">pts</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-indigo-200">Mes Actual</h2>
                        <div className="text-xl font-bold tracking-tight text-white/90 flex items-baseline gap-1">
                            +{Math.floor(currentMonthPoints)} <span className="text-xs font-medium text-indigo-200">pts</span>
                        </div>
                    </div>
                </div>

                {/* Distancia al primer puesto */}
                {globalLeaderboard.length > 0 && currentUser.id !== globalLeaderboard[0].id && (
                    <div className="bg-white/10 rounded-xl p-3 mt-4 flex items-center text-xs">
                        <Target className="w-4 h-4 mr-2 text-indigo-200" />
                        <span>A {Math.floor(globalLeaderboard[0].totalPoints - currentUser.totalPoints)} pts del líder ({globalLeaderboard[0].name})</span>
                    </div>
                )}
            </div>

            {/* ── Tarjeta de Estadísticas (Calendario / Gráfica) ── */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative mb-6 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-bold text-slate-800">
                        {statsSlide === 0 ? 'Calendario Mensual' : 'Entrenamientos por Mes'}
                    </h2>
                    <div className="flex gap-1">
                        <button type="button" onClick={() => setStatsSlide(0)} className={`p-1.5 rounded-full transition-colors ${statsSlide === 0 ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}><ChevronLeft className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setStatsSlide(1)} className={`p-1.5 rounded-full transition-colors ${statsSlide === 1 ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="relative w-full h-[180px]">
                    {/* Slide 0: Calendario */}
                    <div className={`absolute inset-0 transition-all duration-300 ease-in-out ${statsSlide === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                            <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {Array.from({ length: firstDayOfMonth - 1 }).map((_, i) => (
                                <div key={`empty-${i}`} className="w-full aspect-square"></div>
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const hasAct = daysWithActivity.has(day);
                                const isToday = day === now.getDate() && now.getMonth() === currentMonth;
                                return (
                                    <div key={day} className={`w-full aspect-square flex items-center justify-center rounded-lg text-[10px] sm:text-xs font-bold ${hasAct ? 'bg-emerald-500 text-white shadow-sm'
                                        : isToday ? 'border-2 border-indigo-200 text-indigo-600'
                                            : 'bg-slate-50 text-slate-600'
                                        }`}>
                                        {day}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Slide 1: Gráfica de Líneas */}
                    <div className={`absolute inset-0 transition-all duration-300 ease-in-out pt-6 px-4 pb-6 ${statsSlide === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                        {sortedMonths.length === 0 ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <Activity className="w-6 h-6 mb-2 opacity-50 text-indigo-300" />
                                <span className="text-xs font-medium">Aún no hay datos</span>
                            </div>
                        ) : (
                            <div className="w-full h-[90px] relative mt-1">
                                {/* SVG para la línea */}
                                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 overflow-visible z-0">
                                    <polyline
                                        fill="none"
                                        stroke="#818cf8"
                                        strokeWidth="2.5"
                                        vectorEffect="non-scaling-stroke"
                                        points={sortedMonths.map((m, i) => {
                                            const count = monthlyWorkouts[m];
                                            const x = sortedMonths.length > 1 ? (i / (sortedMonths.length - 1)) * 100 : 50;
                                            const y = 100 - ((count / maxWorkouts) * 100);
                                            return `${x},${y}`;
                                        }).join(' ')}
                                    />
                                </svg>

                                {/* Puntos y etiquetas */}
                                <div className="absolute inset-0 flex justify-between z-10 w-full h-full">
                                    {sortedMonths.map((monthKey, i) => {
                                        const count = monthlyWorkouts[monthKey];
                                        const heightPercent = (count / maxWorkouts) * 100;
                                        const dateObj = new Date(monthKey + '-02');
                                        const monthName = dateObj.toLocaleDateString('es-ES', { month: 'short' }).substring(0, 3);

                                        return (
                                            <div key={monthKey} className="relative flex flex-col items-center h-full w-0">
                                                {/* Punto */}
                                                <div
                                                    className="absolute w-3.5 h-3.5 bg-indigo-600 border-2 border-white rounded-full shadow-sm transform -translate-x-1/2 translate-y-1/2"
                                                    style={{ bottom: `${heightPercent}%` }}
                                                />

                                                {/* Valor numérico */}
                                                <div
                                                    className="absolute text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shadow-sm transform -translate-x-1/2 whitespace-nowrap"
                                                    style={{ bottom: `calc(${heightPercent}% + 12px)` }}
                                                >
                                                    {count}
                                                </div>

                                                {/* Etiqueta del mes */}
                                                <span className="absolute -bottom-6 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase transform -translate-x-1/2 whitespace-nowrap">
                                                    {monthName}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
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
