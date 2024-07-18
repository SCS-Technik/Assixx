require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const db = require('./database');
const User = require('./models/user');
const { authenticateUser, generateToken, authenticateToken, authorizeRole } = require('./auth');
const rootRoutes = require('./routes/root');
const adminRoutes = require('./routes/admin');
const employeeRoutes = require('./routes/employee');
const securityMiddleware = require('./middleware/security');
const documentRoutes = require('./routes/documents');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(securityMiddleware);
app.use(morgan('dev'));

// Logging Middleware
app.use((req, res, next) => {
  const token = req.headers['authorization'];
  console.log('Received token:', token);
  next();
});

// Routen
app.use('/root', authenticateToken, authorizeRole('root'), rootRoutes);
app.use('/admin', authenticateToken, authorizeRole('admin'), adminRoutes);
app.use('/employee', authenticateToken, authorizeRole('employee'), employeeRoutes);
app.use('/documents', authenticateToken, documentRoutes);

// Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Registrierungsroute
app.post('/register', async (req, res) => {
  try {
    const userId = await User.create(req.body);
    console.log(`User registered successfully with ID: ${userId}`);
    res.status(201).json({ message: 'Benutzer erfolgreich registriert', userId });
  } catch (error) {
    console.error('Registrierungsfehler:', error);
    res.status(500).json({ message: 'Fehler bei der Registrierung', error: error.message });
  }
});

// Anmelderoute
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for user: ${username}`);
    const user = await authenticateUser(username, password);
    if (user) {
      const token = generateToken(user);
      console.log(`Login successful for user: ${username}`);
      res.json({ message: 'Login erfolgreich', token, role: user.role });
    } else {
      console.log(`Login failed for user: ${username}`);
      res.status(401).json({ message: 'Ungültige Anmeldeinformationen' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Interner Serverfehler' });
  }
});

// Root Dashboard Route
app.get('/root-dashboard', (req, res) => {
  console.log('Accessing root dashboard');
  res.sendFile(path.join(__dirname, 'public', 'root-dashboard.html'));
});

app.get('/api/dashboard-data', authenticateToken, authorizeRole('root'), (req, res) => {
  console.log('Sending dashboard data');
  res.json({
    message: 'Dies sind die Root-Dashboard-Daten',
    user: req.user
  });
});

// Root Dashboard Data Route
app.get('/api/root-dashboard-data', authenticateToken, authorizeRole('root'), (req, res) => {
  console.log('Fetching root dashboard data');
  res.json({
    message: 'Dies sind die Root-Dashboard-Daten',
    user: req.user
  });
});

// Fehlerbehandlung für nicht gefundene Routen
app.use((req, res, next) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).send("Sorry, diese Seite wurde nicht gefunden!");
});

// Allgemeine Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error(`500 - Internal Server Error: ${err.stack}`);
  res.status(500).send('Etwas ist schief gelaufen!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));