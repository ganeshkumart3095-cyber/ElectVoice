import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * AppContext — Shared global state for the ElectVoice application.
 */
export const AppContext = createContext(null);

const INITIAL_MESSAGES = [
  {
    role: 'model',
    parts: [
      {
        text: `**Jai Hind! Welcome to ElectVoice!**

I'm your AI-powered guide to India's democratic process. I can help you with:

- **Voter Registration** — How to register, Form 6, NVSP portal
- **Voting Process** — EVM, VVPAT, polling day procedures
- **Election Rules** — Model Code of Conduct, candidate nomination
- **Vote Counting** — How results are tabulated and declared
- **Government Formation** — From results to oath-taking

What would you like to know about India's elections?`,
      },
    ],
  },
];

/**
 * AppProvider — Wraps the application to provide shared state via Context API.
 * @param {Object} props - Props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export function AppProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeTab, setActiveTab] = useState('chat');
  const [mapState, setMapState] = useState({
    center: { lat: 28.6139, lng: 77.209 },
    zoom: 12,
    selectedBooth: null,
  });

  /**
   * Adds a new message to the chat history.
   * @param {Object} message - Message object
   */
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Resets the chat history to the initial welcome message.
   */
  const clearChat = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
  }, []);

  /**
   * Partially updates the shared map state.
   * @param {Object} updates - State updates
   */
  const updateMapState = useCallback((updates) => {
    setMapState((prev) => ({ ...prev, ...updates }));
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    messages,
    addMessage,
    clearChat,
    activeTab,
    setActiveTab,
    mapState,
    updateMapState,
  }), [language, messages, addMessage, clearChat, activeTab, mapState, updateMapState]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the application context.
 * @returns {Object} - App state and setters
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
