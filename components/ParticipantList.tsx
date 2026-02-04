
import React, { useState } from 'react';
import { Participant, Session } from '../types';

interface ParticipantListProps {
  participants: Participant[];
  sessions: Session[];
  eventTitle: string;
  onAddParticipants: (p: Participant[]) => void;
  onUpdateParticipant: (p: Participant) => void;
  onDeleteParticipant: (id: string) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, sessions, eventTitle, onAddParticipants, onUpdateParticipant, onDeleteParticipant }) => {
  const [isBulk, setIsBulk] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [manualP, setManualP] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Participant>>({});

  const exportCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Full Name,Email Address,Phone\nAlice Doe,alice@example.com,+123456789";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "participant_list_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkSubmit = () => {
    const lines = bulkData.split('\n').filter(l => l.trim());
    const newItems: Participant[] = [];
    lines.forEach((line, i) => {
      const parts = line.split(/[,\t]/).map(p => p.trim());
      if (parts.length >= 2) newItems.push({ id: `p-b-${Date.now()}-${i}`, name: parts[0], email: parts[1], phone: parts[2] || '' });
    });
    if (newItems.length > 0) onAddParticipants(newItems);
    setBulkData(''); setIsBulk(false);
  };

  const handleStartEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditForm(p);
  };

  const handleSaveEdit = () => {
    if (editingId && editForm.id) {
      onUpdateParticipant(editForm as Participant);
      setEditingId(null);
    }
  };

  const sendWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const generateDailyProgramText = () => {
    // Use local date for "Today"
    const todayDate = new Date();
    const todayStr = todayDate.toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    const todaySessions = sessions
      .filter(s => s.date === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (todaySessions.length === 0) {
      return `📢 *${eventTitle}* - Daily Update\n\nThere are no sessions scheduled for today, ${todayDate.toLocaleDateString()}. Enjoy your break!`;
    }

    let text = `📅 *TODAY'S PROGRAM: ${todayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}*\nEvent: *${eventTitle}*\n\n`;
    
    todaySessions.forEach(s => {
      text += `⏰ *${s.startTime} - ${s.endTime}*\n`;
      text += `📝 Topic: *${s.title}*\n`;
      text += `👤 Resource: _${s.presenterName}_\n`;
      text += `📍 Location: _${s.location}_\n\n`;
    });

    text += `Attention Participants & Speakers: We look forward to seeing everyone there! Please ensure you are at the venue 10 minutes prior.`;
    return text;
  };

  const notifyParticipantProgram = (p: Participant) => {
    if (!p.phone) {
      alert("Participant phone number missing.");
      return;
    }
    const msg = generateDailyProgramText();
    sendWhatsApp(p.phone, msg);
  };

  const handleNotifyDailyProgram = () => {
    const msg = generateDailyProgramText();
    // Copy to clipboard for easy broadcasting if needed
    navigator.clipboard.writeText(msg).then(() => {
      // Open general WhatsApp share to reach multiple people (Group/Broadcast)
      const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      alert("Daily program details copied to clipboard and WhatsApp opened. You can now broadcast this message to all participants and speakers scheduled for today!");
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <i className="fas fa-users absolute -top-5 -right-5 text-white/5 text-[12rem]"></i>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-widest mb-2">Participant Matrix</p>
            <h3 className="text-2xl font-black tracking-tight">{participants.length} Active Attendees</h3>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <button 
              onClick={handleNotifyDailyProgram} 
              className="px-5 py-2 bg-emerald-500 text-white rounded-xl transition font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-400 border border-emerald-400 flex items-center"
            >
               <i className="fab fa-whatsapp mr-2 text-sm"></i> Notify Daily Program
            </button>
            <button onClick={exportCsvTemplate} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition font-bold text-[10px] uppercase tracking-widest border border-white/20">
               CSV Template
            </button>
            <button onClick={() => setIsBulk(!isBulk)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition font-bold text-[10px] uppercase tracking-widest border border-white/20">
               Batch Enroll
            </button>
            <button onClick={() => setIsManual(!isManual)} className="px-5 py-2 bg-white text-emerald-700 rounded-xl transition font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-50">
               Add Manual
            </button>
          </div>
        </div>
      </div>

      {isManual && (
        <form onSubmit={(e) => { e.preventDefault(); onAddParticipants([{...manualP, id: `p-${Date.now()}`}]); setIsManual(false); }} className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xl flex flex-col md:flex-row gap-4 items-end animate-slideDown">
          <div className="flex-1 space-y-1">
            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <input required className="w-full border border-slate-200 rounded-lg px-4 py-2 font-semibold text-xs focus:border-emerald-600 outline-none bg-slate-50" value={manualP.name} onChange={e => setManualP({...manualP, name: e.target.value})} />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email ID</label>
            <input required type="email" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-semibold text-xs focus:border-emerald-600 outline-none bg-slate-50" value={manualP.email} onChange={e => setManualP({...manualP, email: e.target.value})} />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone (Optional)</label>
            <input type="tel" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-semibold text-xs focus:border-emerald-600 outline-none bg-slate-50" value={manualP.phone} onChange={e => setManualP({...manualP, phone: e.target.value})} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Register</button>
            <button type="button" onClick={() => setIsManual(false)} className="text-[10px] font-bold text-slate-400 uppercase px-3">Close</button>
          </div>
        </form>
      )}

      {isBulk && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-xl animate-slideDown">
          <textarea className="w-full h-40 border border-slate-200 rounded-xl p-4 text-[11px] font-mono focus:border-emerald-600 outline-none bg-slate-50 shadow-inner" placeholder="Name, Email, Phone (One record per line)" value={bulkData} onChange={e => setBulkData(e.target.value)} />
          <div className="mt-4 flex justify-end gap-3">
             <button onClick={() => setIsBulk(false)} className="px-4 py-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Discard</button>
             <button onClick={handleBulkSubmit} className="bg-emerald-600 text-white px-8 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest">Enroll All</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">Attendee Name</th>
              <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">Identity / Phone</th>
              <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs mr-4 border border-emerald-100">
                      {p.name.charAt(0)}
                    </div>
                    {editingId === p.id ? (
                      <input className="border border-emerald-200 rounded px-3 py-1 text-xs font-bold outline-none" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                    ) : (
                      <span className="font-bold text-slate-800 text-xs">{p.name}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingId === p.id ? (
                    <div className="space-y-1">
                      <input className="border border-emerald-200 rounded px-3 py-1 text-xs font-medium w-full" value={editForm.email || ''} onChange={setEditForm.email ? (e => setEditForm({...editForm, email: e.target.value})) : (e => setEditForm({...editForm, email: e.target.value}))} />
                      <input className="border border-emerald-200 rounded px-3 py-1 text-xs font-medium w-full" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-medium text-[11px] italic">{p.email}</span>
                      <span className="text-emerald-600 font-bold text-[10px]">{p.phone || 'No Phone'}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === p.id ? (
                    <button onClick={handleSaveEdit} className="text-emerald-600 font-bold text-[10px] uppercase">Update</button>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => notifyParticipantProgram(p)} className="text-emerald-300 hover:text-emerald-600 transition text-[10px]" title="WhatsApp Notify Program"><i className="fab fa-whatsapp"></i> Notify Program</button>
                      <button onClick={() => handleStartEdit(p)} className="text-slate-300 hover:text-emerald-500 transition text-[10px]"><i className="fas fa-edit"></i></button>
                      <button onClick={() => onDeleteParticipant(p.id)} className="text-slate-300 hover:text-red-500 transition text-[10px]"><i className="fas fa-user-times"></i></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParticipantList;
