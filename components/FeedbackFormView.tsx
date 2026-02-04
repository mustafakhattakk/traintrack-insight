
import React, { useState, useEffect } from 'react';
import { Session, Participant, Feedback, EVALUATION_QUESTIONS, QuestionFeedback, FeedbackCategory } from '../types';

interface FeedbackFormProps {
  sessions: Session[];
  participants: Participant[];
  eventTitle: string;
  preselectedSessionId?: string;
  onSubmit: (f: Feedback) => void;
}

const FeedbackFormView: React.FC<FeedbackFormProps> = ({ sessions, participants, eventTitle, preselectedSessionId, onSubmit }) => {
  const [sessionId, setSessionId] = useState(preselectedSessionId || '');
  const [participantId, setParticipantId] = useState('');
  const [scores, setScores] = useState<QuestionFeedback[]>([]);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const initialScores: QuestionFeedback[] = [];
    const cats: FeedbackCategory[] = ['material', 'presenter', 'engagement', 'outcomes', 'logistics', 'overall'];
    cats.forEach(cat => {
      EVALUATION_QUESTIONS[cat].forEach((_, idx) => {
        initialScores.push({ category: cat, questionId: idx, score: 5, textValue: '' });
      });
    });
    setScores(initialScores);
  }, []);

  const handleScoreChange = (category: FeedbackCategory, qIdx: number, val: number, text?: string) => {
    setScores(prev => prev.map(s => 
      s.category === category && s.questionId === qIdx ? { ...s, score: val, textValue: text || '' } : s
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId && participantId) {
      onSubmit({
        id: `f${Date.now()}`,
        sessionId,
        participantId,
        scores,
        comments,
        submittedAt: new Date().toISOString()
      });
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
          <i className="fas fa-check"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight uppercase">Success</h3>
        <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto text-sm">Thank you for your valuable feedback.</p>
        <button onClick={() => setSubmitted(false)} className="bg-indigo-900 text-white font-bold px-10 py-3 rounded-lg shadow-lg uppercase tracking-widest text-xs hover:bg-black transition">Submit New Entry</button>
      </div>
    );
  }

  const renderRatingGroup = (category: FeedbackCategory, label: string, icon: string, color: string) => (
    <div className="space-y-6 bg-slate-50/50 p-8 rounded-2xl border border-slate-200">
      <div className="flex items-center space-x-4 mb-6">
        <div className={`w-10 h-10 rounded-lg ${color} text-white flex items-center justify-center shadow-md`}><i className={icon + " text-base"}></i></div>
        <div>
          <h4 className="font-bold text-slate-800 uppercase tracking-tight text-sm">{label}</h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Section {category.charAt(0).toUpperCase()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {EVALUATION_QUESTIONS[category].map((q, i) => {
          const sObj = scores.find(s => s.category === category && s.questionId === i);
          const currentScore = sObj?.score || 5;

          if ((category === 'material' && i === 3) || (category === 'overall' && i === 1)) {
            const options = category === 'material' ? ['Too Basic', 'Appropriate', 'Too Advanced'] : ['Yes', 'No', 'Maybe'];
            return (
              <div key={i} className="p-5 bg-white rounded-xl border border-slate-100 group transition-all hover:border-indigo-100">
                <p className="text-sm font-semibold text-slate-700 mb-4 italic pl-4 border-l-3 border-indigo-200">"{q}"</p>
                <div className="flex flex-wrap gap-2">
                  {options.map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleScoreChange(category, i, idx + 1, label)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        sObj?.textValue === label ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={i} className="flex flex-col xl:flex-row xl:items-center justify-between p-5 bg-white rounded-xl border border-slate-100 group transition-all hover:border-indigo-100">
              <p className="text-sm font-semibold text-slate-700 mb-4 xl:mb-0 pr-8 italic border-l-3 border-slate-100 pl-4 group-hover:border-indigo-600 transition-all">"{q}"</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleScoreChange(category, i, rating)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                      rating <= currentScore ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn pb-32">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
        <div className="bg-indigo-950 px-10 py-12 text-white relative">
          <div className="absolute top-0 right-0 p-10 opacity-5 text-indigo-400 text-[12rem]"><i className="fas fa-check-double"></i></div>
          <div className="relative z-10">
             <div className="bg-white/10 text-white inline-block px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-6">Evaluation Matrix</div>
             <h2 className="text-2xl font-bold mb-3 tracking-tight uppercase">{eventTitle}</h2>
             <p className="text-indigo-200 font-medium max-w-2xl text-base leading-relaxed">
               Help us optimize future sessions by providing your honest assessment.
             </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Session Module</label>
              <select required className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none bg-slate-50 font-bold text-sm text-slate-700 focus:border-indigo-600 transition" value={sessionId} onChange={e => setSessionId(e.target.value)}>
                <option value="">Select Session...</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Attendee Name</label>
              <select required className="w-full border border-slate-200 rounded-lg px-4 py-3 outline-none bg-slate-50 font-bold text-sm text-slate-700 focus:border-indigo-600 transition" value={participantId} onChange={e => setParticipantId(e.target.value)}>
                <option value="">Select Identity...</option>
                {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-10">
            {renderRatingGroup('material', 'Section A: Material Quality', 'fas fa-book-open', 'bg-indigo-600')}
            {renderRatingGroup('presenter', 'Section B: Presenter Expertise', 'fas fa-user-tie', 'bg-emerald-600')}
            {renderRatingGroup('engagement', 'Section C: Delivery Flow', 'fas fa-bolt', 'bg-amber-600')}
            {renderRatingGroup('outcomes', 'Section D: Value Gained', 'fas fa-graduation-cap', 'bg-indigo-800')}
            {renderRatingGroup('logistics', 'Section E: Logistics', 'fas fa-tools', 'bg-slate-600')}
            {renderRatingGroup('overall', 'Section F: Overall Recommendation', 'fas fa-star', 'bg-black')}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Section G: Open-Ended Comments</label>
            <textarea 
              className="w-full border border-slate-200 rounded-xl p-6 outline-none focus:border-indigo-600 bg-slate-50 font-medium text-sm transition shadow-inner italic text-slate-800" 
              rows={5} 
              placeholder="What did you like most? Any areas for growth?" 
              value={comments} 
              onChange={e => setComments(e.target.value)} 
            />
          </div>

          <button type="submit" className="w-full bg-indigo-900 text-white font-bold py-5 rounded-xl shadow-xl hover:bg-black transition-all transform active:scale-95 uppercase tracking-widest text-sm">
            Transmit Evaluation
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackFormView;
