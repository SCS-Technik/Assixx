// auth.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

async function authenticateUser(username, password) {
  console.log(`Attempting to authenticate user: ${username}`);
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      console.log(`User not found: ${username}`);
      return null;
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      console.log(`User authenticated successfully: ${username}`);
      return user;
    } else {
      console.log(`Invalid password for user: ${username}`);
      return null;
    }
  } catch (error) {
    console.error(`Error during authentication for user ${username}:`, error);
    throw error;
  }
}

function generateToken(user) {
  console.log(`Generating token for user: ${user.username}`);
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }
  try {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log(`Token generated successfully for user: ${user.username}`);
    return token;
  } catch (error) {
    console.error(`Error generating token for user ${user.username}:`, error);
    throw error;
  }
}

function authenticateToken(req, res, next) {
  console.log('Entering authenticateToken middleware');
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Extracted token:', token);

  if (token == null) {
    console.log('No token provided');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    console.log('Token verified successfully. User:', user);
    req.user = user;
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    console.log(`Authorizing role. Required: ${role}, User role: ${req.user.role}`);
    if (req.user.role !== role) {
      console.log(`Authorization failed: User ${req.user.username} does not have required role ${role}`);
      return res.status(403).send('Unauthorized');
    }
    console.log(`User ${req.user.username} authorized for role ${role}`);
    next();
  };
}

module.exports = { authenticateUser, generateToken, authenticateToken, authorizeRole };