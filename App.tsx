
import React, { useState, useEffect } from 'react';
import { ViewState, Session, Participant, Feedback } from './types';
import { MOCK_SESSIONS, MOCK_PARTICIPANTS, MOCK_FEEDBACK } from './constants';
import Dashboard from './components/Dashboard';
import SessionList from './components/SessionList';
import ParticipantList from './components/ParticipantList';
import FeedbackFormView from './components/FeedbackFormView';
import ReportView from './components/ReportView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [eventTitle, setEventTitle] = useState('Executive Leadership Forum 2024');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(MOCK_FEEDBACK);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTitle = localStorage.getItem('tt_event_title_v8');
    const savedSessions = localStorage.getItem('tt_sessions_v8');
    const savedParticipants = localStorage.getItem('tt_participants_v8');
    const savedFeedback = localStorage.getItem('tt_feedback_v8');
    if (savedTitle) setEventTitle(savedTitle);
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    if (savedFeedback) setFeedbacks(JSON.parse(savedFeedback));
  }, []);

  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
  };

  const handleUpdateTitle = (title: string) => {
    setEventTitle(title);
    saveToLocal('tt_event_title_v8', title);
  };

  const handleAddSessions = (newSessions: Session[]) => {
    setSessions(prev => {
      const updated = [...prev, ...newSessions];
      saveToLocal('tt_sessions_v8', updated);
      return updated;
    });
  };

  const handleUpdateSession = (updatedSession: Session) => {
    setSessions(prev => {
      const updated = prev.map(s => s.id === updatedSession.id ? updatedSession : s);
      saveToLocal('tt_sessions_v8', updated);
      return updated;
    });
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveToLocal('tt_sessions_v8', updated);
      return updated;
    });
  };

  const handleAddParticipants = (newParticipants: Participant[]) => {
    setParticipants(prev => {
      const updated = [...prev, ...newParticipants];
      saveToLocal('tt_participants_v8', updated);
      return updated;
    });
  };

  const handleUpdateParticipant = (updatedP: Participant) => {
    setParticipants(prev => {
      const updated = prev.map(p => p.id === updatedP.id ? updatedP : p);
      saveToLocal('tt_participants_v8', updated);
      return updated;
    });
  };

  const handleDeleteParticipant = (id: string) => {
    setParticipants(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToLocal('tt_participants_v8', updated);
      return updated;
    });
  };

  const handleFeedbackSubmit = (feedback: Feedback) => {
    setFeedbacks(prev => {
      const updated = [...prev, feedback];
      saveToLocal('tt_feedback_v8', updated);
      return updated;
    });
    setView('dashboard');
  };

  const NavItem: React.FC<{ target: ViewState; icon: string; label: string; activeColor: string }> = ({ target, icon, label, activeColor }) => (
    <button
      onClick={() => {
        setView(target);
        setIsMobileMenuOpen(false);
      }}
      className={`group flex items-center w-full px-4 py-2.5 text-xs md:text-sm font-semibold transition-all rounded-lg mb-1.5 ${
        view === target 
          ? `${activeColor} text-white shadow-md` 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <i className={`${icon} w-5 mr-3 text-sm md:text-base group-hover:scale-110 transition-transform`}></i>
      {(isSidebarOpen || isMobileMenuOpen) && <span className="tracking-tight">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className={`hidden md:flex flex-col border-r border-slate-200 transition-all duration-300 z-50 bg-white ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-950 text-white">
          {isSidebarOpen ? (
            <h1 className="text-lg font-bold tracking-tight flex items-center">
              <i className="fas fa-chart-line mr-2 text-indigo-400"></i> TrainTrack
            </h1>
          ) : (
            <i className="fas fa-chart-line text-lg mx-auto"></i>
          )}
        </div>
        
        <nav className="flex-1 p-4 mt-2 space-y-1 overflow-y-auto">
          <NavItem target="dashboard" icon="fas fa-th-large" label="Dashboard" activeColor="bg-indigo-600" />
          <NavItem target="sessions" icon="fas fa-calendar-alt" label="Program" activeColor="bg-blue-600" />
          <NavItem target="participants" icon="fas fa-user-friends" label="Participants" activeColor="bg-emerald-600" />
          <NavItem target="reports" icon="fas fa-chart-bar" label="AI Reports" activeColor="bg-violet-600" />
          <div className="pt-4 pb-2 border-t border-slate-50 mt-4">
             <span className={`px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest ${!isSidebarOpen && 'hidden'}`}>Evaluation</span>
          </div>
          <NavItem target="feedback-entry" icon="fas fa-star-half-alt" label="Form Entry" activeColor="bg-amber-500" />
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full py-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 transition border border-slate-200 text-xs">
              <i className={`fas fa-${isSidebarOpen ? 'chevron-left' : 'chevron-right'}`}></i>
           </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          <div className="bg-white w-64 shadow-2xl flex flex-col animate-slideRight">
            <div className="p-5 border-b flex justify-between items-center bg-indigo-950 text-white">
              <span className="font-bold">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <nav className="p-4 space-y-2">
              <NavItem target="dashboard" icon="fas fa-th-large" label="Dashboard" activeColor="bg-indigo-600" />
              <NavItem target="sessions" icon="fas fa-calendar-alt" label="Program" activeColor="bg-blue-600" />
              <NavItem target="participants" icon="fas fa-user-friends" label="Participants" activeColor="bg-emerald-600" />
              <NavItem target="reports" icon="fas fa-chart-bar" label="AI Reports" activeColor="bg-violet-600" />
              <NavItem target="feedback-entry" icon="fas fa-star-half-alt" label="Form Entry" activeColor="bg-amber-500" />
            </nav>
          </div>
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center gap-4 shadow-sm z-40">
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-500 p-2"><i className="fas fa-bars"></i></button>
          
          <div className="flex-1 min-w-0">
             <p className="hidden md:block text-[9px] font-bold text-indigo-600 uppercase tracking-widest leading-none mb-1">Administrative Console</p>
             {isEditingTitle ? (
               <input 
                 autoFocus
                 className="text-base md:text-xl font-bold text-slate-900 bg-transparent border-b-2 border-indigo-500 outline-none w-full max-w-lg"
                 value={eventTitle}
                 onChange={e => handleUpdateTitle(e.target.value)}
                 onBlur={() => setIsEditingTitle(false)}
                 onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)}
               />
             ) : (
               <h2 
                 onClick={() => setIsEditingTitle(true)}
                 className="text-sm md:text-xl font-bold text-slate-900 truncate tracking-tight cursor-pointer hover:text-indigo-600 transition flex items-center group"
               >
                 {eventTitle} <i className="fas fa-pen ml-3 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-slate-300"></i>
               </h2>
             )}
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date().toLocaleDateString()}</span>
             </div>
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs md:text-sm font-bold text-slate-600">
               AD
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="max-w-6xl mx-auto w-full">
            {view === 'dashboard' && <Dashboard sessions={sessions} feedbacks={feedbacks} eventTitle={eventTitle} />}
            {view === 'sessions' && (
              <SessionList 
                sessions={sessions} 
                eventTitle={eventTitle}
                onAddSessions={handleAddSessions} 
                onUpdateSession={handleUpdateSession}
                onDeleteSession={handleDeleteSession}
                onTriggerInvite={(session) => {
                  setActiveSession(session);
                  setView('feedback-entry');
                }}
              />
            )}
            {view === 'participants' && (
              <ParticipantList 
                participants={participants} 
                sessions={sessions}
                eventTitle={eventTitle}
                onAddParticipants={handleAddParticipants} 
                onUpdateParticipant={handleUpdateParticipant}
                onDeleteParticipant={handleDeleteParticipant}
              />
            )}
            {view === 'feedback-entry' && (
              <FeedbackFormView 
                sessions={sessions} 
                participants={participants} 
                eventTitle={eventTitle}
                preselectedSessionId={activeSession?.id}
                onSubmit={handleFeedbackSubmit} 
              />
            )}
            {view === 'reports' && (
              <ReportView sessions={sessions} feedbacks={feedbacks} eventTitle={eventTitle} />
            )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
