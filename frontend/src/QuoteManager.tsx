import { useEffect, useState } from 'react';
import './QuoteManager.css';
import { Quote } from './models';

interface QuoteManagerProps {
  onQuoteUpdate?: () => void;
}

function QuoteManager({ onQuoteUpdate }: QuoteManagerProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [formData, setFormData] = useState({ text: '', author: '' });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [pageSize] = useState(10); // Fixed page size of 10 items per page

  const fetchQuotes = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/v1/quotes?page=${page}&limit=${pageSize}`);
      if (!response.ok) throw new Error('Failed to fetch quotes');
      const data = await response.json();
      
      // Expecting backend to return: { data: quotes[], pagination: { page, limit, total, totalPages } }
      setQuotes(data.data || []);
      
      if (data.pagination) {
        setCurrentPage(data.pagination.page || page);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalQuotes(data.pagination.total || data.data?.length || 0);
      } else {
        // Fallback if backend doesn't support pagination yet
        setTotalPages(Math.ceil((data.data?.length || 0) / pageSize));
        setTotalQuotes(data.data?.length || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async () => {
    if (!formData.text.trim() || !formData.author.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/v1/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create quote');

      const data = await response.json();
      // After creating, go back to first page to see the new quote
      setCurrentPage(1);
      fetchQuotes(1);
      setFormData({ text: '', author: '' });
      setIsAddMode(false);
      onQuoteUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote');
    } finally {
      setLoading(false);
    }
  };

  const updateQuote = async () => {
    if (!editingQuote) return;
    if (!formData.text.trim() || !formData.author.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/v1/quotes/${editingQuote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update quote');

      const data = await response.json();
      setQuotes(quotes.map(q => q.id === editingQuote.id ? data.data : q));
      setFormData({ text: '', author: '' });
      setIsEditMode(false);
      setEditingQuote(null);
      onQuoteUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quote');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuote = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/v1/quotes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete quote');

      setQuotes(quotes.filter(q => q.id !== id));
      setDeleteConfirmId(null);
      onQuoteUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quote');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({ text: quote.text, author: quote.author });
    setIsEditMode(true);
    setIsAddMode(false);
  };

  const cancelForm = () => {
    setFormData({ text: '', author: '' });
    setIsAddMode(false);
    setIsEditMode(false);
    setEditingQuote(null);
    setError(null);
  };

  useEffect(() => {
    fetchQuotes(currentPage);
  }, [currentPage]);

  return (
    <div className="quote-manager">
      <div className="manager-header">
        <h2 className="manager-title">Quote Manager</h2>
        <div className="header-buttons">
          <button
            onClick={() => fetchQuotes(currentPage)}
            className="button button-refresh"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <button
            onClick={() => {
              setIsAddMode(true);
              setIsEditMode(false);
              setFormData({ text: '', author: '' });
            }}
            className="button button-add"
            disabled={isAddMode || isEditMode}
          >
            + Add New Quote
          </button>
        </div>
      </div>

      {error && (
        <div className="manager-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="error-close">✕</button>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAddMode || isEditMode) && (
        <div className="quote-form">
          <h3>{isEditMode ? 'Edit Quote' : 'Add New Quote'}</h3>
          <div className="form-group">
            <label htmlFor="quote-text">Quote Text</label>
            <textarea
              id="quote-text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              placeholder="Enter the quote text..."
              rows={3}
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <label htmlFor="quote-author">Author</label>
            <input
              id="quote-author"
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Enter the author's name..."
              className="form-input"
            />
          </div>
          <div className="form-buttons">
            <button
              onClick={isEditMode ? updateQuote : createQuote}
              className="button button-save"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Quote' : 'Save Quote'}
            </button>
            <button
              onClick={cancelForm}
              className="button button-cancel"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quotes List */}
      <div className="quotes-list">
        {loading && !quotes.length ? (
          <div className="loading">Loading quotes...</div>
        ) : quotes.length === 0 ? (
          <div className="no-quotes">
            <p>No quotes yet. Add your first quote!</p>
          </div>
        ) : (
          <div className="quotes-grid">
            {quotes.map((quote) => (
              <div key={quote.id} className="quote-card">
                <div className="quote-content">
                  <blockquote className="quote-text">"{quote.text}"</blockquote>
                  <cite className="quote-author">— {quote.author}</cite>
                </div>
                <div className="quote-actions">
                  <button
                    onClick={() => startEdit(quote)}
                    className="action-button edit-button"
                    disabled={isEditMode || isAddMode || loading}
                    title="Edit quote"
                  >
                    ✏️
                  </button>
                  {deleteConfirmId === quote.id ? (
                    <div className="delete-confirm">
                      <span>Delete?</span>
                      <button
                        onClick={() => deleteQuote(quote.id)}
                        className="action-button confirm-delete"
                        disabled={loading}
                        title="Confirm delete"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="action-button cancel-delete"
                        title="Cancel delete"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(quote.id)}
                      className="action-button delete-button"
                      disabled={isEditMode || isAddMode || loading}
                      title="Delete quote"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                {quote.createdAt && (
                  <div className="quote-meta">
                    <small>Added: {new Date(quote.createdAt).toLocaleDateString()}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="manager-footer">
        <span className="quote-count">
          Total Quotes: {totalQuotes} | Showing page {currentPage} of {totalPages}
        </span>
        
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1 || loading}
            className="pagination-btn pagination-first"
            title="First page"
          >
            ⏮️
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
            className="pagination-btn pagination-prev"
            title="Previous page"
          >
            ◀️
          </button>
          
          <div className="pagination-pages">
            {/* Show page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                  className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
            className="pagination-btn pagination-next"
            title="Next page"
          >
            ▶️
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || loading}
            className="pagination-btn pagination-last"
            title="Last page"
          >
            ⏭️
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuoteManager;
