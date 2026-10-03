import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  if (view === 'dashboard') {
    return <DashboardPage onNavigateToLanding={() => setView('landing')} />;
  }

  return <LandingPage onNavigateToDashboard={() => setView('dashboard')} />;
}

export default App;
