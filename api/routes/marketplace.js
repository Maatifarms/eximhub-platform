const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const DEFAULT_BOOK = {
  title: 'Global Trade Secrets: 2026 Edition',
  description: 'A practical export growth guide covering buyer discovery, sourcing strategy, customs readiness, and market-entry execution.',
  price: 499,
  fileUrl: 'protected_books/ebook-exim.pdf',
};

async function ensureDefaultBook() {
  const [existing] = await db.execute('SELECT id, title, description, price, file_url FROM books WHERE title = ? LIMIT 1', [DEFAULT_BOOK.title]);

  if (existing.length > 0) {
    const book = existing[0];
    await db.execute(
      `UPDATE books
       SET description = COALESCE(description, ?),
           price = ?,
           file_url = ?
       WHERE id = ?`,
      [DEFAULT_BOOK.description, DEFAULT_BOOK.price, DEFAULT_BOOK.fileUrl, book.id]
    );

    return {
      ...book,
      description: book.description || DEFAULT_BOOK.description,
      price: DEFAULT_BOOK.price,
      file_url: DEFAULT_BOOK.fileUrl,
    };
  }

  const [result] = await db.execute(
    'INSERT INTO books (title, description, price, file_url) VALUES (?, ?, ?, ?)',
    [DEFAULT_BOOK.title, DEFAULT_BOOK.description, DEFAULT_BOOK.price, DEFAULT_BOOK.fileUrl]
  );

  return {
    id: result.insertId,
    title: DEFAULT_BOOK.title,
    description: DEFAULT_BOOK.description,
    price: DEFAULT_BOOK.price,
    file_url: DEFAULT_BOOK.fileUrl,
  };
}

async function findBookById(bookId) {
  const [rows] = await db.execute('SELECT id, title, description, price, file_url FROM books WHERE id = ? LIMIT 1', [bookId]);
  return rows[0] || null;
}

router.get('/books', async (req, res) => {
  try {
    await ensureDefaultBook();
    const [books] = await db.execute('SELECT id, title, description, price, file_url FROM books ORDER BY created_at DESC');
    res.json({ success: true, data: books });
  } catch (error) {
    console.error('BOOKS_LIST_ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to load books' });
  }
});

router.post('/buy-book', auth, async (req, res) => {
  const { bookId, paymentId } = req.body;
  const userId = req.user.id;

  if (!bookId) {
    return res.status(400).json({ success: false, message: 'bookId is required' });
  }

  try {
    await ensureDefaultBook();
    const book = await findBookById(bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const normalizedPaymentId = paymentId || `LOCALPAY-${Date.now()}`;

    const [existingPurchase] = await db.execute(
      'SELECT id FROM purchases WHERE user_id = ? AND book_id = ? LIMIT 1',
      [userId, bookId]
    );

    if (existingPurchase.length === 0) {
      await db.execute(
        'INSERT INTO purchases (user_id, book_id, payment_id) VALUES (?, ?, ?)',
        [userId, bookId, normalizedPaymentId]
      );
    }

    res.json({
      success: true,
      message: 'Payment captured. Book added to your library.',
      data: {
        bookId: book.id,
        title: book.title,
        price: book.price,
        paymentId: normalizedPaymentId,
      },
    });
  } catch (error) {
    console.error('BUY_BOOK_ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to complete book purchase' });
  }
});

router.get('/library', auth, async (req, res) => {
  const sql = `
    SELECT DISTINCT b.id, b.title, b.description, b.price, b.file_url
    FROM books b
    JOIN purchases p ON b.id = p.book_id
    WHERE p.user_id = ?
    ORDER BY b.created_at DESC
  `;

  try {
    await ensureDefaultBook();
    const [library] = await db.execute(sql, [req.user.id]);
    res.json({ success: true, data: library });
  } catch (error) {
    console.error('LIBRARY_ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to load library' });
  }
});

router.get('/books/:bookId/download', auth, async (req, res) => {
  const bookId = Number(req.params.bookId);

  if (!Number.isInteger(bookId) || bookId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid book id' });
  }

  try {
    const [purchases] = await db.execute(
      'SELECT id FROM purchases WHERE user_id = ? AND book_id = ? LIMIT 1',
      [req.user.id, bookId]
    );

    if (purchases.length === 0) {
      return res.status(403).json({ success: false, message: 'Purchase required before download' });
    }

    const book = await findBookById(bookId);
    if (!book || !book.file_url) {
      return res.status(404).json({ success: false, message: 'Book file not found' });
    }

    const filePath = path.join(__dirname, '..', book.file_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Stored ebook file is missing' });
    }

    const safeFileName = `${book.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    return fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('DOWNLOAD_BOOK_ERROR:', error);
    return res.status(500).json({ success: false, message: 'Failed to download book' });
  }
});

module.exports = router;
