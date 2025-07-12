const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all stores
router.get('/', authenticateToken, async (req, res) => {
  const { name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
  
  try {
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
             u.name as owner_name,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    // Add filters
    if (name) {
      paramCount++;
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
    }
    
    if (address) {
      paramCount++;
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
    }
    
    query += ` GROUP BY s.id, u.name`;
    
    // Add sorting
    const validSortFields = ['name', 'email', 'address', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY s.${sortBy} ${sortOrder.toUpperCase()}`;
    } else if (sortBy === 'rating') {
      query += ` ORDER BY average_rating ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY s.name ASC`;
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      stores: result.rows
    });
    
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores'
    });
  }
});

// Get store by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
              u.name as owner_name,
              COALESCE(AVG(r.rating), 0) as average_rating,
              COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN users u ON s.owner_id = u.id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = $1
       GROUP BY s.id, u.name`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    res.json({
      success: true,
      store: result.rows[0]
    });
    
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store'
    });
  }
});

// Get stores owned by current user (store owner only)
router.get('/owner/my-stores', authenticateToken, requireRole(['store_owner']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at,
              COALESCE(AVG(r.rating), 0) as average_rating,
              COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      stores: result.rows
    });
    
  } catch (error) {
    console.error('Get owned stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owned stores'
    });
  }
});

module.exports = router;