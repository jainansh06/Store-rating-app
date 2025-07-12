const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRating } = require('../middleware/validation');

const router = express.Router();

// Submit or update rating
router.post('/stores/:storeId', authenticateToken, requireRole(['user']), validateRating, async (req, res) => {
  const { storeId } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if store exists
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [storeId]
    );
    
    if (storeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    // Insert or update rating
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id)
       DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
       RETURNING id, rating, created_at, updated_at`,
      [userId, storeId, rating]
    );
    
    res.json({
      success: true,
      message: 'Rating submitted successfully',
      rating: result.rows[0]
    });
    
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
});

// Get user's rating for a specific store
router.get('/stores/:storeId/my-rating', authenticateToken, requireRole(['user']), async (req, res) => {
  const { storeId } = req.params;
  const userId = req.user.id;
  
  try {
    const result = await pool.query(
      'SELECT rating, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        rating: null
      });
    }
    
    res.json({
      success: true,
      rating: result.rows[0]
    });
    
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating'
    });
  }
});

// Get all ratings for a store (store owner only)
router.get('/stores/:storeId', authenticateToken, requireRole(['store_owner', 'admin']), async (req, res) => {
  const { storeId } = req.params;
  
  try {
    // If store owner, verify they own the store
    if (req.user.role === 'store_owner') {
      const storeCheck = await pool.query(
        'SELECT id FROM stores WHERE id = $1 AND owner_id = $2',
        [storeId, req.user.id]
      );
      
      if (storeCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }
    
    const result = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.id as user_id, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    
    res.json({
      success: true,
      ratings: result.rows
    });
    
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store ratings'
    });
  }
});

// Get all ratings (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.id as user_id, u.name as user_name, u.email as user_email,
              s.id as store_id, s.name as store_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       JOIN stores s ON r.store_id = s.id
       ORDER BY r.created_at DESC`
    );
    
    res.json({
      success: true,
      ratings: result.rows
    });
    
  } catch (error) {
    console.error('Get all ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings'
    });
  }
});

module.exports = router;