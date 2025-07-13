const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateUserCreation, validateStoreCreation } = require('../middleware/validation');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [usersResult, storesResult, ratingsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE role != $1', ['admin']),
      pool.query('SELECT COUNT(*) as count FROM stores'),
      pool.query('SELECT COUNT(*) as count FROM ratings')
    ]);
    
    res.json({
      success: true,
      statistics: {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalStores: parseInt(storesResult.rows[0].count),
        totalRatings: parseInt(ratingsResult.rows[0].count)
      }
    });
    
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Create new user
router.post('/users', authenticateToken, requireRole(['admin']), validateUserCreation, async (req, res) => {
  const { name, email, password, address, role } = req.body;
  
  try {
    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role, created_at',
      [name, email, hashedPassword, address, role]
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Create new store
router.post('/stores', authenticateToken, requireRole(['admin']), validateStoreCreation, async (req, res) => {
  const { name, email, address, ownerId, createNewOwner, ownerEmail, ownerPassword, ownerName } = req.body;
  
  try {
    let finalOwnerId = ownerId;
    
    // If creating a new owner, create the user first
    if (createNewOwner && ownerEmail && ownerPassword) {
      // Hash password for new owner
      const hashedPassword = await bcrypt.hash(ownerPassword, 12);
      
      // Create new store owner
      const ownerResult = await pool.query(
        'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [ownerName || `Store Owner for ${name}`, ownerEmail, hashedPassword, address, 'store_owner']
      );
      
      finalOwnerId = ownerResult.rows[0].id;
    }
    
    // If ownerId is provided, verify the user exists and is a store owner
    if (finalOwnerId) {
      const ownerResult = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [finalOwnerId, 'store_owner']
      );
      
      if (ownerResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store owner ID'
        });
      }
    }
    
    // Create store
    const result = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, owner_id, created_at',
      [name, email, address, finalOwnerId || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      store: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create store'
    });
  }
});

// Update user
router.put('/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { name, email, address, role } = req.body;
  
  try {
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 0;
    
    if (name) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name);
    }
    
    if (email) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email);
    }
    
    if (address !== undefined) {
      paramCount++;
      updates.push(`address = $${paramCount}`);
      values.push(address);
    }
    
    if (role) {
      paramCount++;
      updates.push(`role = $${paramCount}`);
      values.push(role);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    paramCount++;
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, address, role, updated_at`;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting admin users
    if (userCheck.rows[0].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }
    
    // Delete user (cascade will handle related records)
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Update store
router.put('/stores/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { name, email, address, ownerId } = req.body;
  
  try {
    // Check if store exists
    const storeCheck = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [id]
    );
    
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    // If ownerId is provided, verify the user exists and is a store owner
    if (ownerId) {
      const ownerResult = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [ownerId, 'store_owner']
      );
      
      if (ownerResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid store owner ID'
        });
      }
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 0;
    
    if (name) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name);
    }
    
    if (email) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email);
    }
    
    if (address !== undefined) {
      paramCount++;
      updates.push(`address = $${paramCount}`);
      values.push(address);
    }
    
    if (ownerId !== undefined) {
      paramCount++;
      updates.push(`owner_id = $${paramCount}`);
      values.push(ownerId || null);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    paramCount++;
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const query = `UPDATE stores SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, address, owner_id, updated_at`;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      message: 'Store updated successfully',
      store: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update store'
    });
  }
});

// Delete store
router.delete('/stores/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if store exists
    const storeCheck = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [id]
    );
    
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    // Delete store (cascade will handle related records)
    await pool.query('DELETE FROM stores WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete store'
    });
  }
});

module.exports = router;
