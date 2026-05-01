import { useState } from 'react';
import { ChevronDown, ChevronRight, MessageCircle, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { sendChatMessage } from '../services/geminiService';
import { ELECTION_STEPS } from '../constants';

/**
 * StepperGuide — An interactive, step-by-step educational guide on the Indian election process.
 * Provides deep-dives into each stage with optional AI explanations.
 * @returns {JSX.Element}
 */
export default function StepperGuide() {
  const [expandedStep, setExpandedStep] = useState(null);
  const [loadingStep, setLoadingStep] = useState(null);
  const { addMessage, setActiveTab, language } = useAppContext();

  /**
   * Toggles the expansion state of a specific step.
   * @param {number} stepId - ID of the step to toggle
   */
  const toggleStep = (stepId) => {
    setExpandedStep((prev) => (prev === stepId ? null : stepId));
  };

  /**
   * Triggers a Gemini AI explanation for a specific step.
   * @param {Object} step - The step object containing the prompt
   * @param {Event} event - React click event to stop propagation
   */
  const askGeminiAboutStep = async (step, event) => {
    event.stopPropagation();
    setLoadingStep(step.id);

    try {
      const userMessage = { role: 'user', parts: [{ text: step.geminiPrompt }] };
      addMessage(userMessage);
      setActiveTab('chat');

      const response = await sendChatMessage([userMessage], language);
      addMessage({ role: 'model', parts: [{ text: response }] });
    } catch (err) {
      addMessage({
        role: 'model',
        parts: [{ text: `Explanation error: ${err.message}` }],
      });
    } finally {
      setLoadingStep(null);
    }
  };

  return (
    <div className="space-y-3">
      <header className="text-center mb-6">
        <h2 className="font-display font-bold text-2xl text-gradient-saffron mb-2">Indian Election Process</h2>
        <p className="text-sm text-gray-500">From announcement to government formation</p>
      </header>

      <div className="steps-container">
        {ELECTION_STEPS.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            index={index}
            isLast={index === ELECTION_STEPS.length - 1}
            isExpanded={expandedStep === step.id}
            isLoading={loadingStep === step.id}
            onToggle={() => toggleStep(step.id)}
            onAskAI={(e) => askGeminiAboutStep(step, e)}
          />
        ))}
      </div>

      <CompletionBadge />
    </div>
  );
}

/**
 * StepItem — Renders a single stage of the election process.
 */
function StepItem({ step, index, isLast, isExpanded, isLoading, onToggle, onAskAI }) {
  return (
    <div className="relative animate-fade-in-up" style={{ animationDelay: `${index * 0.07}s` }}>
      {!isLast && <div className="step-connector" />}

      <div className={`step-card ${isExpanded ? 'expanded' : ''}`} style={isExpanded ? { borderColor: `${step.color}44` } : {}}>
        <button onClick={onToggle} className="step-header">
          <div className="step-icon-container">
            <div className="step-icon" style={{ background: isExpanded ? step.color : '', borderColor: isExpanded ? step.color : '' }}>
              {step.icon}
            </div>
            <div className="step-number" style={{ background: isExpanded ? step.color : '' }}>
              {step.id}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="step-title" style={{ color: isExpanded ? step.color : '' }}>{step.title}</p>
            <p className="step-subtitle">{step.subtitle}</p>
            <p className="step-summary">{step.summary}</p>
          </div>

          <div className="step-chevron">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>

        {isExpanded && (
          <div className="step-details-container">
            <div className="step-details" dangerouslySetInnerHTML={{ __html: formatMarkdown(step.details) }} />
            <button onClick={onAskAI} disabled={isLoading} className="ask-ai-btn" style={{ color: step.color, borderColor: `${step.color}44` }}>
              <MessageCircle size={14} />
              {isLoading ? 'Getting explanation...' : 'Ask AI to explain this step →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Basic markdown-to-HTML formatter for step details.
 * @param {string} text - Raw markdown text
 */
function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

const CompletionBadge = () => (
  <div className="completion-badge">
    <CheckCircle size={18} color="#138808" />
    <span className="text-sm font-medium">All 7 stages of the Indian election process</span>
  </div>
);
