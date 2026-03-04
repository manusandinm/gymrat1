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

export default function HomeView({ currentUser, globalLeaderboard, activities, userActivities = [], users, userId, sports, onEditActivity, onDeleteActivity, onOpenUserProfile }) {
    const [statsSlide, setStatsSlide] = useState(0); // 0 = calendar, 1 = chart
    const [viewDate, setViewDate] = useState(new Date());

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) setStatsSlide(1);
        if (distance < -50) setStatsSlide(0);
    };

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

    const viewMonth = viewDate.getMonth();
    const viewYear = viewDate.getFullYear();

    const daysWithActivity = new Set(
        userActivities
            .filter(act => {
                const d = new Date(act.createdAt);
                return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
            })
            .map(act => new Date(act.createdAt).getDate())
    );

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    let firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    firstDayOfMonth = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;

    const monthlyWorkouts = {};
    userActivities.forEach(act => {
        const d = new Date(act.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyWorkouts[key] = (monthlyWorkouts[key] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthlyWorkouts).sort().slice(-6);
    const maxWorkouts = Math.max(...sortedMonths.map(m => monthlyWorkouts[m]), 1);

    const handlePrevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

    return (
        <div className="space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-200">

            {/* ── Tarjeta Principal (Compacta + Stats Swipeables) ── */}
            <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-3xl pt-5 px-5 pb-4 text-white shadow-lg overflow-hidden relative">

                {/* Cabecera Puntos (Compacta) */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <p className="text-white/70 text-[10px] font-bold uppercase mb-0.5 tracking-wider">Puntuación Total</p>
                        <div className="text-2xl font-black tracking-tight flex items-baseline gap-1">
                            {Math.floor(currentUser.totalPoints)} <span className="text-xs font-medium text-white/50">pts</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white/70 text-[10px] font-bold uppercase mb-0.5 tracking-wider">Mes actual</p>
                        <div className="text-xl font-bold tracking-tight text-emerald-300 flex items-baseline gap-1 justify-end">
                            +{Math.floor(currentMonthPoints)} <span className="text-[10px] font-medium text-emerald-300/70">pts</span>
                        </div>
                    </div>
                </div>

                {/* Contenedor Calendario / Gráfica (Swipeable) */}
                <div
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEndHandler}
                    className="relative w-full h-[255px]"
                >
                    {/* Slide 0: Calendario */}
                    <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col ${statsSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-white/10 transition-colors"><ChevronLeft className="w-5 h-5 text-white/80" /></button>
                            <span className="text-sm font-bold capitalize text-white">{viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                            <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-white/10 transition-colors"><ChevronRight className="w-5 h-5 text-white/80" /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-white/50 mb-1">
                            <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {Array.from({ length: firstDayOfMonth - 1 }).map((_, i) => (
                                <div key={`empty-${i}`} className="w-full aspect-square"></div>
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const hasAct = daysWithActivity.has(day);
                                const isToday = day === actualNow.getDate() && viewMonth === actualCurrentMonth && viewYear === actualCurrentYear;
                                return (
                                    <div key={day} className={`w-full flex items-center justify-center rounded-lg text-xs font-bold aspect-square ${hasAct ? 'bg-white shadow-sm text-indigo-700'
                                        : isToday ? 'border border-white/40 text-white'
                                            : 'text-white/80'
                                        }`}>
                                        {day}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Slide 1: Gráfico */}
                    <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col ${statsSlide === 1 ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
                        <div className="flex justify-between items-center mb-2">
                            <button type="button" onClick={() => setStatsSlide(0)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors"><ChevronLeft className="w-5 h-5 text-white/80" /></button>
                            <span className="text-sm font-bold text-white">Entrenamientos Mensuales</span>
                            <div className="w-8"></div>
                        </div>
                        {sortedMonths.length === 0 ? (
                            <div className="w-full flex-1 flex flex-col items-center justify-center text-white/50">
                                <Activity className="w-6 h-6 mb-2 opacity-50" />
                                <span className="text-xs font-medium">Aún no hay datos</span>
                            </div>
                        ) : (
                            <div className="w-full flex-1 relative">
                                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-4 bottom-5 inset-x-0 overflow-visible z-0">
                                    {/* Area */}
                                    <polygon
                                        fill="rgba(233, 213, 255, 0.25)"
                                        points={`${sortedMonths.length > 1 ? 0 : 50},100 ${sortedMonths.map((m, i) => {
                                            const count = monthlyWorkouts[m];
                                            const x = sortedMonths.length > 1 ? (i / (sortedMonths.length - 1)) * 100 : 50;
                                            const y = 100 - ((count / maxWorkouts) * 100);
                                            return `${x},${y}`;
                                        }).join(' ')} ${sortedMonths.length > 1 ? 100 : 50},100`}
                                    />
                                    {/* Line */}
                                    <polyline
                                        fill="none"
                                        stroke="rgba(255,255,255,0.9)"
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

                                <div className="absolute top-4 bottom-5 inset-x-0 flex justify-between z-10 w-full">
                                    {sortedMonths.map((monthKey, i) => {
                                        const count = monthlyWorkouts[monthKey];
                                        const heightPercent = (count / maxWorkouts) * 100;
                                        const dateObj = new Date(monthKey + '-02');
                                        const monthName = dateObj.toLocaleDateString('es-ES', { month: 'short' }).substring(0, 3);

                                        return (
                                            <div key={monthKey} className="relative flex flex-col items-center h-full w-0">
                                                <div
                                                    className="absolute w-2 h-2 bg-white rounded-full shadow-sm transform -translate-x-1/2 translate-y-1/2"
                                                    style={{ bottom: `${heightPercent}%` }}
                                                />
                                                <div
                                                    className="absolute text-[10px] font-bold text-white transform -translate-x-1/2 whitespace-nowrap"
                                                    style={{ bottom: `calc(${heightPercent}% + 10px)` }}
                                                >
                                                    {count}
                                                </div>
                                                <span className="absolute -bottom-5 text-[9px] sm:text-[10px] font-bold text-white/50 uppercase transform -translate-x-1/2 whitespace-nowrap">
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

                {/* Pagination Dots */}
                <div className="flex justify-center gap-1.5 mt-2">
                    <button onClick={() => setStatsSlide(0)} className={`rounded-full transition-all ${statsSlide === 0 ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'}`} />
                    <button onClick={() => setStatsSlide(1)} className={`rounded-full transition-all ${statsSlide === 1 ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'}`} />
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
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
