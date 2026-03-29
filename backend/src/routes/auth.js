const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../context/prisma');

// Registration Endpoint
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAccount = await prisma.accounts.findUnique({ where: { email } });
        if (existingAccount) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAccount = await prisma.accounts.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ email: newAccount.email, id: newAccount.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, name: newAccount.name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const account = await prisma.accounts.findUnique({ where: { email } });
        if (!account) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: account.email, id: account.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ token, name: account.name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
