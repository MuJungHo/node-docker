const jwt = require('jsonwebtoken');

const verifyPadToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, 'pad-key');
    // console.log(decoded)
    req.roomId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


module.exports = verifyPadToken;