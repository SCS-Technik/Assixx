const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth Header:', authHeader);
  console.log('Extracted Token:', token);

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err);
      return res.sendStatus(403);
    }
    
    console.log('Verified User:', user);
    req.user = user;
    next();
  });
}

function authorizeRole(role) {
  return (req, res, next) => {
    console.log('User role:', req.user.role); // Fügen Sie diesen Log hinzu
    console.log('Required role:', role); // Fügen Sie diesen Log hinzu
    if (req.user.role !== role) {
      return res.status(403).send('Unauthorized');
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };