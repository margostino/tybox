import React, { useEffect, useState } from 'react';
import './App.css';
import QuoteManager from './QuoteManager';

interface Quote {
  id: number;
  text: string;
  author: string;
}

interface QuoteResponse {
  success: boolean;
  data: Quote;
  timestamp: string;
}

interface SearchResponse {
  success: boolean;
  data: Quote[];
  count: number;
  timestamp: string;
}

function App() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Quote[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Tab states
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'manage'>('home');

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/v1/quotes/random');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QuoteResponse = await response.json();

      if (data.success) {
        setQuote(data.data);
      } else {
        throw new Error('Failed to fetch quote');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching quote:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchQuotes = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search term');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setShowSearchResults(true);

    try {
      const response = await fetch(`/v1/quotes/search?q=${encodeURIComponent(searchQuery)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        throw new Error('Failed to search quotes');
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error searching quotes:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchQuotes();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setShowSearchResults(false);
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">
          Hello World!
        </h1>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            🏠 Random
          </button>
          <button
            className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Search
          </button>
          <button
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            ⚙️ Manage
          </button>
        </div>

        {/* Home Tab - Random Quote */}
        {activeTab === 'home' && (
          <>

        <div className="quote-container">
          {loading && (
            <div className="loading">Loading quote...</div>
          )}

          {error && (
            <div className="error">
              <p>Error: {error}</p>
              <button onClick={fetchQuote} className="button">
                Try Again
              </button>
            </div>
          )}

          {quote && !loading && !error && (
            <div className="quote">
              <blockquote className="quote-text">
                "{quote.text}"
              </blockquote>
              <cite className="quote-author">
                — {quote.author}
              </cite>
            </div>
          )}
        </div>

        <button
          onClick={fetchQuote}
          className="button button-primary"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get New Quote'}
        </button>
          </>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="search-section">
            <h2 className="search-title">Search Quotes</h2>
            <div className="search-container">
              <div className="search-box">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Search quotes by text or author..."
                  className="search-input"
                />
                <button
                  onClick={searchQuotes}
                  className="button button-search"
                  disabled={searchLoading}
                >
                  {searchLoading ? '...' : '🔍'}
                </button>
                {showSearchResults && (
                  <button
                    onClick={clearSearch}
                    className="button button-clear"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Search Results */}
            {showSearchResults && (
              <div className="search-results">
                {searchLoading && (
                  <div className="loading">Searching...</div>
                )}

                {searchError && !searchLoading && (
                  <div className="error">
                    <p>Error: {searchError}</p>
                  </div>
                )}

                {!searchLoading && !searchError && searchResults.length === 0 && (
                  <div className="no-results">
                    <p>No quotes found matching "{searchQuery}"</p>
                  </div>
                )}

                {!searchLoading && !searchError && searchResults.length > 0 && (
                  <>
                    <div className="results-count">
                      Found {searchResults.length} quote{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    <div className="results-list">
                      {searchResults.map((result) => (
                        <div key={result.id} className="search-result-item">
                          <blockquote className="result-quote">
                            "{result.text}"
                          </blockquote>
                          <cite className="result-author">
                            — {result.author}
                          </cite>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <QuoteManager />
        )}
      </div>

      <div className="footer">
        <p>Built with React + Vite + TypeScript</p>
        <p className="tech-stack">
          Backend: Express | Database: PostgreSQL | Cache: Redis
        </p>
      </div>
    </div>
  );
}

export default App;
