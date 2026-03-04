/**
 * App.jsx
 *
 * Componente raíz de GymRat. Actúa como ORQUESTADOR: conecta el estado
 * global (del hook useAppData) con los componentes de UI.
 *
 * Responsabilidades de este archivo:
 *  - Gestionar la navegación entre pestañas (home / league).
 *  - Controlar qué modales están abiertos (estado visual local).
 *  - Pasar los datos y callbacks correctos a cada componente hijo.
 *
 * Lo que NO hace este archivo:
 *  - Llamadas a Supabase (eso está en hooks/useAppData.js).
 *  - Lógica de puntos (eso está en components/LogActivityModal.jsx).
 *  - Renderizado de formularios complejos (eso está en cada componente).
 *
 * Estructura de carpetas del proyecto:
 *  src/
 *   ├── constants/sports.js          → Lista de deportes
 *   ├── hooks/useAppData.js          → Estado y lógica de negocio
 *   ├── utils/imageUtils.js          → Redimensionado de imágenes
 *   ├── contexts/AuthContext.jsx     → Contexto de autenticación
 *   ├── lib/supabase.js              → Cliente Supabase
 *   └── components/
 *        ├── Auth.jsx                → Pantalla de login
 *        ├── HomeView.jsx            → Pestaña "Inicio"
 *        ├── LeagueView.jsx          → Pestaña "Liga"
 *        ├── LogActivityModal.jsx    → Modal registrar actividad
 *        ├── EditActivityModal.jsx   → Modal editar actividad
 *        ├── ProfileModal.jsx        → Modal perfil
 *        ├── LeagueModals.jsx        → Modales de gestión de ligas
 *        └── OnboardingFlow.jsx      → Flujo de bienvenida
 */
import React, { useState } from 'react';
import { Home, Trophy, PlusCircle } from 'lucide-react';

// Autenticación
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';

// Hook central de estado y datos
import { useAppData } from './hooks/useAppData';

// Constantes
import { SPORTS } from './constants/sports';

// Vistas principales
import HomeView from './components/HomeView';
import LeagueView from './components/LeagueView';

// Modales
import LogActivityModal from './components/LogActivityModal';
import EditActivityModal from './components/EditActivityModal';
import ProfileModal from './components/ProfileModal';
import OnboardingFlow from './components/OnboardingFlow';
import {
  LeagueDescriptionModal,
  EditLeagueModal,
  CreateOrJoinLeagueModal,
} from './components/LeagueModals';
import PublicProfileModal from './components/PublicProfileModal';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();

  // ─── Estado local de navegación y modales ──────────────────────────────────
  // Estos estados solo controlan QUÉ se muestra en pantalla, no los datos.
  const [activeTab, setActiveTab] = useState('home');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);
  const [showEditLeagueModal, setShowEditLeagueModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [leagueModalTab, setLeagueModalTab] = useState('join');
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  // Actividad actualmente en edición
  const [editingActivity, setEditingActivity] = useState(null);

  // ─── Datos y lógica de negocio (Supabase) ─────────────────────────────────
  const data = useAppData(user);

  // ─── Pantallas de carga y autenticación ───────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-indigo-600 font-bold">Cargando GymRat...</div>
      </div>
    );
  }
  if (!user) return <Auth />;

  // ─── Handlers que conectan UI con lógica ──────────────────────────────────

  /** Abre el modal de perfil precargando los datos actuales. */
  const openProfileView = () => {
    setSelectedUserProfile(data.currentUser);
  };

  /** Guarda perfil y cierra el modal. */
  const handleSaveProfile = async (e) => {
    await data.handleSaveProfile(e);
    setShowProfileModal(false);
  };

  /** Abre el modal de edición de la liga activa. */
  const openEditLeague = () => {
    const ok = data.openEditLeague();
    if (ok) setShowEditLeagueModal(true);
  };

  /** Abre el modal de crear/unirse, con la pestaña indicada. */
  const openCreateLeagueModal = (tab = 'join') => {
    setLeagueModalTab(tab);
    data.setJoinError('');
    setShowCreateLeagueModal(true);
  };

  /** Inicia la edición de una actividad. */
  const handleEditActivity = (act) => {
    setEditingActivity(act);
  };

  /** Guarda actividad editada y cierra. */
  const handleSaveEditedActivity = async (actData) => {
    await data.saveEditedActivity(actData);
    setEditingActivity(null);
  };

  /** Handler de unirse a liga durante onboarding o modal normal. */
  const handleJoinLeague = async (e) => {
    const result = await data.handleJoinLeague(e);
    if (result) {
      if (data.showOnboarding) {
        data.setOnboardingStep('view_league');
        setActiveTab('league');
      } else {
        setShowCreateLeagueModal(false);
      }
    }
  };

  /** Handler de unirse a liga pública. */
  const handleJoinPublicLeague = async (leagueId) => {
    const ok = await data.handleJoinPublicLeague(leagueId);
    if (ok) {
      if (data.showOnboarding) {
        data.setOnboardingStep('view_league');
        setActiveTab('league');
      } else {
        setShowCreateLeagueModal(false);
      }
    }
  };

  /** Handler de crear liga (onboarding o modal normal). */
  const handleCreateLeague = async (e) => {
    const newLeague = await data.handleCreateLeague(e);
    if (newLeague) {
      if (data.showOnboarding) {
        data.setOnboardingStep('view_league');
        setActiveTab('league');
      } else {
        setShowCreateLeagueModal(false);
      }
    }
  };

  /** Guarda edición de liga y cierra modal. */
  const handleUpdateLeague = async (e) => {
    const ok = await data.handleUpdateLeague(e);
    if (ok) setShowEditLeagueModal(false);
  };

  /** Elimina la liga activa y cierra modal. */
  const handleDeleteLeague = async () => {
    const ok = await data.handleDeleteLeague();
    if (ok) setShowEditLeagueModal(false);
  };

  // Ligas públicas en las que el usuario aún no está (para el modal de unirse)
  const publicLeaguesAvailable = data.leagues.filter(
    l => l.isPublic && data.currentUser.leaguePoints[l.id] === undefined
  );

  // Descripción de la liga activa (para el modal de reglas)
  const activeLeagueDescription = data.leagues.find(l => l.id === data.activeLeagueId)?.description || '';

  // ─── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">

        {/* ── Logo superior izquierdo ── */}
        <div className="absolute top-6 left-6 z-40">
          <span className="text-2xl font-black text-indigo-600 tracking-tighter">GYMRAT</span>
        </div>

        {/* ── Botón de perfil (avatar) superior derecho ── */}
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={openProfileView}
            className="bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-full shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs font-bold pl-3 text-slate-600 hidden sm:inline-block">Perfil</span>
            <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-inner">
              {(data.currentUser.avatar.startsWith('data:image') || data.currentUser.avatar.startsWith('http')) ? (
                <img src={data.currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                data.currentUser.avatar
              )}
            </div>
          </button>
        </div>

        {/* ── Contenido principal según pestaña activa ── */}
        <main className="flex-1 p-6 overflow-y-auto pt-20">
          {activeTab === 'home' && (
            <HomeView
              currentUser={data.currentUser}
              globalLeaderboard={data.globalLeaderboard}
              activities={data.activities}
              userActivities={data.userActivities}
              users={data.users}
              userId={user.id}
              sports={SPORTS}
              onEditActivity={handleEditActivity}
              onDeleteActivity={data.handleDeleteActivity}
              onOpenUserProfile={setSelectedUserProfile}
              leagues={data.leagues}
              activeLeagueId={data.activeLeagueId}
            />
          )}
          {activeTab === 'league' && (
            <LeagueView
              currentUser={data.currentUser}
              users={data.users}
              leagues={data.leagues}
              activeLeagueId={data.activeLeagueId}
              setActiveLeagueId={data.setActiveLeagueId}
              userId={user.id}
              onOpenCreateModal={openCreateLeagueModal}
              onOpenEditLeague={openEditLeague}
              onOpenDescription={() => setShowDescriptionModal(true)}
              onOpenUserProfile={setSelectedUserProfile}
            />
          )}
        </main>

        {/* ── Modal: reglas completas de la liga ── */}
        {showDescriptionModal && activeLeagueDescription && (
          <LeagueDescriptionModal
            description={activeLeagueDescription}
            onClose={() => setShowDescriptionModal(false)}
          />
        )}

        {/* ── Modal: editar liga ── */}
        {showEditLeagueModal && (
          <EditLeagueModal
            newLeagueName={data.newLeagueName} setNewLeagueName={data.setNewLeagueName}
            newLeagueDescription={data.newLeagueDescription} setNewLeagueDescription={data.setNewLeagueDescription}
            newLeaguePunishment={data.newLeaguePunishment} setNewLeaguePunishment={data.setNewLeaguePunishment}
            newLeagueEndDate={data.newLeagueEndDate} setNewLeagueEndDate={data.setNewLeagueEndDate}
            newLeaguePrize={data.newLeaguePrize} setNewLeaguePrize={data.setNewLeaguePrize}
            newLeagueIsPublic={data.newLeagueIsPublic} setNewLeagueIsPublic={data.setNewLeagueIsPublic}
            onSave={handleUpdateLeague}
            onDelete={handleDeleteLeague}
            onClose={() => setShowEditLeagueModal(false)}
          />
        )}

        {/* ── Modal: crear / unirse a liga ── */}
        {showCreateLeagueModal && (
          <CreateOrJoinLeagueModal
            tab={leagueModalTab} setTab={setLeagueModalTab}
            joinCode={data.joinCode} setJoinCode={data.setJoinCode}
            joinError={data.joinError} setJoinError={data.setJoinError}
            publicLeagues={publicLeaguesAvailable}
            newLeagueName={data.newLeagueName} setNewLeagueName={data.setNewLeagueName}
            newLeagueDescription={data.newLeagueDescription} setNewLeagueDescription={data.setNewLeagueDescription}
            newLeaguePunishment={data.newLeaguePunishment} setNewLeaguePunishment={data.setNewLeaguePunishment}
            newLeagueEndDate={data.newLeagueEndDate} setNewLeagueEndDate={data.setNewLeagueEndDate}
            newLeaguePrize={data.newLeaguePrize} setNewLeaguePrize={data.setNewLeaguePrize}
            newLeagueIsPublic={data.newLeagueIsPublic} setNewLeagueIsPublic={data.setNewLeagueIsPublic}
            onJoin={handleJoinLeague}
            onJoinPublic={handleJoinPublicLeague}
            onCreate={handleCreateLeague}
            onClose={() => setShowCreateLeagueModal(false)}
          />
        )}

        {/* ── Modal: registrar actividad ── */}
        {showLogModal && (
          <LogActivityModal
            sports={SPORTS}
            savedRoutines={data.savedRoutines}
            onSubmit={data.handleLogActivity}
            onClose={() => setShowLogModal(false)}
          />
        )}

        {/* ── Modal: editar actividad ── */}
        {editingActivity && (
          <EditActivityModal
            activity={editingActivity}
            onSave={handleSaveEditedActivity}
            onClose={() => setEditingActivity(null)}
          />
        )}

        {/* ── Modal: perfil ── */}
        {showProfileModal && (
          <ProfileModal
            editName={data.editName} setEditName={data.setEditName}
            editAvatar={data.editAvatar} setEditAvatar={data.setEditAvatar}
            editBio={data.editBio} setEditBio={data.setEditBio}
            editWeight={data.editWeight} setEditWeight={data.setEditWeight}
            editHeight={data.editHeight} setEditHeight={data.setEditHeight}
            onSave={handleSaveProfile}
            onClose={() => setShowProfileModal(false)}
            onLogout={logout}
          />
        )}

        {/* ── Modal: perfil publico ── */}
        {selectedUserProfile && (
          <PublicProfileModal
            user={selectedUserProfile}
            currentUser={data.currentUser}
            activities={data.activities}
            sports={SPORTS}
            onClose={() => setSelectedUserProfile(null)}
            onEditProfile={() => {
              setSelectedUserProfile(null);
              data.openProfileEdit();
              setShowProfileModal(true);
            }}
          />
        )}

        {/* ── Barra de navegación inferior ── */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-slate-100 flex justify-between px-6 py-4 pb-6 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-24 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-indigo-100' : ''}`} />
            <span className="text-[10px] font-bold text-center">Inicio</span>
          </button>
          <button onClick={() => setShowLogModal(true)} className="flex flex-col items-center gap-1 w-24 text-slate-400 hover:text-indigo-600">
            <PlusCircle className="w-6 h-6" />
            <span className="text-[10px] font-bold text-center px-1">Actividad</span>
          </button>
          <button onClick={() => setActiveTab('league')} className={`flex flex-col items-center gap-1 w-24 ${activeTab === 'league' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Trophy className={`w-6 h-6 ${activeTab === 'league' ? 'fill-indigo-100' : ''}`} />
            <span className="text-[10px] font-bold text-center">Liga</span>
          </button>
        </nav>

        {/* ── Flujo de onboarding (se superpone a todo cuando activo) ── */}
        {data.showOnboarding && (
          <OnboardingFlow
            onboardingStep={data.onboardingStep}
            setOnboardingStep={data.setOnboardingStep}
            leagueModalTab={leagueModalTab}
            setLeagueModalTab={setLeagueModalTab}
            joinCode={data.joinCode} setJoinCode={data.setJoinCode}
            joinError={data.joinError} setJoinError={data.setJoinError}
            leagues={data.leagues}
            currentUser={data.currentUser}
            newLeagueName={data.newLeagueName} setNewLeagueName={data.setNewLeagueName}
            newLeagueDescription={data.newLeagueDescription} setNewLeagueDescription={data.setNewLeagueDescription}
            newLeaguePunishment={data.newLeaguePunishment} setNewLeaguePunishment={data.setNewLeaguePunishment}
            newLeagueEndDate={data.newLeagueEndDate} setNewLeagueEndDate={data.setNewLeagueEndDate}
            newLeaguePrize={data.newLeaguePrize} setNewLeaguePrize={data.setNewLeaguePrize}
            newLeagueIsPublic={data.newLeagueIsPublic} setNewLeagueIsPublic={data.setNewLeagueIsPublic}
            onJoin={handleJoinLeague}
            onJoinPublic={handleJoinPublicLeague}
            onCreate={handleCreateLeague}
            onSkip={data.skipOnboarding}
          />
        )}

      </div>
    </div>
  );
}