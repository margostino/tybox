import { useEffect, useRef, useState } from 'react';
import './RealTimeFeed.css';

interface FeedItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'random';
  timestamp: Date;
  data: {
    quote?: {
      id?: number;
      text: string;
      author: string;
    };
    message?: string;
    user?: string;
  };
}

export default function RealTimeFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastEventIdRef = useRef<string | null>(null);

  const connectSSE = () => {
    try {
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new SSE connection with last event ID if available
      const url = lastEventIdRef.current
        ? `/v1/feed/stream?lastEventId=${encodeURIComponent(lastEventIdRef.current)}`
        : '/v1/feed/stream';

      console.log('Connecting to SSE with URL:', url, 'Last Event ID:', lastEventIdRef.current);

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        console.log('SSE connection established');
      };

      eventSource.onmessage = (event) => {
        try {
          const feedItem: FeedItem = JSON.parse(event.data);
          feedItem.timestamp = new Date(feedItem.timestamp);

          setFeedItems((prev) => {
            // Add new item at the beginning and keep only last 50 items
            const updated = [feedItem, ...prev].slice(0, 50);
            return updated;
          });
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        setConnectionError('Connection lost. Reconnecting...');

        eventSource.close();
        eventSourceRef.current = null;

        // Implement exponential backoff for reconnection
        const attempts = reconnectAttemptsRef.current;
        const delay = Math.min(1000 * Math.pow(2, attempts), 30000); // Max 30 seconds

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectSSE();
        }, delay);
      };

      // Listen for specific event types
      eventSource.addEventListener('quote-created', (event) => {
        if (event.lastEventId) {
          lastEventIdRef.current = event.lastEventId;
        }
        const data = JSON.parse(event.data);
        const feedItem: FeedItem = {
          id: `create-${Date.now()}`,
          type: 'create',
          timestamp: new Date(),
          data: { quote: data.quote, user: data.user }
        };
        setFeedItems((prev) => [feedItem, ...prev].slice(0, 50));
      });

      eventSource.addEventListener('quote-updated', (event) => {
        if (event.lastEventId) {
          lastEventIdRef.current = event.lastEventId;
        }
        const data = JSON.parse(event.data);
        const feedItem: FeedItem = {
          id: `update-${Date.now()}`,
          type: 'update',
          timestamp: new Date(),
          data: { quote: data.quote, user: data.user }
        };
        setFeedItems((prev) => [feedItem, ...prev].slice(0, 50));
      });

      eventSource.addEventListener('quote-deleted', (event) => {
        if (event.lastEventId) {
          lastEventIdRef.current = event.lastEventId;
        }
        const data = JSON.parse(event.data);
        const feedItem: FeedItem = {
          id: `delete-${Date.now()}`,
          type: 'delete',
          timestamp: new Date(),
          data: {
            quote: { id: data.id, text: data.text || 'Deleted quote', author: data.author || 'Unknown' },
            user: data.user
          }
        };
        setFeedItems((prev) => [feedItem, ...prev].slice(0, 50));
      });

      eventSource.addEventListener('quote-random', (event) => {
        if (event.lastEventId) {
          lastEventIdRef.current = event.lastEventId;
        }
        const data = JSON.parse(event.data);
        const feedItem: FeedItem = {
          id: `random-${Date.now()}`,
          type: 'random',
          timestamp: new Date(),
          data: { quote: data.quote, user: data.user }
        };
        setFeedItems((prev) => [feedItem, ...prev].slice(0, 50));
      });

    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      setConnectionError('Failed to connect to feed');
    }
  };

  useEffect(() => {
    connectSSE();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const clearAllFeeds = async () => {
    try {
      const response = await fetch('/v1/feed/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        // Clear local feed items immediately
        setFeedItems([]);
        console.log('Feed cleared successfully');

        // Reset last event ID to get fresh events
        lastEventIdRef.current = null;
      } else {
        console.error('Failed to clear feed');
      }
    } catch (error) {
      console.error('Error clearing feed:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getFeedItemIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'random': return '🎲';
      default: return '📝';
    }
  };

  const getFeedItemMessage = (item: FeedItem) => {
    const user = item.data.user || 'John Doe';
    switch (item.type) {
      case 'create':
        return `${user} added a new quote`;
      case 'update':
        return `${user} updated a quote`;
      case 'delete':
        return `${user} deleted a quote`;
      case 'random':
        return `${user} shared a random quote`;
      default:
        return 'Feed update';
    }
  };

  return (
    <aside className="feed-container">
      <div className="feed-header">
        <h3>📡 Live Feed</h3>
        <div className="feed-header-controls">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Connected' : connectionError || 'Disconnected'}
          </div>
          {feedItems.length > 0 && (
            <button
              className="clear-feed-button"
              onClick={clearAllFeeds}
              title="Clear all feed items"
            >
              🗑️ Clear
            </button>
          )}
        </div>
      </div>

      <div className="feed-content">
        {feedItems.length === 0 ? (
          <div className="feed-empty">
            <p>No activity yet</p>
            <p className="feed-empty-subtitle">Updates will appear here in real-time</p>
          </div>
        ) : (
          <div className="feed-items">
            {feedItems.map((item) => (
              <div key={item.id} className={`feed-item feed-item-${item.type}`}>
                <div className="feed-item-header">
                  <span className="feed-item-icon">{getFeedItemIcon(item.type)}</span>
                  <span className="feed-item-time">{formatTime(item.timestamp)}</span>
                </div>
                <div className="feed-item-message">
                  {getFeedItemMessage(item)}
                </div>
                {item.data.quote && (
                  <div className="feed-item-quote">
                    <blockquote>"{item.data.quote.text}"</blockquote>
                    <cite>— {item.data.quote.author}</cite>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
