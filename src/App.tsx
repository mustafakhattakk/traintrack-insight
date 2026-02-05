import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="p-6 border-b bg-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🚆 TrainTrack Insight
        </h1>
        <p className="text-sm text-slate-600">
          Event Review & Analytics Dashboard
        </p>
      </header>

      <main className="p-6">
        <Dashboard />
      </main>
    </div>
  );
}
