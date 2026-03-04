import React, { useState } from 'react';
import { X, Clock, Activity, Medal, Settings, ChevronLeft, ChevronRight, Flame } from 'lucide-react';

export default function PublicProfileModal({ user, currentUser, users, activities, sports, onClose, onEditProfile, onToggleReaction }) {
    const [statsSlide, setStatsSlide] = useState(0); // 0 = calendar, 1 = chart
    const [viewDate, setViewDate] = useState(new Date());

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    if (!user) return null;

    const isCurrentUser = currentUser && user.id === currentUser.id;
    const userActivities = activities.filter(act => act.userId === user.id);

    // --- Graph Logic ---
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
        <div className="absolute inset-0 z-[60] bg-slate-50 animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            {/* ── Cabecera ── */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start shadow-lg relative overflow-hidden pb-12">
                <div className="absolute -right-10 -top-10 opacity-5"><Activity className="w-64 h-64" /></div>

                <div className="flex gap-4 items-center z-10">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-700 bg-indigo-100 flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
                        {(user.avatar && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http'))) ? (
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover object-center" />
                        ) : (
                            user.avatar || '😎'
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">{user.name}</h2>
                        {user.bio && <p className="text-slate-300 text-sm font-medium mt-1 italic">{user.bio}</p>}
                    </div>
                </div>

                <div className="flex gap-2 z-10 flex-shrink-0">
                    {isCurrentUser && (
                        <button onClick={onEditProfile} className="bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-full">
                            <Settings className="w-6 h-6" />
                        </button>
                    )}
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 transition-colors p-2 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* ── Estadísticas Rápidas ── */}
            <div className="flex justify-around bg-white border-b border-slate-100 py-4 shadow-sm z-10 relative -mt-6 mx-4 rounded-2xl">
                <div className="text-center px-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pts</p>
                    <p className="text-xl font-black text-indigo-700">{Math.floor(user.totalPoints || 0)}</p>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div className="text-center px-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Actividades</p>
                    <p className="text-xl font-black text-slate-800">{userActivities.length}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                {/* ── Gráficos Swipeables ── */}
                <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-lg relative mx-6 mt-2 mb-2">
                    <div
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEndHandler}
                        className="relative w-full h-[320px]"
                    >
                        {/* Slide 0: Calendario */}
                        <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col ${statsSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
                            <div className="flex flex-col mb-4">
                                <span className="text-sm font-bold text-white uppercase tracking-wider text-center mb-4">Días de Actividad</span>
                                <div className="flex justify-between items-center">
                                    <button type="button" onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-white/10 transition-colors bg-white/5"><ChevronLeft className="w-5 h-5 text-white/80" /></button>
                                    <span className="text-sm font-bold capitalize text-white">{viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                                    <button type="button" onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-white/10 transition-colors bg-white/5"><ChevronRight className="w-5 h-5 text-white/80" /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-white/50 mb-2">
                                <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1.5 text-center flex-1 pb-2">
                                {Array.from({ length: firstDayOfMonth - 1 }).map((_, i) => (
                                    <div key={`empty-${i}`} className="w-full aspect-square"></div>
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const hasAct = daysWithActivity.has(day);
                                    const isToday = day === actualNow.getDate() && viewMonth === actualCurrentMonth && viewYear === actualCurrentYear;
                                    return (
                                        <div key={day} className={`w-full flex items-center justify-center rounded-xl text-xs font-bold aspect-square shadow-sm ${hasAct ? 'bg-white text-indigo-700'
                                            : isToday ? 'border border-white/40 text-white'
                                                : 'text-white/80 bg-white/5'
                                            }`}>
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Slide 1: Gráfico */}
                        <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col ${statsSlide === 1 ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
                            <div className="flex flex-col mb-4">
                                <span className="text-sm font-bold text-white uppercase tracking-wider text-center mb-4">Histórico de Meses</span>
                                <div className="flex justify-between items-center">
                                    <button type="button" onClick={() => setStatsSlide(0)} className="p-1.5 rounded-full hover:bg-white/10 transition-colors bg-white/5"><ChevronLeft className="w-5 h-5 text-white/80" /></button>
                                    <span className="text-sm font-bold text-white/0 select-none">-</span>
                                    <div className="w-8"></div>
                                </div>
                            </div>
                            {sortedMonths.length === 0 ? (
                                <div className="w-full flex-1 flex flex-col items-center justify-center text-white/50">
                                    <Activity className="w-6 h-6 mb-2 opacity-50" />
                                    <span className="text-xs font-medium">Aún no hay datos</span>
                                </div>
                            ) : (
                                <div className="w-full flex-1 relative">
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-4 bottom-5 inset-x-0 overflow-visible z-0">
                                        <polygon
                                            fill="rgba(233, 213, 255, 0.25)"
                                            points={`${sortedMonths.length > 1 ? 0 : 50},100 ${sortedMonths.map((m, i) => {
                                                const count = monthlyWorkouts[m];
                                                const x = sortedMonths.length > 1 ? (i / (sortedMonths.length - 1)) * 100 : 50;
                                                const y = 100 - ((count / maxWorkouts) * 100);
                                                return `${x},${y}`;
                                            }).join(' ')} ${sortedMonths.length > 1 ? 100 : 50},100`}
                                        />
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
                                                    <div className="absolute w-2 h-2 bg-white rounded-full shadow-sm transform -translate-x-1/2 translate-y-1/2" style={{ bottom: `${heightPercent}%` }} />
                                                    <div className="absolute text-[10px] font-bold text-white transform -translate-x-1/2 whitespace-nowrap" style={{ bottom: `calc(${heightPercent}% + 10px)` }}>{count}</div>
                                                    <span className="absolute -bottom-5 text-[9px] sm:text-[10px] font-bold text-white/50 uppercase transform -translate-x-1/2 whitespace-nowrap">{monthName}</span>
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

                {/* ── Feed de Actividades del Usuario ── */}
                <div className="px-6 space-y-4 pb-12">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 mt-2">
                        <Medal className="w-5 h-5 text-indigo-500" /> Historial de {user.name}
                    </h3>

                    {userActivities.length === 0 ? (
                        <div className="bg-white p-6 rounded-3xl text-center border border-slate-100 shadow-sm">
                            <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">Aún no tiene actividades registradas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {userActivities.map(act => {
                                const sport = sports.find(s => s.id === act.sportId) || sports[0];
                                return (
                                    <div key={act.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full ${sport.color} flex items-center justify-center text-xl shadow-inner text-white flex-shrink-0`}>
                                                    {sport.icon}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{sport.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">{act.details}</p>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                        <Clock className="w-3 h-3" /> {act.duration} min • {act.date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-emerald-500 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm shadow-sm">
                                                    +{Math.floor(act.points)}
                                                </div>
                                            </div>
                                        </div>
                                        {act.photo && (
                                            <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 relative max-h-48">
                                                <img src={act.photo} alt="Prueba" className="w-full h-full object-cover object-center" />
                                            </div>
                                        )}

                                        {/* Area de reacciones */}
                                        <div className="flex gap-2 items-center mt-2 pt-3 border-t border-slate-50">
                                            <button
                                                onClick={() => onToggleReaction && onToggleReaction(act.id, '🔥')}
                                                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${act.reactions && currentUser && act.reactions[currentUser.id] === '🔥' ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                            >
                                                <Flame className={`w-4 h-4 ${act.reactions && currentUser && act.reactions[currentUser.id] === '🔥' ? 'fill-orange-500 text-orange-500' : ''}`} />
                                                {Object.keys(act.reactions || {}).length > 0 && <span>{Object.keys(act.reactions).length}</span>}
                                            </button>
                                            {Object.keys(act.reactions || {}).length > 0 && users && (
                                                <div className="flex -space-x-1.5 overflow-hidden">
                                                    {Object.keys(act.reactions).slice(0, 3).map(rUserId => {
                                                        const rUser = users.find(u => u.id === rUserId);
                                                        if (!rUser) return null;
                                                        return (
                                                            <div key={rUserId} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] overflow-hidden shadow-sm" title={rUser.name}>
                                                                {rUser.avatar?.startsWith('http') || rUser.avatar?.startsWith('data:') ? <img src={rUser.avatar} className="w-full h-full object-cover" /> : rUser.avatar || '😎'}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
