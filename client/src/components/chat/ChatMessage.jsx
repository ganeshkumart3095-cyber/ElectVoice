import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * ChatMessage — Individual message bubble for user or AI.
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object with role and parts
 * @param {number} props.index - Index in the message list for animation delay
 * @returns {JSX.Element}
 */
const ChatMessage = ({ message, index }) => {
  const isUser = message.role === 'user';
  const text = message.parts?.[0]?.text || '';

  return (
    <div
      className={`flex items-end gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ animationDelay: `${Math.min(index * 0.04, 0.25)}s` }}
    >
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
};

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

export default ChatMessage;
