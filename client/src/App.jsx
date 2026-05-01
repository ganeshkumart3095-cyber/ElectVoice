import { useState, lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  MessageCircle,
  BookOpen,
  MapPin,
  Newspaper,
  Clock,
  Vote,
  Zap,
} from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';
import ChatWindow from './components/ChatWindow';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/layout/Header';
import { auth, logFirebaseEvent, signInWithGoogle, logout } from './services';
import { onAuthStateChanged } from 'firebase/auth';

// Code splitting for performance
const StepperGuide = lazy(() => import('./components/StepperGuide'));
const BoothLocator = lazy(() => import('./components/BoothLocator'));
const NewsSection = lazy(() => import('./components/NewsSection'));
const Timeline = lazy(() => import('./components/Timeline'));

const TABS = [
  { id: 'chat', label: 'AI Chat', icon: MessageCircle, description: 'Ask Gemini AI' },
  { id: 'guide', label: 'Election Guide', icon: BookOpen, description: '7-step process' },
  { id: 'booths', label: 'Find Booth', icon: MapPin, description: 'Google Maps' },
  { id: 'news', label: 'News', icon: Newspaper, description: 'Live results' },
  { id: 'timeline', label: 'Timeline', icon: Clock, description: '1952–2025' },
];

const TAB_COMPONENTS = {
  chat: ChatWindow,
  guide: StepperGuide,
  booths: BoothLocator,
  news: NewsSection,
  timeline: Timeline,
};

/**
 * AppContent — Main application layout and state orchestration.
 */
function AppContent() {
  const { activeTab, setActiveTab } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Switches active tab and logs analytics.
   * @param {string} tabId - Target tab ID
   */
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    logFirebaseEvent('tab_view', { tab_name: tabId });
  };

  const isChatTab = activeTab === 'chat';
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen flex flex-col app-container">
      <Header 
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={logout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {isChatTab && <HeroBanner />}

      <main className={`flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 ${isChatTab ? 'py-3 overflow-hidden' : 'pt-6 pb-24'}`}>
        <div className="content-card">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {ActiveComponent && <ActiveComponent />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>

      {!isChatTab && <Footer />}

      <Toaster position="bottom-right" toastOptions={{ className: 'custom-toast' }} />
    </div>
  );
}

/**
 * Visual hero banner displayed on the chat tab.
 */
const HeroBanner = () => (
  <div className="hero-banner flex-shrink-0">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="badge mb-3">
            <Zap size={11} /> Powered by Google Gemini AI
          </div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white mb-2">
            Your <span className="text-saffron">Election</span> Education <span className="text-green-500">Companion</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-lg">
            Understand India's democratic process — voter registration, EVMs, and polling booths.
          </p>
        </div>
        <div className="stats-container hidden sm:flex gap-3">
          <StatPill value="970M+" label="Voters" color="#FF9933" />
          <StatPill value="543" label="Seats" color="#60a5fa" />
        </div>
      </div>
    </div>
  </div>
);

const StatPill = ({ value, label, color }) => (
  <div className="stat-pill">
    <p className="font-display font-bold text-xl" style={{ color }}>{value}</p>
    <p className="text-[10px] uppercase text-gray-500">{label}</p>
  </div>
);

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center p-20">
    <div className="animate-pulse flex flex-col items-center">
      <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500 text-sm">Loading module...</p>
    </div>
  </div>
);

const Footer = () => (
  <footer className="flex-shrink-0 border-t border-white/5 py-5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center text-[11px] text-gray-600">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-saffron-gradient flex items-center justify-center">
          <Vote size={10} color="white" />
        </div>
        <span className="font-semibold text-gray-500">ElectVoice India</span>
      </div>
      <div className="flex gap-4">
        <a href="https://eci.gov.in" target="_blank" rel="noreferrer">ECI Official</a>
        <a href="https://voters.eci.gov.in" target="_blank" rel="noreferrer">Registration</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
