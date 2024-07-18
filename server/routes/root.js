const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// Admin-Benutzer erstellen
router.post('/create-admin', authenticateToken, authorizeRole('root'), async (req, res) => {
  console.log(`Attempt to create admin user by root user: ${req.user.username}`);
  try {
    const adminData = { ...req.body, role: 'admin' };
    const adminId = await User.create(adminData);
    console.log(`Admin user created successfully with ID: ${adminId}`);
    res.status(201).json({ message: 'Admin-Benutzer erfolgreich erstellt', adminId });
  } catch (error) {
    console.error('Fehler beim Erstellen des Admin-Benutzers:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ein Benutzer mit diesem Benutzernamen oder dieser E-Mail existiert bereits.' });
    }
    res.status(500).json({ message: 'Fehler beim Erstellen des Admin-Benutzers', error: error.message });
  }
});

// Liste aller Admin-Benutzer abrufen
router.get('/admins', authenticateToken, authorizeRole('root'), async (req, res) => {
  console.log(`Fetching admin users list for root user: ${req.user.username}`);
  try {
    const admins = await User.findByRole('admin');
    console.log(`Retrieved ${admins.length} admin users`);
    res.json(admins);
  } catch (error) {
    console.error('Fehler beim Abrufen der Admin-Benutzer:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Admin-Benutzer', error: error.message });
  }
});

module.exports = router;