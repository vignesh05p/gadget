const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Function to generate random codenames
function generateRandomCodename() {
    const adjectives = ['Silent', 'Shadow', 'Midnight', 'Golden', 'Crimson', 'Phantom', 'Crystal', 'Steel', 'Iron', 'Swift'];
    const nouns = ['Eagle', 'Ghost', 'Phoenix', 'Dragon', 'Wolf', 'Falcon', 'Viper', 'Panther', 'Tiger', 'Hawk'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `The ${randomAdjective} ${randomNoun}`;
}

module.exports = (pool, authenticateToken) => {
    // Get all gadgets
    router.get('/', authenticateToken, async (req, res) => {
        try {
            const { status } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            let queryText = 'SELECT COUNT(*) OVER() as total_count, * FROM gadgets';
            const params = [];
            let paramCount = 1;

            if (status) {
                queryText += ` WHERE status = $${paramCount}`;
                params.push(status);
                paramCount++;
            }

            queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            params.push(limit, offset);

            const { rows } = await pool.query(queryText, params);
            
            const totalCount = rows.length > 0 ? parseInt(rows[0].total_count) : 0;
            const totalPages = Math.ceil(totalCount / limit);
            
            const gadgetsWithProbability = rows.map(gadget => ({
                ...gadget,
                mission_success_probability: Math.floor(Math.random() * 100) + '%',
                total_count: undefined // Remove this from individual items
            }));

            res.json({
                gadgets: gadgetsWithProbability,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: limit
                }
            });
        } catch (err) {
            console.error('Error fetching gadgets:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Add new gadget
    router.post('/', authenticateToken, async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Gadget name is required' });
            }
            
            const codename = generateRandomCodename();
            const { rows } = await pool.query(
                'INSERT INTO gadgets (name, codename, status) VALUES ($1, $2, $3) RETURNING *',
                [name, codename, 'Available']
            );
            res.status(201).json(rows[0]);
        } catch (err) {
            console.error('Error adding gadget:', err);
            if (err.code === '23505') { // Unique violation
                res.status(400).json({ error: 'A gadget with this codename already exists' });
            } else {
                res.status(500).json({ error: 'Internal server error: ' + err.message });
            }
        }
    });

    // Update gadget
    router.patch('/:id', authenticateToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, status } = req.body;
            const updateFields = [];
            const values = [];
            let paramCount = 1;

            if (name) {
                updateFields.push(`name = $${paramCount}`);
                values.push(name);
                paramCount++;
            }
            if (status) {
                updateFields.push(`status = $${paramCount}`);
                values.push(status);
                paramCount++;
            }

            values.push(id);
            const query = `
                UPDATE gadgets 
                SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $${paramCount} 
                RETURNING *
            `;

            const { rows } = await pool.query(query, values);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Gadget not found' });
            }
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Delete (decommission) gadget
    router.delete('/:id', authenticateToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { rows } = await pool.query(
                `UPDATE gadgets 
                SET status = 'Decommissioned', 
                    decommissioned_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 
                RETURNING *`,
                [id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Gadget not found' });
            }
            res.json(rows[0]);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Self-destruct sequence
    router.post('/:id/self-destruct', authenticateToken, async (req, res) => {
        try {
            const { id } = req.params;
            const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { rows } = await pool.query(
                `UPDATE gadgets 
                SET status = 'Destroyed', 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 
                RETURNING *`,
                [id]
            );
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Gadget not found' });
            }
            res.json({
                message: 'Self-destruct sequence initiated',
                confirmationCode,
                gadget: rows[0]
            });
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};