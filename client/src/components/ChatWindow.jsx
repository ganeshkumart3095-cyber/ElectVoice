import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Trash2, Bot, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAppContext } from '../context/AppContext';
import { sendChatMessage } from '../services/geminiService';

const SUGGESTED_QUESTIONS = [
  'How do I register to vote?',
  'What is Form 6?',
  'How does EVM work?',
  'What is NOTA?',
  'How are votes counted?',
  'What is Model Code of Conduct?',
];

/**
 * ChatWindow — full-height conversational AI chat with Gemini
 */
export default function ChatWindow() {
  const { messages, addMessage, clearChat, language } = useAppContext();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(
    async (text) => {
      const messageText = (text || inputText).trim();
      if (!messageText || isLoading) return;

      setInputText('');
      setError(null);

      const userMessage = { role: 'user', parts: [{ text: messageText }] };
      addMessage(userMessage);
      setIsLoading(true);

      // GA4 Tracking
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'chat_message_sent', { language });
      }

      try {
        const updatedMessages = [...messages, userMessage];
        const responseText = await sendChatMessage(updatedMessages, language);
        addMessage({ role: 'model', parts: [{ text: responseText }] });
      } catch (err) {
        setError(err.message || 'Failed to get response. Please try again.');
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [inputText, isLoading, messages, addMessage, language]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div
      className="flex flex-col w-full"
      style={{ height: '100%', minHeight: 0 }}
    >
      {/* ── Chat Header ── */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0 relative z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,153,51,0.12) 0%, rgba(19,136,8,0.08) 100%)',
          borderBottom: '1px solid rgba(255,153,51,0.18)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Bot avatar with pulse ring */}
          <div className="relative flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF9933, #c94800)' }}
            >
              <Bot size={20} color="white" />
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: '#22c55e', borderColor: '#0d1117' }}
            />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-sm leading-none">
              ElectVoice AI
            </h2>
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#22c55e' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
              Online · Gemini 1.5 Flash
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          aria-label="Clear chat history"
          title="Clear chat"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
          style={{
            color: '#8b949e',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#8b949e';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      {/* ── Messages area — fills all remaining space ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ minHeight: 0 }}
        id="chat-messages-area"
      >
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} index={index} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-3 animate-fade-in">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF9933, #c94800)' }}
            >
              <Bot size={14} color="white" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-bl-sm"
              style={{
                background: 'rgba(255,153,51,0.07)',
                border: '1px solid rgba(255,153,51,0.18)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="text-xs ml-2" style={{ color: '#8b949e' }}>
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm animate-fade-in"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#fca5a5',
            }}
            role="alert"
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-300 mb-0.5">Error</p>
              <p className="text-xs opacity-80">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested questions — only when fresh ── */}
      {messages.length <= 1 && !isLoading && (
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs font-medium mb-3 flex items-center gap-1.5 justify-center sm:justify-start" style={{ color: '#6e7681' }}>
            <Sparkles size={11} />
            Suggested questions
          </p>
          <div className="flex overflow-x-auto pb-1 gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: 'rgba(255,153,51,0.08)',
                  border: '1px solid rgba(255,153,51,0.22)',
                  color: '#FF9933',
                }}
                aria-label={`Ask: ${q}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input area ── */}
      <div
        className="px-4 pt-3 pb-4 flex-shrink-0"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(13,17,23,0.6)',
        }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,153,51,0.22)',
            transition: 'border-color 0.2s',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,153,51,0.5)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,153,51,0.06)';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,153,51,0.22)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={inputRef}
            id="chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleTextareaInput}
            placeholder="Ask anything about Indian elections..."
            aria-label="Type your election question"
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-sm py-0.5"
            style={{
              color: '#e6edf3',
              minHeight: '24px',
              maxHeight: '120px',
              fontFamily: 'var(--font-sans)',
              lineHeight: '1.6',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
            aria-label="Send message"
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background:
                inputText.trim() && !isLoading
                  ? 'linear-gradient(135deg, #FF9933, #c94800)'
                  : 'rgba(255,255,255,0.08)',
              boxShadow:
                inputText.trim() && !isLoading
                  ? '0 4px 12px rgba(255,153,51,0.3)'
                  : 'none',
            }}
          >
            <Send size={15} color="white" />
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs mt-2" style={{ color: '#3d444d' }}>
          ElectVoice AI · Verify important details with{' '}
          <a
            href="https://eci.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#FF9933', textDecoration: 'none' }}
          >
            eci.gov.in
          </a>
        </p>
      </div>
    </div>
  );
}

/* ── Individual message bubble ── */
function ChatMessage({ message, index }) {
  const isUser = message.role === 'user';
  const text = message.parts?.[0]?.text || '';

  return (
    <div
      className={`flex items-end gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ animationDelay: `${Math.min(index * 0.04, 0.25)}s` }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #1a237e, #283593)'
            : 'linear-gradient(135deg, #FF9933, #c94800)',
        }}
        aria-hidden="true"
      >
        {isUser ? <User size={14} color="white" /> : <Bot size={14} color="white" />}
      </div>

      {/* Bubble */}
      <div
        className={`px-4 py-3 rounded-2xl ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
        style={{
          maxWidth: 'min(80%, 600px)',
          background: isUser
            ? 'linear-gradient(135deg, rgba(26,35,126,0.55), rgba(40,53,147,0.45))'
            : 'rgba(255,153,51,0.07)',
          border: isUser
            ? '1px solid rgba(26,35,126,0.6)'
            : '1px solid rgba(255,153,51,0.15)',
        }}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed" style={{ color: '#e6edf3' }}>
            {text}
          </p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.string.isRequired,
    parts: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

