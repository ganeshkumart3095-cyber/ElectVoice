import { Vote, ExternalLink, LogIn, Menu, X } from 'lucide-react';
import LanguageToggle from '../LanguageToggle';

/**
 * Header Component — Standard layout header with navigation and auth.
 * @param {Object} props - Props
 * @param {Array} props.tabs - Navigation tabs
 * @param {string} props.activeTab - Current active tab ID
 * @param {Function} props.onTabChange - Tab change handler
 * @param {Object} props.user - Current firebase user
 * @param {Function} props.onSignIn - Sign in handler
 * @param {Function} props.onSignOut - Sign out handler
 * @param {boolean} props.mobileMenuOpen - State of mobile menu
 * @param {Function} props.setMobileMenuOpen - Menu toggle state setter
 * @returns {JSX.Element}
 */
const Header = ({
  tabs,
  activeTab,
  onTabChange,
  user,
  onSignIn,
  onSignOut,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="sticky top-0 z-50 glass flex-shrink-0 header-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-saffron-gradient glow-saffron">
              <Vote size={22} color="white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none">
                <span className="text-white">Elect</span>
                <span className="text-saffron">Voice</span>
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter mt-0.5">
                AI Election Guide
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={13} className="mr-1.5" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            
            {user ? (
              <UserSection user={user} onSignOut={onSignOut} />
            ) : (
              <button onClick={onSignIn} className="signin-btn">
                <LogIn size={11} /> Sign In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden mobile-toggle"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <MobileNav 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
          onClose={() => setMobileMenuOpen(false)} 
        />
      )}
    </header>
  );
};

/**
 * Renders user profile and sign out button.
 */
const UserSection = ({ user, onSignOut }) => (
  <div className="flex items-center gap-3 ml-2">
    <div className="hidden sm:block text-right">
      <p className="text-[10px] font-bold text-white leading-none">{user.displayName}</p>
      <button onClick={onSignOut} className="signout-link">Sign Out</button>
    </div>
    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-saffron/30" />
  </div>
);

/**
 * Renders the mobile navigation drawer.
 */
const MobileNav = ({ tabs, activeTab, onTabChange, onClose }) => (
  <div className="md:hidden border-t border-saffron/15 bg-black/95 animate-fade-in">
    <nav className="flex flex-col p-3 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => { onTabChange(tab.id); onClose(); }}
          className={`mobile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
        >
          <tab.icon size={17} />
          <div>
            <p className="text-sm font-medium">{tab.label}</p>
            <p className="text-[10px] opacity-60">{tab.description}</p>
          </div>
        </button>
      ))}
    </nav>
  </div>
);

export default Header;
