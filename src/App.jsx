import React, { useState, useEffect } from 'react';
import { Home, Trophy, PlusCircle, Activity, Award, User, Clock, ChevronRight, Zap, Target, Users, Trash2, Bookmark, Camera, X, LogOut, Settings, Image, Save, Pencil } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';

const SPORTS = [
  { id: 'running', name: 'Correr', icon: '🏃‍♂️', color: 'bg-blue-500', unit: 'km', step: 0.1 },
  { id: 'gym', name: 'Gimnasio', icon: '🏋️‍♀️', color: 'bg-purple-500', unit: 'ejercicios', step: 1 },
  { id: 'cycling', name: 'Ciclismo', icon: '🚴', color: 'bg-emerald-500', unit: 'km', step: 1 },
  { id: 'swimming', name: 'Natación', icon: '🏊‍♂️', color: 'bg-cyan-500', unit: 'm', step: 50 },
  { id: 'playbacks', name: 'Playbacks', icon: '💃', color: 'bg-pink-500' },
  { id: 'rugby', name: 'Rugby', icon: '🏉', color: 'bg-orange-500' },
];

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();

  const getDefaultDate = () => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
  };

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [leagues, setLeagues] = useState([]);

  // Estados perfil
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');

  // Estados para el modal de registro
  const [showLogModal, setShowLogModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSport, setSelectedSport] = useState(SPORTS[0]);
  const [duration, setDuration] = useState(45);
  const [activityDate, setActivityDate] = useState(getDefaultDate());

  const [distance, setDistance] = useState('');
  const [exercises, setExercises] = useState([{ id: 1, name: '', sets: 3, reps: 10, weight: '' }]);
  const [photo, setPhoto] = useState(null);

  // Estados para rutinas de gimnasio
  const [savedRoutines, setSavedRoutines] = useState([]);
  const [routineName, setRoutineName] = useState('');
  const [selectedRoutineId, setSelectedRoutineId] = useState('');

  // Estado para la liga seleccionada
  const [activeLeagueId, setActiveLeagueId] = useState('');

  // Estados para editar actividad
  const [editingActivity, setEditingActivity] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDuration, setEditDuration] = useState(45);
  const [editDetails, setEditDetails] = useState('');
  const [editPhoto, setEditPhoto] = useState(null);
  const [editDate, setEditDate] = useState(getDefaultDate());

  // Estados para crear/unirse a nueva liga
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);
  const [leagueModalTab, setLeagueModalTab] = useState('join');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showEditLeagueModal, setShowEditLeagueModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeaguePrize, setNewLeaguePrize] = useState('');
  const [newLeagueEndDate, setNewLeagueEndDate] = useState('');
  const [newLeagueIsPublic, setNewLeagueIsPublic] = useState(false);
  const [newLeagueDescription, setNewLeagueDescription] = useState('');
  const [newLeaguePunishment, setNewLeaguePunishment] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Obtener perfiles
      const { data: profilesData } = await supabase.from('profiles').select('*');

      // 2. Obtener ligas y sus miembros
      const { data: leaguesData } = await supabase.from('leagues').select('*');
      const { data: membersData } = await supabase.from('league_members').select('*');

      const formattedLeagues = [
        {
          id: 'global',
          name: 'RANKING GLOBAL',
          code: 'GLOBAL',
          endDate: 'Siempre',
          prize: 'Honor y Gloria',
          isPublic: true
        },
        ...(leaguesData || [])
          .filter(l => !l.name.toLowerCase().includes('prueba'))
          .map(l => {
            const d = new Date(l.end_date);
            return {
              id: l.id,
              name: l.name,
              code: l.code,
              description: l.description || '',
              rawEndDate: l.end_date,
              endDate: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
              prize: l.prize,
              punishment: l.punishment || '',
              isPublic: l.is_public || false
            };
          })
      ];
      setLeagues(formattedLeagues);

      const combinedUsers = (profilesData || []).map(p => {
        const uData = {
          id: p.id,
          name: p.name,
          avatar: p.avatar || '😎',
          bio: p.bio || '¡A darlo todo!',
          weight: p.weight || 0,
          height: p.height || 0,
          totalPoints: p.total_points || 0,
          leaguePoints: {}
        };
        uData.leaguePoints['global'] = p.total_points || 0;
        const userMemberships = (membersData || []).filter(m => m.user_id === p.id);
        userMemberships.forEach(m => {
          uData.leaguePoints[m.league_id] = m.points;
        });
        return uData;
      });
      setUsers(combinedUsers);

      const currentUserData = combinedUsers.find(u => u.id === user.id);
      const myLeaguesDb = formattedLeagues.filter(l => currentUserData?.leaguePoints[l.id] !== undefined);
      if (myLeaguesDb.length > 0 && (!activeLeagueId || !myLeaguesDb.find(l => l.id === activeLeagueId))) {
        setActiveLeagueId(myLeaguesDb[0].id);
      } else if (myLeaguesDb.length === 0) {
        setActiveLeagueId('');
      }

      // 3. Obtener actividades de todos
      const { data: actsData } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(20);
      const formattedActs = (actsData || []).map(a => {
        const d = new Date(a.created_at);
        return {
          id: a.id,
          userId: a.user_id,
          sportId: a.sport_id,
          duration: a.duration,
          points: a.points,
          date: d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: a.created_at,
          details: a.details,
          photo: a.photo_url
        };
      });
      setActivities(formattedActs);

      // 4. Obtener rutinas de este usuario
      const { data: routinesData } = await supabase.from('routines').select('*').eq('user_id', user.id);
      const formattedRoutines = (routinesData || []).map(r => ({
        id: r.id,
        name: r.name,
        exercises: typeof r.exercises === 'string' ? JSON.parse(r.exercises) : r.exercises
      }));
      setSavedRoutines(formattedRoutines);

    } catch (err) {
      console.error("Error loading data:", err);
    }
    setIsLoadingData(false);
  };

  const currentUser = users.find(u => u.id === user?.id) || { name: user?.user_metadata?.full_name || 'Tú', avatar: '😎', bio: '¡A darlo todo!', weight: 0, height: 0, totalPoints: 0, leaguePoints: {} };
  const globalLeaderboard = [...users].sort((a, b) => b.totalPoints - a.totalPoints);

  const openProfileView = () => {
    setEditName(currentUser.name);
    setEditAvatar(currentUser.avatar);
    setEditBio(currentUser.bio || '');
    setEditWeight(currentUser.weight || '');
    setEditHeight(currentUser.height || '');
    setShowProfileModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await supabase.from('profiles').update({
      name: editName,
      avatar: editAvatar || '😎',
      bio: editBio,
      weight: parseFloat(editWeight) || 0,
      height: parseInt(editHeight) || 0
    }).eq('id', user.id);
    setShowProfileModal(false);
    await loadData();
  };

  useEffect(() => {
    setDistance('');
    setExercises([{ id: 1, name: '', sets: 3, reps: 10, weight: '' }]);
    setRoutineName('');
    setSelectedRoutineId('');
    if (!showLogModal) setActivityDate(getDefaultDate());
  }, [selectedSport, showLogModal]);

  const calculatePoints = () => {
    let pts = 0;
    const dist = parseFloat(distance) || 0;
    switch (selectedSport.id) {
      case 'running': pts = dist * 10; break;
      case 'cycling': pts = dist * 4; break;
      case 'swimming': pts = (dist / 100) * 5; break;
      case 'gym':
        const totalSets = exercises.reduce((acc, curr) => acc + (parseInt(curr.sets) || 0), 0);
        pts = (duration * 1) + (totalSets * 2);
        break;
      case 'playbacks': pts = duration * 0.5; break;
      case 'rugby': pts = duration * 0.8; break;
      default: pts = 0;
    }
    return Math.floor(pts);
  };

  const addExercise = () => setExercises([...exercises, { id: Date.now(), name: '', sets: 3, reps: 10, weight: '' }]);
  const removeExercise = (id) => { if (exercises.length > 1) setExercises(exercises.filter(ex => ex.id !== id)); };
  const updateExercise = (id, field, value) => setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));

  const handleLoadRoutine = (routineId) => {
    setSelectedRoutineId(routineId);
    if (routineId) {
      const routine = savedRoutines.find(r => r.id === routineId);
      if (routine) {
        setExercises(routine.exercises.map(ex => ({ ...ex, id: Date.now() + Math.random() })));
        setRoutineName(routine.name);
      }
    } else {
      setExercises([{ id: Date.now(), name: '', sets: 3, reps: 10, weight: '' }]);
      setRoutineName('');
    }
  };

  const handleLogActivity = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const pointsEarned = calculatePoints();

      let detailsText = '';
      if (selectedSport.id === 'gym') {
        const totalSets = exercises.reduce((acc, curr) => acc + (parseInt(curr.sets) || 0), 0);
        detailsText = routineName.trim() !== ''
          ? `${routineName} (${exercises.length} ej, ${totalSets} series)`
          : `${exercises.length} ejercicios, ${totalSets} series`;

        // Guardar o Actualizar Rutina en Supabase
        if (routineName.trim() !== '') {
          const existing = savedRoutines.find(r => r.name.toLowerCase() === routineName.trim().toLowerCase());
          if (existing) {
            await supabase.from('routines').update({ exercises }).eq('id', existing.id);
          } else {
            await supabase.from('routines').insert({ user_id: user.id, name: routineName.trim(), exercises });
          }
        }
      } else if (selectedSport.unit) {
        detailsText = `${distance} ${selectedSport.unit}`;
      } else {
        detailsText = `${duration} minutos`;
      }

      let photoUrl = null;
      if (photo) {
        // En una app real aqui subiriamos la imagen al Storage bucket. Queda como null en base de datos de pruebas o guardamos base64
        // por simplicidad si no es muy grande. Pero supabase storage seria lo ideal.
        // Guardaremos base64 por brevedad si es pequeño, sino petará la BD. 
        photoUrl = photo;
      }

      // Insertar actividad
      await supabase.from('activities').insert({
        user_id: user.id,
        sport_id: selectedSport.id,
        duration: duration,
        points: pointsEarned,
        details: detailsText,
        photo_url: photoUrl,
        created_at: new Date(activityDate).toISOString()
      });

      // Actualizar puntos de Perfil (usamos la logica segura via supabase JS)
      await supabase.from('profiles').update({ total_points: currentUser.totalPoints + pointsEarned }).eq('id', user.id);

      // Actualizar puntos en Ligas actuales
      const userLeagues = Object.keys(currentUser.leaguePoints);
      for (const lId of userLeagues) {
        if (lId === 'global') continue;
        await supabase.from('league_members')
          .update({ points: currentUser.leaguePoints[lId] + pointsEarned })
          .match({ user_id: user.id, league_id: lId });
      }

      setShowLogModal(false);
      setPhoto(null);
      await loadData();
    } catch (err) {
      console.error("Error logging activity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditActivity = (act) => {
    setEditingActivity(act);
    setEditDuration(act.duration);
    setEditDetails(act.details);
    setEditPhoto(act.photo);

    const d = new Date(act.createdAt);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    setEditDate(localISOTime);

    setShowEditModal(true);
  };

  const saveEditedActivity = async (e) => {
    e.preventDefault();
    if (!editingActivity) return;

    await supabase.from('activities').update({
      duration: editDuration,
      details: editDetails,
      photo_url: editPhoto,
      created_at: new Date(editDate).toISOString()
    }).eq('id', editingActivity.id);

    setShowEditModal(false);
    setEditingActivity(null);
    await loadData();
  };

  const handleDeleteActivity = async (act) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta actividad? Se restarán los puntos obtenidos.")) return;

    // Eliminar de base de datos
    await supabase.from('activities').delete().eq('id', act.id);

    // Restar puntos perfil
    const pointsToSubtract = act.points;
    await supabase.from('profiles').update({ total_points: currentUser.totalPoints - pointsToSubtract }).eq('id', user.id);

    // Restar puntos Ligas
    const userLeagues = Object.keys(currentUser.leaguePoints);
    for (const lId of userLeagues) {
      if (lId === 'global') continue;
      if (currentUser.leaguePoints[lId]) {
        await supabase.from('league_members')
          .update({ points: currentUser.leaguePoints[lId] - pointsToSubtract })
          .match({ user_id: user.id, league_id: lId });
      }
    }

    await loadData();
  };

  const handleCreateLeague = async (e) => {
    e.preventDefault();
    const newCode = (newLeagueName.substring(0, 3).toUpperCase() || 'FIT') + Math.floor(Math.random() * 1000);

    const { data: newLeague, error } = await supabase.from('leagues').insert({
      name: newLeagueName,
      code: newCode,
      description: newLeagueDescription,
      punishment: newLeaguePunishment,
      end_date: newLeagueEndDate,
      prize: newLeaguePrize,
      is_public: newLeagueIsPublic
    }).select().single();

    if (error) {
      console.error("Error al crear liga:", error);
      alert("Error al crear la liga. Asegúrate de haber actualizado la base de datos (Supabase). Detalle: " + error.message);
      return;
    }

    if (!error && newLeague) {
      // Auto join the creator
      await supabase.from('league_members').insert({
        league_id: newLeague.id,
        user_id: user.id,
        points: 0
      });
      setActiveLeagueId(newLeague.id);
      setShowCreateLeagueModal(false);
      setNewLeagueName(''); setNewLeaguePrize(''); setNewLeagueEndDate(''); setNewLeagueIsPublic(false); setNewLeagueDescription(''); setNewLeaguePunishment('');
      await loadData();
    }
  };

  const handleJoinPublicLeague = async (leagueId) => {
    const { error } = await supabase.from('league_members').insert({
      league_id: leagueId,
      user_id: user.id,
      points: 0
    });
    if (!error) {
      setActiveLeagueId(leagueId);
      setShowCreateLeagueModal(false);
      await loadData();
    }
  };

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    setJoinError('');

    const leagueToJoin = leagues.find(l => l.code.toUpperCase() === joinCode.toUpperCase().trim());

    if (!leagueToJoin) {
      setJoinError('No se ha encontrado ninguna liga con este código.');
      return;
    }

    if (currentUser.leaguePoints[leagueToJoin.id] !== undefined) {
      setJoinError('Ya estás participando en esta liga.');
      return;
    }

    const { error } = await supabase.from('league_members').insert({
      league_id: leagueToJoin.id,
      user_id: user.id,
      points: 0
    });

    if (error) {
      setJoinError('Error al unirse.');
    } else {
      setActiveLeagueId(leagueToJoin.id);
      setShowCreateLeagueModal(false);
      setJoinCode('');
      await loadData();
    }
  };

  const openEditLeague = () => {
    const lg = leagues.find(l => l.id === activeLeagueId);
    if (!lg) return;
    setNewLeagueName(lg.name);
    setNewLeaguePrize(lg.prize);
    setNewLeagueEndDate(lg.rawEndDate || '');
    setNewLeagueIsPublic(lg.isPublic);
    setNewLeagueDescription(lg.description || '');
    setNewLeaguePunishment(lg.punishment || '');
    setShowEditLeagueModal(true);
  };

  const handleUpdateLeague = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('leagues').update({
      name: newLeagueName,
      description: newLeagueDescription,
      punishment: newLeaguePunishment,
      end_date: newLeagueEndDate,
      prize: newLeaguePrize,
      is_public: newLeagueIsPublic
    }).eq('id', activeLeagueId);

    if (error) {
      alert("Error al actualizar la liga: " + error.message);
      return;
    }
    setShowEditLeagueModal(false);
    await loadData();
  };

  const handleDeleteLeague = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar esta liga de forma definitiva? Esta acción es irreversible y eliminará todos los puntos de todos los participantes dentro de ella.")) return;
    const { error } = await supabase.from('leagues').delete().eq('id', activeLeagueId);
    if (!error) {
      setShowEditLeagueModal(false);
      setActiveLeagueId('');
      await loadData();
    } else {
      alert("Error al eliminar la liga: " + error.message);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-indigo-600 font-bold">Cargando GymRat...</div></div>;
  if (!user) return <Auth />;

  const HomeView = () => (
    <div className="space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-200 pt-8">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-indigo-100 text-sm font-medium">Hola, {currentUser.name}</p>
            <h1 className="text-2xl font-bold">Tu Puntuación</h1>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <Zap className="text-yellow-300 w-6 h-6" />
          </div>
        </div>
        <div className="text-5xl font-black mb-2 tracking-tight">
          {Math.floor(currentUser.totalPoints)} <span className="text-xl font-medium text-indigo-200">pts</span>
        </div>
        {globalLeaderboard.length > 0 && currentUser.id !== globalLeaderboard[0].id && (
          <div className="bg-white/10 rounded-xl p-3 mt-4 flex items-center text-sm">
            <Target className="w-4 h-4 mr-2 text-indigo-200" />
            <span>A {Math.floor(globalLeaderboard[0].totalPoints - currentUser.totalPoints)} pts del líder ({globalLeaderboard[0].name})</span>
          </div>
        )}
      </div>

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
              const sport = SPORTS.find(s => s.id === act.sportId) || SPORTS[0];
              return (
                <div key={act.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
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
                      <div className="text-emerald-500 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm">
                        +{Math.floor(act.points)}
                      </div>
                      {act.userId === user.id && (
                        <div className="flex gap-2">
                          <button onClick={() => handleEditActivity(act)} className="text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 p-2 rounded-full border border-slate-100 shadow-sm"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteActivity(act)} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-full border border-slate-100 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                  {act.photo && (
                    <div className="mt-1 rounded-xl overflow-hidden border border-slate-100 relative max-h-48">
                      <img src={act.photo} alt="Prueba de entrenamiento" className="w-full h-full object-cover" />
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

  const LeagueView = () => {
    const myLeagues = leagues.filter(l => currentUser.leaguePoints[l.id] !== undefined);
    const activeLeague = myLeagues.find(l => l.id === activeLeagueId) || myLeagues[0];

    if (!activeLeague) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 mt-10">
          <Trophy className="w-16 h-16 text-slate-300" />
          <p className="text-center font-medium">Aún no estás en ninguna liga.</p>
          <button onClick={() => { setShowCreateLeagueModal(true); setLeagueModalTab('join'); }} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl mt-4">Unirse o Crear Liga</button>
        </div>
      );
    }

    const leagueLeaderboard = users
      .filter(u => u.leaguePoints[activeLeagueId] !== undefined)
      .sort((a, b) => b.leaguePoints[activeLeagueId] - a.leaguePoints[activeLeagueId]);

    return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-200">
        <div className="flex gap-2">
          <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center overflow-hidden flex-1">
            <select
              value={activeLeague?.id || ''}
              onChange={(e) => setActiveLeagueId(e.target.value)}
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
          <button onClick={() => { setShowCreateLeagueModal(true); setLeagueModalTab('join'); setJoinError(''); }} className="bg-indigo-600 text-white px-5 py-4 rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-bold text-sm flex-shrink-0">
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Nueva Liga</span>
            <span className="inline sm:hidden">Liga</span>
          </button>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -right-10 -top-10 opacity-10"><Trophy className="w-48 h-48" /></div>
          <div className="flex justify-between items-start">
            <span className="bg-indigo-500 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">{activeLeague.isPublic ? 'Pública' : 'Privada'}</span>
            <span className="text-xs font-mono text-slate-400 bg-white/10 px-2 py-1 rounded-md">Cód: {activeLeague.code}</span>
          </div>
          <div className="flex justify-between items-center mt-3 mb-1">
            <h1 className="text-2xl font-black">{activeLeague.name}</h1>
            {activeLeague.id !== 'global' && (
              <button onClick={openEditLeague} className="text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-2"><Users className="w-4 h-4" /> {leagueLeaderboard.length} Participantes</p>

          {activeLeague.description && (
            <div className="mt-4 bg-white/5 p-3 text-sm text-slate-300 rounded-xl border border-white/10 italic">
              <p className="line-clamp-2 truncate">{activeLeague.description}</p>
              <button onClick={() => setShowDescriptionModal(true)} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded mt-2 font-bold transition-colors">Ver reglas completas</button>
            </div>
          )}

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

        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
            Clasificación
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              Termina el {activeLeague.endDate}
            </span>
          </h2>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {leagueLeaderboard.length === 0 && <p className="p-4 text-center text-slate-500">Aún no hay participantes en esta liga.</p>}
            {leagueLeaderboard.map((u, index) => (
              <div key={u.id} className={`flex items-center p-4 ${index !== leagueLeaderboard.length - 1 ? 'border-b border-slate-50' : ''} ${u.id === user.id ? 'bg-indigo-50/50' : ''}`}>
                <div className="w-8 font-black text-slate-300 text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}</div>
                <div className="text-2xl mr-3 bg-slate-100 w-10 h-10 flex items-center justify-center rounded-full overflow-hidden flex-shrink-0">
                  {(u.avatar && (u.avatar.startsWith('data:image') || u.avatar.startsWith('http'))) ? (
                    <img src={u.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    u.avatar || '😎'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${u.id === user.id ? 'text-indigo-700' : 'text-slate-800'}`}>{u.name} {u.id === user.id && '(Tú)'}</p>
                  {u.bio && <p className="text-xs text-slate-500 font-medium mt-0.5 truncate pr-2">{u.bio}</p>}
                </div>
                <div className="font-black text-slate-800 text-lg">{Math.floor(u.leaguePoints[activeLeagueId])} <span className="text-xs font-normal text-slate-500">pts</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        {/* Top left Logo */}
        <div className="absolute top-6 left-6 z-40">
          <span className="text-2xl font-black text-indigo-600 tracking-tighter">GYMRAT</span>
        </div>

        {/* Top right Profile Button */}
        <div className="absolute top-4 right-4 z-40">
          <button onClick={openProfileView} className="bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-full shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <span className="text-xs font-bold pl-3 text-slate-600 hidden sm:inline-block">Perfil</span>
            <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-inner">
              {(currentUser.avatar.startsWith('data:image') || currentUser.avatar.startsWith('http')) ? (
                <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                currentUser.avatar
              )}
            </div>
          </button>
        </div>

        <main className="flex-1 p-6 overflow-y-auto pt-20">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'league' && <LeagueView />}
        </main>

        {showDescriptionModal && activeLeagueId && leagues.find(l => l.id === activeLeagueId) && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl shadow-xl w-full max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-full duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                <h2 className="text-xl font-bold text-slate-800">Reglas de la Liga</h2>
                <button onClick={() => setShowDescriptionModal(false)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-2 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{leagues.find(l => l.id === activeLeagueId).description}</p>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 pb-8">
                <button onClick={() => setShowDescriptionModal(false)} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">Entendido</button>
              </div>
            </div>
          </div>
        )}

        {showEditLeagueModal && activeLeagueId && leagues.find(l => l.id === activeLeagueId) && (
          <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center rounded-b-3xl shadow-lg">
              <h2 className="text-xl font-bold">Editar Liga</h2>
              <button onClick={() => setShowEditLeagueModal(false)} className="text-slate-300 hover:text-white bg-white/10 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 flex-1 flex flex-col overflow-y-auto">
              <form onSubmit={handleUpdateLeague} className="flex flex-col gap-6 flex-1">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la liga</label>
                  <input type="text" required value={newLeagueName} onChange={(e) => setNewLeagueName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Descripción o Reglas (Opcional)</label>
                  <textarea placeholder="Ej: Puntos dobles los domingos..." value={newLeagueDescription} onChange={(e) => setNewLeagueDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-medium outline-none text-sm min-h-[80px]" />
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
                    <input type="text" required value={newLeaguePrize} onChange={(e) => setNewLeaguePrize(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Castigo (Opcional)</label>
                    <input type="text" placeholder="Ej: Paga la cena" value={newLeaguePunishment} onChange={(e) => setNewLeaguePunishment(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Fecha de fin</label>
                    <input type="date" required value={newLeagueEndDate} onChange={(e) => setNewLeagueEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-slate-100">
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">Guardar Cambios</button>
                  <button type="button" onClick={handleDeleteLeague} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-red-100">
                    <Trash2 className="w-5 h-5" /> Eliminar Liga
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCreateLeagueModal && (
          <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center rounded-b-3xl shadow-lg">
              <h2 className="text-xl font-bold">Ligas</h2>
              <button onClick={() => setShowCreateLeagueModal(false)} className="text-slate-300 hover:text-white bg-white/10 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 flex-1 flex flex-col overflow-y-auto">
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6 flex-shrink-0">
                <button type="button" onClick={() => { setLeagueModalTab('join'); setJoinError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg ${leagueModalTab === 'join' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Unirse con código</button>
                <button type="button" onClick={() => { setLeagueModalTab('create'); setJoinError(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg ${leagueModalTab === 'create' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Crear nueva</button>
              </div>

              {leagueModalTab === 'join' ? (
                <div className="flex flex-col gap-6 flex-1">
                  <form onSubmit={handleJoinLeague} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Código de Liga Privada</label>
                      <div className="flex gap-2">
                        <input type="text" required placeholder="Ej: INVIERNO26" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none uppercase" />
                        <button type="submit" disabled={!joinCode.trim()} className="bg-indigo-600 px-6 text-white font-bold rounded-xl shadow-lg disabled:opacity-50">Unirse</button>
                      </div>
                      {joinError && <p className="text-red-500 text-xs font-bold mt-2">{joinError}</p>}
                    </div>
                  </form>

                  <div className="mt-4 border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Ligas Públicas Disponibles</h3>
                    <div className="space-y-3">
                      {leagues.filter(l => l.isPublic && currentUser.leaguePoints[l.id] === undefined).length === 0 && (
                        <p className="text-xs text-slate-500 italic">No hay ligas públicas disponibles o ya estás en todas.</p>
                      )}
                      {leagues.filter(l => l.isPublic && currentUser.leaguePoints[l.id] === undefined).map(pubLeague => (
                        <div key={pubLeague.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-slate-800">{pubLeague.name}</p>
                            <p className="text-xs text-slate-500">Premio: {pubLeague.prize}</p>
                          </div>
                          <button onClick={() => handleJoinPublicLeague(pubLeague.id)} className="bg-indigo-50 text-indigo-600 font-bold px-4 py-2 rounded-lg text-xs hover:bg-indigo-100">
                            Unirme
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateLeague} className="flex flex-col gap-6 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la liga</label>
                    <input type="text" required value={newLeagueName} onChange={(e) => setNewLeagueName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Descripción o Reglas (Opcional)</label>
                    <textarea placeholder="Ej: Puntos dobles los domingos..." value={newLeagueDescription} onChange={(e) => setNewLeagueDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-medium outline-none text-sm min-h-[80px]" />
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
                      <input type="text" required value={newLeaguePrize} onChange={(e) => setNewLeaguePrize(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Castigo (Opcional)</label>
                      <input type="text" placeholder="Ej: Paga la cena" value={newLeaguePunishment} onChange={(e) => setNewLeaguePunishment(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Fecha de fin</label>
                      <input type="date" required value={newLeagueEndDate} onChange={(e) => setNewLeagueEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full mt-auto bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">Crear Liga</button>
                </form>
              )}
            </div>
          </div>
        )}

        {showLogModal && (
          <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center rounded-b-3xl shadow-lg">
              <h2 className="text-xl font-bold">Registrar Entrenamiento</h2>
              <button onClick={() => setShowLogModal(false)} className="bg-white/10 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleLogActivity} className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">¿Qué deporte has hecho?</label>
                <div className="grid grid-cols-2 gap-3">
                  {SPORTS.map(sport => (
                    <button key={sport.id} type="button" onClick={() => setSelectedSport(sport)} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 ${selectedSport.id === sport.id ? `border-${sport.color.split('-')[1]}-500 bg-${sport.color.split('-')[1]}-50` : 'border-slate-100 bg-white'}`}>
                      <span className="text-3xl">{sport.icon}</span><span className="font-semibold text-sm">{sport.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Fecha y Hora</label>
                  <input type="datetime-local" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} required className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Duración (Minutos)</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="10" max="180" step="5" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="flex-1 accent-indigo-600" />
                    <div className="w-16 text-center font-black text-lg text-indigo-600 bg-indigo-100 py-1 rounded-lg">{duration}'</div>
                  </div>
                </div>

                {selectedSport.id !== 'gym' && selectedSport.unit && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">Distancia ({selectedSport.unit})</label>
                    <input type="number" step={selectedSport.step} min="0" required value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold" />
                  </div>
                )}

                {selectedSport.id === 'gym' && (
                  <div>
                    {savedRoutines.length > 0 && (
                      <div className="mb-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                        <label className="block text-[10px] font-bold text-indigo-500 mb-1.5 uppercase tracking-wider">Cargar rutina</label>
                        <select value={selectedRoutineId} onChange={(e) => handleLoadRoutine(e.target.value)} className="w-full bg-white border border-indigo-100 px-3 py-2.5 rounded-lg text-sm font-bold outline-none cursor-pointer">
                          <option value="">-- Empezar de cero --</option>
                          {savedRoutines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="mb-4 relative group">
                      <Bookmark className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder='Nombre (Ej: "Día 1 - Pierna")' value={routineName} onChange={(e) => setRoutineName(e.target.value)} className="w-full bg-white border border-slate-200 pl-10 pr-3 py-2.5 rounded-xl text-sm font-bold outline-none" />
                    </div>

                    <div className="space-y-3">
                      {exercises.map((ex) => (
                        <div key={ex.id} className="bg-white border border-slate-200 p-3 rounded-xl relative group">
                          <input type="text" placeholder="Nombre (ej: Press Banca)" value={ex.name} onChange={(e) => updateExercise(ex.id, 'name', e.target.value)} className="w-full bg-transparent font-semibold outline-none mb-3" required />
                          <div className="grid grid-cols-3 gap-2">
                            <div><label className="text-[10px] text-slate-400 font-bold">Series</label><input type="number" min="1" value={ex.sets} onChange={(e) => updateExercise(ex.id, 'sets', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-bold" required /></div>
                            <div><label className="text-[10px] text-slate-400 font-bold">Reps</label><input type="number" min="1" value={ex.reps} onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-bold" required /></div>
                            <div><label className="text-[10px] text-slate-400 font-bold">Peso</label><input type="number" min="0" placeholder="0" value={ex.weight} onChange={(e) => updateExercise(ex.id, 'weight', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-center font-bold" /></div>
                          </div>
                          {exercises.length > 1 && <button type="button" onClick={() => removeExercise(ex.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1.5 rounded-full"><Trash2 className="w-3 h-3" /></button>}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addExercise} className="mt-3 w-full border-2 border-dashed border-slate-200 text-slate-500 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"><PlusCircle className="w-4 h-4" /> Añadir ejercicio</button>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Foto (Opcional)</label>
                {!photo ? (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-white">
                    <Camera className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-500">Subir foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = (event) => {
                        const img = new window.Image();
                        img.src = event.target.result;
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_WIDTH = 800;
                          const MAX_HEIGHT = 800;
                          let width = img.width;
                          let height = img.height;

                          if (width > height) {
                            if (width > MAX_WIDTH) {
                              height *= MAX_WIDTH / width;
                              width = MAX_WIDTH;
                            }
                          } else {
                            if (height > MAX_HEIGHT) {
                              width *= MAX_HEIGHT / height;
                              height = MAX_HEIGHT;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, width, height);
                          const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality JPEG
                          setPhoto(dataUrl);
                        };
                      };
                    }} />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden h-40">
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-slate-900/60 p-1.5 rounded-full text-white"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-sm text-emerald-700 font-semibold mb-1">Puntos a ganar</p>
                </div>
                <div className="text-3xl font-black text-emerald-600">+{calculatePoints()}</div>
              </div>

              <button type="submit" disabled={calculatePoints() === 0 || isSubmitting} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50">
                {isSubmitting ? 'Guardando...' : 'Guardar Actividad'}
              </button>
            </form>
          </div>
        )}

        {showProfileModal && (
          <div className="absolute inset-0 z-50 bg-slate-50 animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-lg">
              <h2 className="text-xl font-bold">Editar Perfil</h2>
              <button onClick={() => setShowProfileModal(false)} className="bg-white/10 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-indigo-100 flex items-center justify-center text-4xl">
                  {(editAvatar.startsWith('data:image') || editAvatar.startsWith('http')) ? (
                    <img src={editAvatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    editAvatar
                  )}
                </div>
                <label className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full cursor-pointer hover:bg-indigo-100 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> <span>Cambiar Foto</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = (event) => {
                      const img = new window.Image();
                      img.src = event.target.result;
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 400; // Profile pics can be smaller
                        const MAX_HEIGHT = 400;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                          if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                          }
                        } else {
                          if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                          }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                        setEditAvatar(dataUrl);
                      };
                    };
                  }} />
                </label>
              </div>

              {/* Datos Personales */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bio / Frase Motivadora</label>
                  <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="¡A darlo todo!" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Altura (cm)</label>
                    <input type="number" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-bold outline-none" />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-auto space-y-3 pt-6">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Guardar Cambios
                </button>
                <div className="h-px bg-slate-200 my-4 line"></div>
                <button type="button" onClick={logout} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100">
                  <LogOut className="w-5 h-5" /> Cerrar sesión
                </button>
              </div>
            </form>
          </div>
        )}

        {showEditModal && editingActivity && (
          <div className="absolute inset-0 z-50 bg-white animate-in slide-in-from-bottom-full duration-300 flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center rounded-b-3xl shadow-lg">
              <h2 className="text-xl font-bold">Editar Actividad</h2>
              <button onClick={() => setShowEditModal(false)} className="bg-white/10 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={saveEditedActivity} className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Fecha y Hora</label>
                  <input type="datetime-local" value={editDate} onChange={(e) => setEditDate(e.target.value)} required className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Duración (Minutos)</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min="10" max="180" step="5" value={editDuration} onChange={(e) => setEditDuration(parseInt(e.target.value))} className="flex-1 accent-indigo-600" />
                    <div className="w-16 text-center font-black text-lg text-indigo-600 bg-indigo-100 py-1 rounded-lg">{editDuration}'</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Detalles / Notas</label>
                  <input type="text" value={editDetails} onChange={(e) => setEditDetails(e.target.value)} className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold" />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Foto</label>
                {!editPhoto ? (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-white">
                    <Camera className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-500">Subir foto nueva</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = (event) => {
                        const img = new window.Image();
                        img.src = event.target.result;
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const MAX_WIDTH = 800; // Profile pics can be smaller
                          const MAX_HEIGHT = 800;
                          let width = img.width;
                          let height = img.height;

                          if (width > height) {
                            if (width > MAX_WIDTH) {
                              height *= MAX_WIDTH / width;
                              width = MAX_WIDTH;
                            }
                          } else {
                            if (height > MAX_HEIGHT) {
                              width *= MAX_HEIGHT / height;
                              height = MAX_HEIGHT;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, width, height);
                          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                          setEditPhoto(dataUrl);
                        };
                      };
                    }} />
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden h-40">
                    <img src={editPhoto} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setEditPhoto(null)} className="absolute top-2 right-2 bg-slate-900/60 p-1.5 rounded-full text-white"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg mt-auto">Guardar Cambios</button>
            </form>
          </div>
        )}

        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-100 flex justify-between px-6 py-4 pb-6 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-24 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-indigo-100' : ''}`} /><span className="text-[10px] font-bold text-center">Inicio</span>
          </button>
          <button onClick={() => setShowLogModal(true)} className="flex flex-col items-center gap-1 w-24 text-slate-400 hover:text-indigo-600">
            <PlusCircle className="w-6 h-6" /><span className="text-[10px] font-bold text-center px-1">Actividad</span>
          </button>
          <button onClick={() => setActiveTab('league')} className={`flex flex-col items-center gap-1 w-24 ${activeTab === 'league' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Trophy className={`w-6 h-6 ${activeTab === 'league' ? 'fill-indigo-100' : ''}`} /><span className="text-[10px] font-bold text-center">Liga</span>
          </button>
        </nav>

      </div>
    </div>
  );
}