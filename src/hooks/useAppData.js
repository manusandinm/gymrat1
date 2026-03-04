/**
 * hooks/useAppData.js
 *
 * Hook personalizado que centraliza TODA la lógica de estado y las
 * operaciones de base de datos (Supabase) de la aplicación GymRat.
 *
 * Responsabilidades:
 *  - Cargar perfiles de usuario, ligas y actividades desde Supabase.
 *  - Exponer funciones para registrar, editar y eliminar actividades.
 *  - Exponer funciones para crear, unirse, editar y eliminar ligas.
 *  - Gestionar el estado del perfil del usuario actual.
 *  - Gestionar el estado del onboarding.
 *
 * Al separar la lógica del estado aquí, el componente App.jsx
 * queda limpio y solo se preocupa de la navegación y el renderizado.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAppData(user) {
    // ─── Estado de datos ──────────────────────────────────────────────────────
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [userActivities, setUserActivities] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [activeLeagueId, setActiveLeagueId] = useState('');
    const [savedRoutines, setSavedRoutines] = useState([]);

    // ─── Estado del perfil ────────────────────────────────────────────────────
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editWeight, setEditWeight] = useState('');
    const [editHeight, setEditHeight] = useState('');

    // ─── Estado de ligas (formularios compartidos) ────────────────────────────
    const [newLeagueName, setNewLeagueName] = useState('');
    const [newLeaguePrize, setNewLeaguePrize] = useState('');
    const [newLeagueEndDate, setNewLeagueEndDate] = useState('');
    const [newLeagueIsPublic, setNewLeagueIsPublic] = useState(false);
    const [newLeagueDescription, setNewLeagueDescription] = useState('');
    const [newLeaguePunishment, setNewLeaguePunishment] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');

    // ─── Estado del onboarding ────────────────────────────────────────────────
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(1);

    // ─── Usuario actual calculado ─────────────────────────────────────────────
    const currentUser = users.find(u => u.id === user?.id) || {
        name: user?.user_metadata?.full_name || 'Tú',
        avatar: '😎',
        bio: '¡A darlo todo!',
        weight: 0,
        height: 0,
        totalPoints: 0,
        leaguePoints: {}
    };

    const globalLeaderboard = [...users].sort((a, b) => b.totalPoints - a.totalPoints);

    // ─── Carga inicial de datos al hacer login ────────────────────────────────
    useEffect(() => {
        if (user) {
            loadData().then(() => {
                const hasSeen = localStorage.getItem(`onboardingCompleted_${user.id}`);
                if (!hasSeen) {
                    setShowOnboarding(true);
                }
            });
        }
    }, [user]);

    // ─── Función principal de carga de datos ─────────────────────────────────
    /**
     * loadData: carga todos los datos necesarios desde Supabase de una sola vez.
     * Incluye: perfiles, ligas, miembros de ligas, actividades y rutinas.
     * Se llama al inicio y después de cualquier mutación de datos.
     */
    const loadData = async () => {
        setIsLoadingData(true);
        try {
            // 1. Perfiles de usuarios
            const { data: profilesData } = await supabase.from('profiles').select('*');

            // 2. Ligas y sus miembros
            const { data: leaguesData } = await supabase.from('leagues').select('*');
            const { data: membersData } = await supabase.from('league_members').select('*');

            // Formateamos las ligas añadiendo la global hardcodeada
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

            // Combinamos perfiles con puntos de ligas
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
                (membersData || []).filter(m => m.user_id === p.id).forEach(m => {
                    uData.leaguePoints[m.league_id] = m.points;
                });
                return uData;
            });
            setUsers(combinedUsers);

            // Seleccionamos la liga activa por defecto si no hay ninguna seleccionada
            const currentUserData = combinedUsers.find(u => u.id === user.id);
            const myLeagues = formattedLeagues.filter(l => currentUserData?.leaguePoints[l.id] !== undefined);
            if (myLeagues.length > 0 && (!activeLeagueId || !myLeagues.find(l => l.id === activeLeagueId))) {
                setActiveLeagueId(myLeagues[0].id);
            } else if (myLeagues.length === 0) {
                setActiveLeagueId('');
            }

            // 3. Actividades recientes (últimas 20 de todos los usuarios)
            const { data: actsData } = await supabase
                .from('activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

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

            // 3.5. Todas las actividades del usuario actual para estadísticas
            const { data: userActsData } = await supabase
                .from('activities')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            const formattedUserActs = (userActsData || []).map(a => {
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
            setUserActivities(formattedUserActs);

            // 4. Rutinas guardadas del usuario actual
            const { data: routinesData } = await supabase.from('routines').select('*').eq('user_id', user.id);
            const formattedRoutines = (routinesData || []).map(r => ({
                id: r.id,
                name: r.name,
                exercises: typeof r.exercises === 'string' ? JSON.parse(r.exercises) : r.exercises
            }));
            setSavedRoutines(formattedRoutines);

        } catch (err) {
            console.error('Error loading data:', err);
        }
        setIsLoadingData(false);
    };

    // ─── Perfil ───────────────────────────────────────────────────────────────

    /** Rellena los campos del formulario de perfil con los datos actuales. */
    const openProfileEdit = () => {
        setEditName(currentUser.name);
        setEditAvatar(currentUser.avatar);
        setEditBio(currentUser.bio || '');
        setEditWeight(currentUser.weight || '');
        setEditHeight(currentUser.height || '');
    };

    /** Guarda los cambios del perfil en Supabase. */
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        await supabase.from('profiles').update({
            name: editName,
            avatar: editAvatar || '😎',
            bio: editBio,
            weight: parseFloat(editWeight) || 0,
            height: parseInt(editHeight) || 0
        }).eq('id', user.id);
        await loadData();
    };

    // ─── Actividades ──────────────────────────────────────────────────────────

    /**
     * Registra una nueva actividad en la base de datos.
     * También actualiza los puntos del perfil y de cada liga del usuario.
     *
     * @param {Object} params - Datos de la actividad a registrar.
     */
    const handleLogActivity = async ({ sport, duration, points, detailsText, photoUrl, activityDate }) => {

        // Insertar actividad
        await supabase.from('activities').insert({
            user_id: user.id,
            sport_id: sport.id,
            duration,
            points,
            details: detailsText,
            photo_url: photoUrl,
            created_at: new Date(activityDate).toISOString()
        });

        // Sumar puntos al perfil global
        await supabase.from('profiles')
            .update({ total_points: currentUser.totalPoints + points })
            .eq('id', user.id);

        // Sumar puntos en cada liga en la que participa
        for (const lId of Object.keys(currentUser.leaguePoints)) {
            if (lId === 'global') continue;
            await supabase.from('league_members')
                .update({ points: currentUser.leaguePoints[lId] + points })
                .match({ user_id: user.id, league_id: lId });
        }

        await loadData();
    };

    /**
     * Actualiza los datos de una actividad existente (duración, detalles, foto, fecha).
     * No modifica los puntos, solo los metadatos.
     */
    const saveEditedActivity = async ({ id, duration, details, photo, date }) => {
        await supabase.from('activities').update({
            duration,
            details,
            photo_url: photo,
            created_at: new Date(date).toISOString()
        }).eq('id', id);
        await loadData();
    };

    /**
     * Elimina una actividad y resta sus puntos al perfil y ligas del usuario.
     */
    const handleDeleteActivity = async (act) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta actividad? Se restarán los puntos obtenidos.')) return;

        await supabase.from('activities').delete().eq('id', act.id);
        await supabase.from('profiles')
            .update({ total_points: currentUser.totalPoints - act.points })
            .eq('id', user.id);

        for (const lId of Object.keys(currentUser.leaguePoints)) {
            if (lId === 'global') continue;
            if (currentUser.leaguePoints[lId]) {
                await supabase.from('league_members')
                    .update({ points: currentUser.leaguePoints[lId] - act.points })
                    .match({ user_id: user.id, league_id: lId });
            }
        }

        await loadData();
    };

    // ─── Ligas ────────────────────────────────────────────────────────────────

    /**
     * Rellena el formulario de edición con los datos de la liga activa.
     * Devuelve true si encontró la liga, false si no.
     */
    const openEditLeague = () => {
        const lg = leagues.find(l => l.id === activeLeagueId);
        if (!lg) return false;
        setNewLeagueName(lg.name);
        setNewLeaguePrize(lg.prize);
        setNewLeagueEndDate(lg.rawEndDate || '');
        setNewLeagueIsPublic(lg.isPublic);
        setNewLeagueDescription(lg.description || '');
        setNewLeaguePunishment(lg.punishment || '');
        return true;
    };

    /** Crea una nueva liga y auto-une al creador como primer miembro. */
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
            alert('Error al crear la liga: ' + error.message);
            return null;
        }

        await supabase.from('league_members').insert({ league_id: newLeague.id, user_id: user.id, points: 0 });
        setActiveLeagueId(newLeague.id);
        resetLeagueForm();
        await loadData();
        return newLeague;
    };

    /** Une al usuario actual a una liga pública por su ID. */
    const handleJoinPublicLeague = async (leagueId) => {
        const { error } = await supabase.from('league_members').insert({ league_id: leagueId, user_id: user.id, points: 0 });
        if (!error) {
            setActiveLeagueId(leagueId);
            await loadData();
            return true;
        }
        return false;
    };

    /** Une al usuario actual a una liga privada usando un código. */
    const handleJoinLeague = async (e) => {
        e.preventDefault();
        setJoinError('');
        const leagueToJoin = leagues.find(l => l.code.toUpperCase() === joinCode.toUpperCase().trim());

        if (!leagueToJoin) { setJoinError('No se ha encontrado ninguna liga con este código.'); return null; }
        if (currentUser.leaguePoints[leagueToJoin.id] !== undefined) { setJoinError('Ya estás participando en esta liga.'); return null; }

        const { error } = await supabase.from('league_members').insert({ league_id: leagueToJoin.id, user_id: user.id, points: 0 });
        if (error) {
            setJoinError('Error al unirse.');
            return null;
        }

        setActiveLeagueId(leagueToJoin.id);
        setJoinCode('');
        await loadData();
        return leagueToJoin;
    };

    /** Guarda los cambios de edición de la liga activa. */
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

        if (error) { alert('Error al actualizar la liga: ' + error.message); return false; }
        await loadData();
        return true;
    };

    /** Elimina permanentemente la liga activa y todos sus datos. */
    const handleDeleteLeague = async () => {
        if (!window.confirm('¿Seguro que quieres eliminar esta liga de forma definitiva? Esta acción es irreversible.')) return false;
        const { error } = await supabase.from('leagues').delete().eq('id', activeLeagueId);
        if (!error) {
            setActiveLeagueId('');
            await loadData();
            return true;
        }
        alert('Error al eliminar la liga: ' + error.message);
        return false;
    };

    /** Limpia el formulario de liga después de crear/unirse. */
    const resetLeagueForm = () => {
        setNewLeagueName('');
        setNewLeaguePrize('');
        setNewLeagueEndDate('');
        setNewLeagueIsPublic(false);
        setNewLeagueDescription('');
        setNewLeaguePunishment('');
    };

    // ─── Onboarding ───────────────────────────────────────────────────────────

    /** Marca el onboarding como completado para este usuario y lo oculta. */
    const skipOnboarding = () => {
        localStorage.setItem(`onboardingCompleted_${user.id}`, 'true');
        setShowOnboarding(false);
    };

    // ─── Retorno del hook ─────────────────────────────────────────────────────
    return {
        // Datos
        isLoadingData, users, activities, userActivities, leagues, savedRoutines,
        currentUser, globalLeaderboard,

        // Liga activa
        activeLeagueId, setActiveLeagueId,

        // Perfil
        editName, setEditName,
        editAvatar, setEditAvatar,
        editBio, setEditBio,
        editWeight, setEditWeight,
        editHeight, setEditHeight,
        openProfileEdit, handleSaveProfile,

        // Actividades
        handleLogActivity, saveEditedActivity, handleDeleteActivity,

        // Ligas – formulario compartido
        newLeagueName, setNewLeagueName,
        newLeaguePrize, setNewLeaguePrize,
        newLeagueEndDate, setNewLeagueEndDate,
        newLeagueIsPublic, setNewLeagueIsPublic,
        newLeagueDescription, setNewLeagueDescription,
        newLeaguePunishment, setNewLeaguePunishment,
        joinCode, setJoinCode,
        joinError, setJoinError,

        openEditLeague,
        handleCreateLeague, handleJoinPublicLeague, handleJoinLeague,
        handleUpdateLeague, handleDeleteLeague,
        resetLeagueForm,

        // Onboarding
        showOnboarding, onboardingStep, setOnboardingStep, skipOnboarding,
    };
}
