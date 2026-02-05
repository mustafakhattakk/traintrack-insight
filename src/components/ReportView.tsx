
import React, { useState } from 'react';
import { Session, Feedback, AIInsight } from '../types';
import { generateSessionReport } from '../geminiService';

interface ReportViewProps {
  sessions: Session[];
  feedbacks: Feedback[];
  eventTitle: string;
}

const ReportView: React.FC<ReportViewProps> = ({ sessions, feedbacks, eventTitle }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  const [report, setReport] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'email'>('ai');

  const activeSession = sessions.find(s => s.id === selectedSessionId);
  const sessionFeedbacks = feedbacks.filter(f => f.sessionId === selectedSessionId);

  const fetchReport = async () => {
    if (!activeSession) return;
    if (sessionFeedbacks.length === 0) {
      setError("Data deficit: No evaluations found for this session.");
      setReport(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateSessionReport(activeSession, sessionFeedbacks);
      setReport(result);
    } catch (err: any) {
      setError("Analysis Engine Interrupted. Please check connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const getSessionAvg = () => {
    if (sessionFeedbacks.length === 0) return 0;
    const scores = sessionFeedbacks.map(f => {
      const overall = f.scores.find(s => s.category === 'overall' && s.questionId === 0)?.score || 0;
      return overall;
    });
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      {/* Target Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Analysis Engine</p>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <h4 className="text-lg font-bold text-slate-800 whitespace-nowrap">Session Optimization</h4>
            <select 
              className="w-full md:w-80 border border-slate-200 rounded-xl px-4 py-2 outline-none font-bold text-xs text-slate-700 bg-slate-50 focus:border-indigo-500 transition shadow-sm"
              value={selectedSessionId}
              onChange={e => setSelectedSessionId(e.target.value)}
            >
              {sessions.map(s => <option key={s.id} value={s.id}>{s.date} — {s.title}</option>)}
            </select>
          </div>
        </div>
        <button 
          onClick={fetchReport}
          disabled={loading}
          className={`flex items-center justify-center px-8 py-3 rounded-xl font-black text-xs transition-all shadow-md uppercase tracking-widest ${
            loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {loading ? <i className="fas fa-spinner fa-spin mr-3"></i> : <i className="fas fa-microchip mr-3"></i>}
          Analyze Session
        </button>
      </div>

      {report && (
        <div className="space-y-8 animate-fadeIn">
          {/* Tab Navigation */}
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl w-fit mx-auto border border-slate-200">
            <button 
              onClick={() => setActiveTab('ai')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Category Analysis
            </button>
            <button 
              onClick={() => setActiveTab('email')}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'email' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Presenter Summary
            </button>
          </div>

          {activeTab === 'ai' ? (
            <div className="space-y-8">
              {/* Executive Summary Card */}
              <div className="bg-indigo-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                <i className="fas fa-brain absolute -top-5 -right-5 text-white/5 text-[10rem]"></i>
                <div className="relative z-10">
                   <div className="bg-white/10 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-6 w-fit">Executive synthesis</div>
                   <p className="text-lg md:text-xl font-bold italic leading-relaxed">"{report.overallSummary}"</p>
                </div>
              </div>

              {/* Category-Specific Detailed Breakdown */}
              <div className="grid grid-cols-1 gap-6">
                 {report.categoryAnalysis.map((cat, i) => (
                   <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:border-indigo-300">
                      <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                         <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{cat.category} Analysis</h5>
                         <span className="text-xs font-black text-indigo-600">Metric: {cat.score}/5.0</span>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Findings</p>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed">{cat.analysis}</p>
                         </div>
                         <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                            <p className="text-[9px] font-bold text-indigo-400 uppercase mb-2">Recommendation</p>
                            <p className="text-sm font-semibold text-indigo-900 leading-relaxed">{cat.detailedRecommendation}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SWOT Highlights */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h5 className="text-xs font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center">
                    <i className="fas fa-check-circle text-emerald-500 mr-3"></i> Notable Strengths
                  </h5>
                  <ul className="space-y-3">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="flex items-start text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                         {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h5 className="text-xs font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center">
                    <i className="fas fa-exclamation-circle text-red-500 mr-3"></i> Priority Gaps
                  </h5>
                  <ul className="space-y-3">
                    {report.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                         {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
              <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Presenter Feedback Summary</h3>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">PREVIEW</span>
                </div>
                <div className="text-[10px] space-y-1 text-slate-500 font-bold">
                  <p>To: {activeSession?.presenterEmail}</p>
                  <p>Subject: Feedback - {activeSession?.title}</p>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Consolidated Rating</p>
                  <h2 className="text-6xl font-black text-indigo-900 tracking-tighter">{getSessionAvg()}<span className="text-xl text-slate-200">/5</span></h2>
                </div>

                <div className="space-y-4">
                   <h6 className="text-[10px] font-black text-slate-900 uppercase">Top Recommendations for You</h6>
                   <ul className="space-y-2">
                      {report.recommendations.map((r, i) => <li key={i} className="text-xs font-bold text-slate-700 bg-indigo-50/50 p-3 rounded-lg flex items-center"><i className="fas fa-lightbulb text-indigo-500 mr-3"></i> {r}</li>)}
                   </ul>
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <h6 className="text-[10px] font-black text-slate-900 uppercase mb-4">Peer Commentary</h6>
                   <div className="space-y-3">
                      {sessionFeedbacks.slice(0, 2).map((f, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg italic text-[11px] font-medium text-slate-500">
                          "{f.comments || 'Feedback noted.'}"
                        </div>
                      ))}
                   </div>
                </div>

                <button className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition">
                  <i className="fas fa-paper-plane mr-2"></i> Send to Presenter
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="bg-red-50 text-red-700 p-8 rounded-2xl text-center font-bold border border-red-200 shadow-sm text-xs">{error}</div>}
      
      {!report && !loading && (
        <div className="py-32 text-center text-slate-200 bg-white rounded-2xl border border-dashed border-slate-300">
           <i className="fas fa-robot text-6xl mb-6 opacity-30"></i>
           <p className="text-sm font-black uppercase tracking-widest text-slate-300">Ready for Analysis</p>
        </div>
      )}
    </div>
  );
};

export default ReportView;
