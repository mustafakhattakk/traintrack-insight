
import React, { useState, useMemo } from 'react';
import { Session } from '../types';

interface SessionListProps {
  sessions: Session[];
  eventTitle: string;
  onAddSessions: (sessions: Session[]) => void;
  onUpdateSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
  onTriggerInvite: (session: Session) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, eventTitle, onAddSessions, onUpdateSession, onDeleteSession, onTriggerInvite }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isBulk, setIsBulk] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [newSession, setNewSession] = useState<Partial<Session>>({
    date: new Date().toISOString().split('T')[0],
    location: '',
    presenterPhone: ''
  });
  const [editSession, setEditSession] = useState<Partial<Session>>({});

  const exportCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Module Title,Presenter,Email,Phone,Date (YYYY-MM-DD),Start (HH:mm),End (HH:mm),Location\nStrategic Planning,Dr. Aris,aris@example.com,+123456789,2024-11-20,09:00,10:30,Room 101";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "program_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkSubmit = () => {
    const lines = bulkData.split('\n').filter(line => line.trim() !== '');
    const newItems: Session[] = [];
    lines.forEach((line, index) => {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      if (parts.length >= 4) {
        newItems.push({
          id: `s-bulk-${Date.now()}-${index}`,
          title: parts[0] || 'Untitled',
          presenterName: parts[1] || 'Expert TBA',
          presenterEmail: parts[2] || '',
          presenterPhone: parts[3] || '',
          date: parts[4] || new Date().toISOString().split('T')[0],
          startTime: parts[5] || '09:00',
          endTime: parts[6] || '10:00',
          location: parts[7] || 'TBA'
        });
      }
    });
    if (newItems.length > 0) onAddSessions(newItems);
    setBulkData('');
    setIsBulk(false);
  };

  const sessionsByDate = useMemo(() => {
    const groups: { [key: string]: Session[] } = {};
    sessions.forEach(s => {
      if (!groups[s.date]) groups[s.date] = [];
      groups[s.date].push(s);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [sessions]);

  const handleStartEdit = (session: Session) => {
    setEditingId(session.id);
    setEditSession(session);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editSession.id) {
      onUpdateSession(editSession as Session);
      setEditingId(null);
      setEditSession({});
    }
  };

  const sendWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const notifyPresenterOfSession = (session: Session) => {
    if (!session.presenterPhone) {
      alert("Presenter phone number missing.");
      return;
    }
    const msg = `Hello *${session.presenterName}*, this is a reminder for your session *"${session.title}"* today at *${session.startTime}* in *${session.location}*. We are excited to have you!`;
    sendWhatsApp(session.presenterPhone, msg);
  };

  const sendDailyProgramWhatsApp = (date: string, daySessions: Session[]) => {
    const programStr = daySessions.map(s => `⏰ *${s.startTime} - ${s.endTime}*\n📝 *${s.title}*\n👤 _Resource: ${s.presenterName}_\n📍 _Location: ${s.location}_\n`).join('\n');
    const msg = `📅 *Program for ${new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}*:\n\n${programStr}\nSee you there!`;
    sendWhatsApp('', msg);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <i className="fas fa-calendar-alt absolute -top-5 -right-5 text-white/5 text-[12rem]"></i>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="text-blue-200 font-bold text-[10px] uppercase tracking-widest mb-2">Program Registry</p>
            <h3 className="text-2xl font-black tracking-tight">{sessions.length} Professional Modules</h3>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
             <button onClick={exportCsvTemplate} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition font-bold text-[10px] uppercase tracking-widest border border-white/20">
               CSV Template
             </button>
             <button onClick={() => setIsBulk(!isBulk)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition font-bold text-[10px] uppercase tracking-widest border border-white/20">
               Bulk Enroll
             </button>
             <button onClick={() => { setIsAdding(!isAdding); setEditingId(null); }} className="px-5 py-2 bg-white text-blue-700 rounded-xl transition font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-50">
               {isAdding ? 'Close Panel' : 'Create Entry'}
             </button>
          </div>
        </div>
      </div>

      {isBulk && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl animate-slideDown">
          <textarea 
            className="w-full h-40 border border-slate-200 rounded-xl p-4 text-[11px] font-mono focus:border-indigo-500 outline-none bg-slate-50 shadow-inner"
            placeholder="Title, Presenter, Email, Phone, Date (YYYY-MM-DD), Start (HH:mm), End (HH:mm), Location"
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setIsBulk(false)} className="text-[10px] font-bold text-slate-400 uppercase px-4">Close</button>
            <button onClick={handleBulkSubmit} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Process Batch</button>
          </div>
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-xl animate-slideDown">
          <form onSubmit={editingId ? handleSaveEdit : (e) => { e.preventDefault(); if(newSession.title) { onAddSessions([{...newSession, id: `s-${Date.now()}`} as Session]); setIsAdding(false); } }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4 border-b border-slate-100 pb-2 mb-2">
              <h4 className="font-bold text-slate-900 text-base uppercase">{editingId ? 'Edit Module' : 'New Module'}</h4>
            </div>
            <FormInput label="Module Title" value={editingId ? editSession.title : newSession.title || ''} onChange={(v: string) => editingId ? setEditSession({...editSession, title: v}) : setNewSession({...newSession, title: v})} />
            <FormInput label="Resource Person" value={editingId ? editSession.presenterName : newSession.presenterName || ''} onChange={(v: string) => editingId ? setEditSession({...editSession, presenterName: v}) : setNewSession({...newSession, presenterName: v})} />
            <FormInput label="Email" type="email" value={editingId ? editSession.presenterEmail : newSession.presenterEmail || ''} onChange={(v: string) => editingId ? setEditSession({...editSession, presenterEmail: v}) : setNewSession({...newSession, presenterEmail: v})} />
            <FormInput label="Telephone (Optional)" type="tel" value={editingId ? editSession.presenterPhone : newSession.presenterPhone || ''} onChange={(v: string) => editingId ? setEditSession({...editSession, presenterPhone: v}) : setNewSession({...newSession, presenterPhone: v})} />
            <FormInput label="Program Date" type="date" value={editingId ? editSession.date : newSession.date || ''} onChange={(v: string) => editingId ? setEditSession({...editSession, date: v}) : setNewSession({...newSession, date: v})} />
            <FormInput label="Start Time" type="time" value={editingId ? editSession.startTime : newSession.startTime || ''} onChange={(v: string) => editingId ? setEditSession({...editSession, startTime: v}) : setNewSession({...newSession, startTime: v})} />
            <FormInput label="End Time" type="time" value={editingId ? editSession.endTime : newSession.endTime || ''} onChange={(v: string) => editingId ? setEditSession({...editSession, endTime: v}) : setNewSession({...newSession, endTime: v})} />
            <FormInput label="Location" value={editingId ? editSession.location : newSession.location || ''} onChange={(v: string) => editingId ? setEditSession({...editSession, location: v}) : setNewSession({...newSession, location: v})} />
            
            <div className="md:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-50 mt-2">
              <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-[10px] font-bold text-slate-400 uppercase px-4">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest">
                {editingId ? 'Update Session' : 'Save Session'}
              </button>
            </div>
          </form>
        </div>
      )}

      {sessionsByDate.map(([date, dateSessions]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
               {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <button 
              onClick={() => sendDailyProgramWhatsApp(date, dateSessions)}
              className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 hover:bg-emerald-100 transition shadow-sm"
            >
              <i className="fab fa-whatsapp mr-1"></i> Send Program Summary
            </button>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dateSessions.map(session => (
              <div key={session.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all duration-300 relative">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                         {session.presenterName.charAt(0)}
                       </div>
                       <div>
                         <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">{session.startTime} — {session.endTime}</p>
                         <h5 className="text-sm font-bold text-slate-800 line-clamp-1">{session.title}</h5>
                       </div>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => notifyPresenterOfSession(session)} className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition border border-emerald-100 text-[10px]" title="WhatsApp Notify Presenter"><i className="fab fa-whatsapp"></i></button>
                      <button onClick={() => handleStartEdit(session)} className="w-7 h-7 rounded bg-slate-50 text-slate-400 hover:text-blue-500 transition border border-slate-100 text-[10px]"><i className="fas fa-edit"></i></button>
                      <button onClick={() => onDeleteSession(session.id)} className="w-7 h-7 rounded bg-slate-50 text-slate-400 hover:text-red-500 transition border border-slate-100 text-[10px]"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-6 text-[10px] font-semibold">
                    <span className="text-slate-500 flex items-center truncate"><i className="fas fa-user-circle mr-1.5 opacity-50"></i> {session.presenterName}</span>
                    <span className="text-slate-400 flex items-center justify-end truncate"><i className="fas fa-map-marker-alt mr-1.5 opacity-50"></i> {session.location}</span>
                  </div>

                  <button 
                    onClick={() => onTriggerInvite(session)} 
                    className="w-full py-2.5 rounded-lg bg-indigo-950 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all transform active:scale-95"
                  >
                    Evaluate Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const FormInput = ({ label, type = 'text', value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} 
      required={type !== 'tel'} 
      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 outline-none font-semibold text-xs bg-slate-50/50" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

export default SessionList;
