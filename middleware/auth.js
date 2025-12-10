const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.status(403).json({ error: 'Already authenticated' });
  }
  return next();
};

module.exports = { isAuthenticated, isGuest };
