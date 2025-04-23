const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = (pool) => {
    // Register new user
    router.post('/register', async (req, res) => {
        const { username, password } = req.body;
        
        try {
            // Check if username already exists
            const userExists = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );

            if (userExists.rows.length > 0) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert new user
            const result = await pool.query(
                'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
                [username, hashedPassword]
            );

            const token = jwt.sign(
                { id: result.rows[0].id, username: result.rows[0].username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({ token });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    router.post('/login', async (req, res) => {
        const { username, password } = req.body;
        
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password);
            
            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({ token, username: user.username });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    return router;
};