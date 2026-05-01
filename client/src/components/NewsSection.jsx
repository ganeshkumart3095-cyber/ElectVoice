import { useState, useEffect, useCallback } from 'react';
import { Search, ExternalLink, RefreshCw, Newspaper } from 'lucide-react';
import PropTypes from 'prop-types';
import { fetchElectionNews } from '../services/searchService';

/**
 * NewsSection — Aggregates and displays live election news from multiple sources.
 * Integrates with the backend news aggregation service.
 * @returns {JSX.Element}
 */
export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('India election 2024');
  const [inputValue, setInputValue] = useState('');

  /**
   * Fetches news articles based on a search query.
   * @param {string} query - The search term
   */
  const loadNews = useCallback(async (query = 'India election 2024') => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await fetchElectionNews(query);
      setNews(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews(searchQuery);
  }, [loadNews, searchQuery]);

  /**
   * Handles search form submission.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSearchQuery(inputValue.trim());
  };

  return (
    <div className="space-y-4">
      <SectionHeader isLoading={isLoading} onRefresh={() => loadNews(searchQuery)} />
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            placeholder="Search election topics..."
            className="search-input"
          />
        </div>
        <button onClick={handleSearch} disabled={isLoading} className="search-btn">Search</button>
      </div>

      <TopicChips onSelect={(topic) => { setInputValue(topic); setSearchQuery(topic); }} />

      {error && <div className="error-banner">❌ {error}</div>}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <NewsCardSkeleton key={i} />)
        ) : news.length === 0 ? (
          <EmptyState />
        ) : (
          news.map((item, index) => <NewsCard key={index} item={item} index={index} />)
        )}
      </div>
      
      <footer className="text-[10px] text-center text-gray-700">
        Powered by Google Custom Search · Aggregated from verified sources
      </footer>
    </div>
  );
}

// Sub-components
const SectionHeader = ({ isLoading, onRefresh }) => (
  <div className="flex items-center justify-between pt-4">
    <div>
      <h2 className="font-display font-bold text-2xl text-gradient-saffron">Election News</h2>
      <p className="text-sm text-gray-500">Latest from ECI, NDTV, The Hindu & more</p>
    </div>
    <button onClick={onRefresh} disabled={isLoading} className="refresh-btn">
      <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
    </button>
  </div>
);

function NewsCard({ item, index }) {
  const getFavicon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-card animate-fade-in-up group" style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-white group-hover:text-saffron transition-colors mb-2">{item.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.snippet}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={getFavicon(item.displayLink)} alt="" width={14} className="rounded-sm" />
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">{item.displayLink}</span>
          </div>
          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-saffron transition-opacity" />
        </div>
      </div>
    </a>
  );
}

const NewsCardSkeleton = () => (
  <div className="news-card skeleton-card">
    <div className="skeleton h-4 w-5/6 mb-2" />
    <div className="skeleton h-3 w-full mb-1" />
    <div className="skeleton h-3 w-3/4" />
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-30">
    <Newspaper size={48} />
    <p className="text-sm">No results found for this topic.</p>
  </div>
);

const TopicChips = ({ onSelect }) => (
  <div className="flex flex-wrap gap-2">
    {['ECI 2024', 'Voter ID', 'EVM Security', 'Model Code'].map((topic) => (
      <button key={topic} onClick={() => onSelect(topic)} className="topic-chip">{topic}</button>
    ))}
  </div>
);

NewsCard.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    snippet: PropTypes.string.isRequired,
    displayLink: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};
