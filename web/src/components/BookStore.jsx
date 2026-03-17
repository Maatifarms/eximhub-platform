import React from 'react';
import { BookOpen, Download, CreditCard, ShoppingCart } from 'lucide-react';

export default function BookStore({ onBuyBook }) {
  return (
    <div className="bookstore-container">
      <div className="store-header">
        <h1>Digital Library</h1>
        <p>Premium trade secrets and market entry guides.</p>
      </div>

      <div className="book-highlight-card">
        <div className="book-preview">
          {/* Mock visual of book cover */}
          <div className="book-cover-art">
            <BookOpen size={64} className="cover-icon" />
            <span>GLOBAL TRADE SECRETS 2026</span>
          </div>
        </div>
        <div className="book-details">
          <div className="book-badge">Best Seller</div>
          <h2>Global Trade Secrets: 2026 Edition</h2>
          <p className="book-description">
            A comprehensive guide on finding international buyers, navigating customs, 
            and scaling your export business to 100+ countries. Written by EximHub's core trade experts.
          </p>
          <div className="book-meta">
            <p><strong>Price:</strong> ₹500</p>
            <p><strong>Format:</strong> Digital PDF / EPUB</p>
          </div>
          <div className="book-actions">
            <button className="btn-buy-book" onClick={() => onBuyBook('Global Trade Secrets', '₹500')}>
              <CreditCard size={18} /> Buy Now (₹500)
            </button>
            <button className="btn-preview">Read Preview</button>
          </div>
        </div>
      </div>

      <section className="my-library-section">
        <h3>My Library</h3>
        <div className="library-grid">
            {/* Empty State placeholder */}
            <div className="empty-library">
                <ShoppingCart size={48} className="text-muted" />
                <p>Your library is empty. Purchased books will appear here.</p>
            </div>
        </div>
      </section>
    </div>
  );
}
