const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Check for token in x-auth-token or Authorization header
    let token = req.header('x-auth-token') || req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Remove 'Bearer ' prefix if present
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (!process.env.JWT_SECRET) {
        // Critical: Do not run without a secret
        console.error('FATAL: JWT_SECRET is not defined in .env');
        return res.status(500).json({ message: 'Server Configuration Error' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};
