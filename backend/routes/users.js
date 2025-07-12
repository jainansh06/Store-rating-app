const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query;
  
  try {
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             s.id as store_id, s.name as store_name,
             COALESCE(AVG(r.rating), 0) as store_rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    // Add filters
    if (name) {
      paramCount++;
      query += ` AND u.name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
    }
    
    if (email) {
      paramCount++;
      query += ` AND u.email ILIKE $${paramCount}`;
      params.push(`%${email}%`);
    }
    
    if (address) {
      paramCount++;
      query += ` AND u.address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
    }
    
    if (role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
    }
    
    query += ` GROUP BY u.id, s.id, s.name`;
    
    // Add sorting
    const validSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY u.${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY u.name ASC`;
    }
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      users: result.rows
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
              s.id as store_id, s.name as store_name,
              COALESCE(AVG(r.rating), 0) as store_rating
       FROM users u
       LEFT JOIN stores s ON u.id = s.owner_id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE u.id = $1
       GROUP BY u.id, s.id, s.name`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

module.exports = router;