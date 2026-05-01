import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { sendChatMessage } from '../services/geminiService';
import { saveChatMessage } from '../services';
import ChatMessage from './chat/ChatMessage';

const SUGGESTED_QUESTIONS = [
  'How do I register to vote?',
  'What is Form 6?',
  'How does EVM work?',
  'What is NOTA?',
  'How are votes counted?',
  'What is Model Code of Conduct?',
];

/**
 * ChatWindow — Full-height conversational AI interface.
 * Orchestrates message flow between user, state, and Gemini service.
 * @returns {JSX.Element}
 */
export default function ChatWindow() {
  const { messages, addMessage, clearChat, language } = useAppContext();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /**
   * Handles sending a message to the AI.
   * @param {string} [text] - Optional text to override input field
   */
  const handleSend = useCallback(
    async (text) => {
      const messageText = (text || inputText).trim();
      if (!messageText || isLoading) return;

      setInputText('');
      setError(null);

      const userMessage = { role: 'user', parts: [{ text: messageText }] };
      addMessage(userMessage);
      setIsLoading(true);

      // Track interaction
      saveChatMessage(messageText, language);

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

  /**
   * Adjusts textarea height dynamically based on content.
   */
  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex flex-col w-full" style={{ height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 glass-border-bottom">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-saffron-gradient">
              <Bot size={20} color="white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 status-online" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-sm">ElectVoice AI</h2>
            <p className="text-xs text-green-400">Online · Gemini 1.5</p>
          </div>
        </div>
        <button onClick={clearChat} className="clear-btn">
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ minHeight: 0 }}>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} index={index} />
        ))}
        {isLoading && <TypingIndicator />}
        {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <div className="px-4 pt-3 pb-4 flex-shrink-0 border-t border-white/5 bg-black/20">
        {messages.length <= 1 && !isLoading && (
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
              <Sparkles size={10} /> Suggestions
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => handleSend(q)} className="suggestion-pill">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="chat-input-container">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            onInput={handleTextareaInput}
            placeholder="Ask anything about elections..."
            rows={1}
            disabled={isLoading}
          />
          <button onClick={() => handleSend()} disabled={isLoading || !inputText.trim()} className="send-btn">
            <Send size={15} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Animated typing indicator for AI.
 */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-saffron-gradient">
        <Bot size={14} color="white" />
      </div>
      <div className="typing-bubble">
        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
      </div>
    </div>
  );
}

/**
 * Error display banner.
 */
function ErrorBanner({ message, onClose }) {
  return (
    <div className="error-banner">
      <AlertCircle size={16} />
      <span className="flex-1">{message}</span>
      <button onClick={onClose}>✕</button>
    </div>
  );
}
