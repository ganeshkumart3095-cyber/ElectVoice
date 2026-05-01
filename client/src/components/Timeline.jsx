import { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PropTypes from 'prop-types';
import { fetchTimeline } from '../services/searchService';
import { useAppContext } from '../context/AppContext';
import { sendChatMessage } from '../services/geminiService';

const TYPE_CONFIG = {
  historical: { label: 'Historical', color: '#8b949e', bg: 'rgba(139,148,158,0.1)' },
  current: { label: 'Latest', color: '#FF9933', bg: 'rgba(255,153,51,0.15)', glow: true },
  state: { label: 'State Election', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  upcoming: { label: 'Upcoming', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
};

/**
 * Timeline — Interactive historical and upcoming election timeline.
 * Features automated AI analysis for each election event.
 * @returns {JSX.Element}
 */
export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const { language, addMessage, setActiveTab } = useAppContext();

  useEffect(() => {
    fetchTimeline()
      .then((data) => {
        setEvents(data);
        const latest = data.find((e) => e.type === 'current') || data[data.length - 1];
        if (latest) handleEventClick(latest);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  /**
   * Handles selection of an election event and triggers AI explanation.
   * @param {Object} event - The selected election event
   */
  const handleEventClick = async (event) => {
    if (selectedEvent?.id === event.id) return;
    setSelectedEvent(event);
    setExplanation('');
    setIsExplaining(true);

    const prompt = `Provide a concise historical summary of the ${event.title} (${event.year}) in India. Focus on the political context and winner.`;

    try {
      const response = await sendChatMessage([{ role: 'user', parts: [{ text: prompt }] }], language);
      setExplanation(response);
    } catch {
      setExplanation(event.description);
    } finally {
      setIsExplaining(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h2 className="font-display font-bold text-2xl text-gradient-saffron mb-1">Indian Election Timeline</h2>
        <p className="text-sm text-gray-500">From 1952 to 2025 — click events for AI insights</p>
      </header>

      <TypeLegend />

      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="relative pt-20 pb-16" style={{ minWidth: `${events.length * 150}px` }}>
          <div className="timeline-line" />
          <div className="flex justify-between px-8 relative z-10 items-center">
            {events.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isSelected={selectedEvent?.id === event.id}
                isAbove={index % 2 === 0}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <DetailPanel
          event={selectedEvent}
          explanation={explanation}
          isExplaining={isExplaining}
          onAskMore={() => {
            addMessage({ role: 'user', parts: [{ text: `Tell me more about the ${selectedEvent.title}` }] });
            setActiveTab('chat');
          }}
        />
      )}
    </div>
  );
}

// Internal Sub-components
function TimelineEvent({ event, isSelected, isAbove, onClick }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.historical;
  return (
    <div onClick={onClick} className="relative flex flex-col items-center justify-center cursor-pointer group w-[150px]">
      <div className={`timeline-label ${isAbove ? 'above' : 'below'}`}>
        <p className={`text-xs font-semibold ${isSelected ? '' : 'text-gray-500'}`} style={isSelected ? { color: config.color } : {}}>
          {event.title.split('—')[0].trim()}
        </p>
        <p className="text-[10px] text-gray-700">{event.year}</p>
      </div>
      <div
        className={`timeline-dot ${isSelected ? 'selected' : ''}`}
        style={{
          background: isSelected ? config.color : 'rgba(255,255,255,0.2)',
          borderColor: config.color,
          boxShadow: isSelected && config.glow ? `0 0 12px ${config.color}` : 'none',
        }}
      />
    </div>
  );
}

function DetailPanel({ event, explanation, isExplaining, onAskMore }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.historical;
  return (
    <div className="detail-panel animate-fade-in" style={{ borderColor: `${config.color}33` }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{event.emoji}</span>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{event.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={11} /> {event.date}
              </span>
              <span className="badge" style={{ background: config.bg, color: config.color }}>{config.label}</span>
            </div>
          </div>
        </div>
        <button onClick={onAskMore} className="ask-btn">Ask AI <ChevronRight size={12} /></button>
      </div>

      <div className="stats-row flex gap-3 mb-4">
        <StatBadge label="Seats" value={event.seats} icon="🏛️" />
        <StatBadge label="Turnout" value={event.voterTurnout} icon="📊" />
        <StatBadge label="Winner" value={event.winner} icon="🏆" />
      </div>

      <div className="explanation-box">
        {isExplaining ? <TypingIndicator /> : (
          <div className="markdown-content text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation || event.description}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBadge({ label, value, icon }) {
  if (!value) return null;
  return (
    <div className="stat-badge">
      <span>{icon}</span>
      <div>
        <p className="text-[10px] text-gray-500 uppercase">{label}</p>
        <p className="text-xs font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <Loader2 size={32} className="animate-spin text-saffron" />
    <p className="text-sm text-gray-500">Loading election timeline...</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="error-display">❌ {message}</div>
);

const TypeLegend = () => (
  <div className="flex flex-wrap justify-center gap-3">
    {Object.entries(TYPE_CONFIG).map(([type, config]) => (
      <div key={type} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: config.color }} />
        <span className="text-xs text-gray-500">{config.label}</span>
      </div>
    ))}
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-center gap-3">
    <div className="flex gap-1"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
    <span className="text-sm text-gray-500">AI analysis in progress...</span>
  </div>
);
