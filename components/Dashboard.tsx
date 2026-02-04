
import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from 'recharts';
import { Session, Feedback, FeedbackCategory } from '../types';

interface DashboardProps {
  sessions: Session[];
  feedbacks: Feedback[];
  eventTitle: string;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

type DashboardFilter = 'overall' | 'daily' | 'speaker';

const Dashboard: React.FC<DashboardProps> = ({ sessions, feedbacks, eventTitle }) => {
  const [filterType, setFilterType] = useState<DashboardFilter>('overall');
  const [filterValue, setFilterValue] = useState<string>('');

  const getCategoryAvg = (f: Feedback, category: FeedbackCategory) => {
    const catScores = f.scores.filter(s => s.category === category);
    if (catScores.length === 0) return 0;
    const ratings = catScores.filter(s => {
      if (category === 'material' && s.questionId === 3) return false;
      if (category === 'overall' && s.questionId === 1) return false;
      return true;
    });
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, s) => sum + s.score, 0) / ratings.length;
  };

  const filteredFeedbacks = useMemo(() => {
    if (filterType === 'overall') return feedbacks;
    if (filterType === 'daily') {
      const sessionIds = sessions.filter(s => s.date === filterValue).map(s => s.id);
      return feedbacks.filter(f => sessionIds.includes(f.sessionId));
    }
    if (filterType === 'speaker') {
      const sessionIds = sessions.filter(s => s.presenterName === filterValue).map(s => s.id);
      return feedbacks.filter(f => sessionIds.includes(f.sessionId));
    }
    return feedbacks;
  }, [feedbacks, sessions, filterType, filterValue]);

  const stats = useMemo(() => {
    const cats: FeedbackCategory[] = ['material', 'presenter', 'engagement', 'outcomes', 'logistics', 'overall'];
    if (filteredFeedbacks.length === 0) return null;

    const totals = cats.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<FeedbackCategory, number>);
    filteredFeedbacks.forEach(f => {
      cats.forEach(cat => totals[cat] += getCategoryAvg(f, cat));
    });

    return cats.reduce((acc, cat) => ({ ...acc, [cat]: (totals[cat] / filteredFeedbacks.length).toFixed(2) }), {} as Record<FeedbackCategory, string>);
  }, [filteredFeedbacks]);

  const radarData = useMemo(() => {
    if (!stats) return [];
    return [
      { subject: 'Material', value: parseFloat(stats.material) },
      { subject: 'Presenter', value: parseFloat(stats.presenter) },
      { subject: 'Engage', value: parseFloat(stats.engagement) },
      { subject: 'Learn', value: parseFloat(stats.outcomes) },
      { subject: 'Logistics', value: parseFloat(stats.logistics) },
      { subject: 'Overall', value: parseFloat(stats.overall) },
    ];
  }, [stats]);

  // Comparison of speakers for the "Overall" view
  const speakerComparisonData = useMemo(() => {
    if (filterType !== 'overall') return [];
    const speakerMap: Record<string, { total: number; count: number }> = {};
    
    feedbacks.forEach(f => {
      const session = sessions.find(s => s.id === f.sessionId);
      if (session) {
        const score = getCategoryAvg(f, 'overall');
        if (!speakerMap[session.presenterName]) {
          speakerMap[session.presenterName] = { total: 0, count: 0 };
        }
        speakerMap[session.presenterName].total += score;
        speakerMap[session.presenterName].count += 1;
      }
    });

    return Object.entries(speakerMap).map(([name, data]) => ({
      name,
      score: parseFloat((data.total / data.count).toFixed(2))
    })).sort((a, b) => b.score - a.score);
  }, [feedbacks, sessions, filterType]);

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    filteredFeedbacks.forEach(f => {
      const score = f.scores.find(s => s.category === 'overall' && s.questionId === 0)?.score || 0;
      if (score >= 1 && score <= 5) dist[score - 1]++;
    });
    return [
      { name: '1-Star', value: dist[0] },
      { name: '2-Star', value: dist[1] },
      { name: '3-Star', value: dist[2] },
      { name: '4-Star', value: dist[3] },
      { name: '5-Star', value: dist[4] },
    ];
  }, [filteredFeedbacks]);

  const uniqueDates = useMemo(() => Array.from(new Set(sessions.map(s => s.date))).sort(), [sessions]);
  const uniqueSpeakers = useMemo(() => Array.from(new Set(sessions.map(s => s.presenterName))).sort(), [sessions]);

  const getStatus = (score: string | number) => {
    const s = typeof score === 'string' ? parseFloat(score) : score;
    if (s >= 4.2) return { label: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-100' };
    if (s >= 3.5) return { label: 'Satisfactory', color: 'text-amber-700', bg: 'bg-amber-100' };
    return { label: 'Critical', color: 'text-red-700', bg: 'bg-red-100' };
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Filtering Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-1.5 p-1 bg-white/60 backdrop-blur rounded-xl shadow-inner border border-white">
          {(['overall', 'daily', 'speaker'] as const).map(type => (
            <button
              key={type}
              onClick={() => { setFilterType(type); setFilterValue(''); }}
              className={`px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all capitalize ${filterType === type ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {filterType !== 'overall' && (
          <div className="flex-1 max-w-xs w-full">
            <select
              className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-indigo-500 outline-none bg-white shadow-sm"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            >
              <option value="">Select {filterType === 'daily' ? 'Date' : 'Speaker'}...</option>
              {filterType === 'daily' ? uniqueDates.map(d => <option key={d} value={d}>{d}</option>) : uniqueSpeakers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Filter</p>
          <span className="text-xs font-black text-indigo-700 uppercase italic">
            {filterType === 'overall' ? 'Complete Event' : (filterValue || 'None')}
          </span>
        </div>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStat label="Overall" value={stats.overall} icon="fa-heart" color="bg-indigo-600" />
            <MiniStat label="Material" value={stats.material} icon="fa-book" color="bg-blue-600" />
            <MiniStat label="Expertise" value={stats.presenter} icon="fa-user-tie" color="bg-emerald-600" />
            <MiniStat label="Outcome" value={stats.outcomes} icon="fa-graduation-cap" color="bg-orange-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar View */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Dimension Analysis</h4>
                <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${getStatus(stats.overall).bg} ${getStatus(stats.overall).color}`}>
                  {getStatus(stats.overall).label}
                </div>
              </div>
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#F1F5F9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontWeight: 600, fontSize: 9 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                    <Radar name="Index" dataKey="value" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart View */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Rating Spread</h4>
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ratingDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value">
                      {ratingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {ratingDistribution.map((r, i) => (
                  <div key={i} className="flex items-center text-[9px] font-bold text-slate-400">
                    <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: COLORS[i] }}></span>
                    {r.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics Comparison Bar or Speaker Comparison */}
          {filterType === 'overall' ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-violet-500"></div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Speaker Performance Benchmark</h4>
              <div className="h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={speakerComparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F8FAFC" />
                    <XAxis type="number" domain={[0, 5]} hide />
                    <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 600, fontSize: 10 }} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                      {speakerComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Sectional Analysis</h4>
              <div className="h-[200px] md:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={radarData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 600, fontSize: 9 }} />
                    <YAxis domain={[0, 5]} hide />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                      {radarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Logic Core Analysis Area */}
          <div className="bg-indigo-900 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden border border-indigo-700">
             <i className="fas fa-microchip absolute -bottom-10 -right-10 text-white/5 text-[15rem]"></i>
             <div className="relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                 <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] flex items-center">
                   <i className="fas fa-brain mr-2 animate-pulse"></i> Logic Core Detailed Analysis
                 </h4>
                 <div className="px-4 py-1.5 bg-indigo-800/50 rounded-full border border-indigo-700 text-[9px] font-bold text-indigo-100 uppercase tracking-widest">
                   System Health: {getStatus(stats.overall).label}
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Detail Card 1 */}
                 <div className="bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                   <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mb-3">Resource Deployment</p>
                   <p className="text-xs font-medium leading-relaxed opacity-90">
                     {parseFloat(stats.presenter) >= 4.0 
                       ? "High expertise retention detected. Presenters are effectively bridging the gap between theory and practical application. Maintain the current speaker vetting protocols."
                       : "Presenter clarity index is below optimal threshold. Recommend structured briefings or peer reviews for upcoming resources to ensure concept delivery aligns with participant technical background."}
                   </p>
                 </div>
                 
                 {/* Detail Card 2 */}
                 <div className="bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                   <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mb-3">Engagement Strategy</p>
                   <p className="text-xs font-medium leading-relaxed opacity-90">
                     {parseFloat(stats.engagement) >= 4.0
                       ? "Interaction patterns indicate active cognitive participation. The mix of discussion and activities is reaching the target saturation point for adult learning."
                       : "Engagement drop detected. System suggests diversifying teaching methods. Incorporate more real-world case studies or gamified elements in the next 24-hour cycle to prevent fatigue."}
                   </p>
                 </div>

                 {/* Detail Card 3 */}
                 <div className="bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm">
                   <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mb-3">Strategic Impact</p>
                   <p className="text-xs font-medium leading-relaxed opacity-90">
                     {parseFloat(stats.outcomes) >= 4.0
                       ? "Learners report high confidence in applying new skills. The ROI on material development is validated by the 'Outcomes' metric exceeding general benchmarks."
                       : "Learning objective alignment is critical. Participants are struggling to see immediate utility. Refocus content summaries on 'Practical Day 1 Applications' for the remaining modules."}
                   </p>
                 </div>
               </div>

               <div className="mt-10 flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 gap-6">
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Cumulative Index</p>
                    <div className="text-6xl font-black italic tracking-tighter text-white">
                      {stats.overall}
                      <span className="text-base font-normal opacity-40 ml-2 tracking-normal">out of 5.0</span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="text-center px-6 py-4 bg-white/5 rounded-xl border border-white/10">
                       <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Feedback Volume</p>
                       <p className="text-xl font-black">{filteredFeedbacks.length}</p>
                    </div>
                    <div className="text-center px-6 py-4 bg-white/5 rounded-xl border border-white/10">
                       <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Sessions tracked</p>
                       <p className="text-xl font-black">{filterType === 'overall' ? sessions.length : 1}</p>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        </>
      ) : (
        <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-slate-300">
           <i className="fas fa-chart-area text-slate-200 text-7xl mb-6"></i>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Awaiting Evaluation Input</p>
        </div>
      )}
    </div>
  );
};

const MiniStat = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 transition-all hover:scale-[1.02]">
    <div className="flex justify-between items-start mb-2">
      <div className={`w-8 h-8 rounded-lg ${color} text-white flex items-center justify-center text-xs shadow-md`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="text-lg md:text-2xl font-black text-slate-800 tracking-tighter">{value}</div>
    </div>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

export default Dashboard;
