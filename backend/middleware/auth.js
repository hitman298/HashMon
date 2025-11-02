const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-client');

// Initialize JWKS client for Privy
const client = jwksClient({
  jwksUri: process.env.PRIVY_JWKS_URL || 'https://auth.privy.io/api/v1/apps/cmaujz0q401hfl50mnjeyzl0d/jwks.json',
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
});

// Function to get signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Privy authentication middleware
const authenticatePrivy = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid authorization header provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Verify JWT token using Privy's JWKS
  jwt.verify(token, getKey, {
    audience: process.env.PRIVY_APP_ID,
    issuer: 'https://auth.privy.io',
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user info to request
    req.user = {
      id: decoded.sub,
      walletAddress: decoded.wallet?.address,
      email: decoded.email,
      privyId: decoded.sub
    };

    next();
  });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7);

  jwt.verify(token, getKey, {
    audience: process.env.PRIVY_APP_ID,
    issuer: 'https://auth.privy.io',
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }

    req.user = {
      id: decoded.sub,
      walletAddress: decoded.wallet?.address,
      email: decoded.email,
      privyId: decoded.sub
    };

    next();
  });
};

module.exports = {
  authenticatePrivy,
  optionalAuth
};
