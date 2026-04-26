import { useState, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  MessageCircle,
  BookOpen,
  MapPin,
  Newspaper,
  Clock,
  Menu,
  X,
  Vote,
  ExternalLink,
  Zap,
  LogIn,
  LogOut,
} from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';
import LanguageToggle from './components/LanguageToggle';
import ChatWindow from './components/ChatWindow';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  auth, 
  logFirebaseEvent, 
  signInWithGoogle, 
  logout 
} from './services';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect as useReactEffect } from 'react';

// Lazy load heavy components for better performance (Code Splitting)
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

function AppContent() {
  const { activeTab, setActiveTab } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Handle Firebase Auth State
  useReactEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // GA4 Tracking
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'tab_change', { tab_name: tabId });
    }

    // Firebase Analytics Tracking
    logFirebaseEvent('tab_view', { tab_name: tabId });
  };

  const isChatTab = activeTab === 'chat';
  const ActiveComponent = TAB_COMPONENTS[activeTab] ?? null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse 80% 40% at top, rgba(255,153,51,0.1) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at bottom right, rgba(19,136,8,0.07) 0%, transparent 60%), #0d1117',
      }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 glass flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,153,51,0.18)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center glow-saffron flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF9933, #e85c00)' }}
              >
                <Vote size={22} color="white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-none">
                  <span className="text-white">Elect</span>
                  <span className="text-gradient-saffron">Voice</span>
                </h1>
                <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
                  AI Election Guide · India
                </p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  title={tab.description}
                >
                  <tab.icon size={13} className="inline mr-1.5" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <a
                href="https://eci.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit ECI official website"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,153,51,0.1)',
                  border: '1px solid rgba(255,153,51,0.3)',
                  color: '#FF9933',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={11} />
                ECI
              </a>

              {/* Firebase Auth Button */}
              {user ? (
                <div className="flex items-center gap-3 ml-2">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-bold text-white leading-none">{user.displayName}</p>
                    <button 
                      onClick={logout}
                      className="text-[9px] text-[#8b949e] hover:text-[#FF9933] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border border-[#FF9933]/30"
                  />
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 ml-2"
                  style={{
                    background: 'linear-gradient(135deg, #FF9933, #e85c00)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  <LogIn size={11} />
                  Sign In
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#e6edf3' }}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t animate-fade-in"
            style={{ borderColor: 'rgba(255,153,51,0.15)', background: 'rgba(13,17,23,0.98)' }}
          >
            <nav className="flex flex-col p-3 gap-1" aria-label="Mobile navigation">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    handleTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all cursor-pointer"
                  style={{
                    background: activeTab === tab.id ? 'rgba(255,153,51,0.1)' : 'transparent',
                    color: activeTab === tab.id ? '#FF9933' : '#8b949e',
                    border: activeTab === tab.id
                      ? '1px solid rgba(255,153,51,0.3)'
                      : '1px solid transparent',
                  }}
                >
                  <tab.icon size={17} />
                  <div>
                    <p>{tab.label}</p>
                    <p className="text-xs opacity-60">{tab.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ── Hero banner — chat tab only ── */}
      {isChatTab && (
        <div
          className="flex-shrink-0 border-b"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,153,51,0.06) 0%, rgba(0,0,80,0.08) 50%, rgba(19,136,8,0.05) 100%)',
            borderColor: 'rgba(255,153,51,0.12)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
              {/* Left: heading */}
              <div className="flex-1 flex flex-col items-center md:items-start">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                  style={{
                    background: 'rgba(255,153,51,0.12)',
                    border: '1px solid rgba(255,153,51,0.28)',
                    color: '#FF9933',
                  }}
                >
                  <Zap size={11} />
                  Powered by Google Gemini AI
                </div>
                <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white leading-tight mb-2">
                  Your <span className="text-gradient-saffron">Election</span> Education <span style={{ color: '#138808' }}>Companion</span>
                </h2>
                <p className="text-sm leading-relaxed mx-auto md:mx-0" style={{ color: '#8b949e', maxWidth: '480px' }}>
                  Understand India's democratic process — voter registration, EVMs, polling booths &amp; more — in your language.
                </p>
              </div>

              {/* Right: stat pills */}
              <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-end gap-3 flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                {[
                  { value: '970M+', label: 'Eligible Voters', color: '#FF9933' },
                  { value: '543', label: 'Lok Sabha Seats', color: '#60a5fa' },
                  { value: '7', label: 'Election Steps', color: '#4ade80' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center px-3 py-2 rounded-2xl flex-1 min-w-0"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <p
                      className="font-display font-bold text-xl leading-none"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs mt-1 leading-tight" style={{ color: '#6e7681' }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content — flex-1 fills remaining viewport ── */}
      <main
        className={`flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 ${
          isChatTab ? 'py-3 overflow-hidden' : 'pt-6 pb-24 overflow-y-auto'
        }`}
        style={{ minHeight: 0 }}
      >
        <div
          className={`rounded-2xl flex flex-col w-full ${isChatTab ? 'flex-1 min-h-0 overflow-hidden' : 'min-h-full'}`}
          style={{
            background: 'rgba(22,27,34,0.65)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className={`flex flex-col w-full ${isChatTab ? 'flex-1 min-h-0' : 'p-4 sm:p-6'}`}>
            <ErrorBoundary>
              <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-[#8b949e]">Loading module...</p>
                  </div>
                </div>
              }>
                {ActiveComponent && <ActiveComponent />}
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </main>

      {/* ── Footer — only on non-chat tabs ── */}
      {!isChatTab && (
        <footer
          className="flex-shrink-0 border-t py-5"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FF9933, #e85c00)' }}
                >
                  <Vote size={12} color="white" />
                </div>
                <span className="text-sm font-semibold" style={{ color: '#8b949e' }}>
                  ElectVoice
                </span>
                <span className="text-xs" style={{ color: '#484f58' }}>
                  — Election Process Education for India
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: '#484f58' }}>
                <a
                  href="https://eci.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.target.style.color = '#FF9933')}
                  onMouseLeave={(e) => (e.target.style.color = 'inherit')}
                >
                  ECI Official
                </a>
                <a
                  href="https://voters.eci.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.target.style.color = '#FF9933')}
                  onMouseLeave={(e) => (e.target.style.color = 'inherit')}
                >
                  Voter Registration
                </a>
                <span>Built with Gemini + Maps + Custom Search</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#161b22',
            color: '#e6edf3',
            border: '1px solid rgba(255,153,51,0.3)',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
