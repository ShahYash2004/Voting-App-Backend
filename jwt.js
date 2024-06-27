const jwt = require("jsonwebtoken");
require('dotenv').config();


const jwtAuthMiddleware = (req, res, next) => {

  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: "Unauthorized!!" });

  // Extract the JWT token from the request header
  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized!" });

  try {
    //verify the JWT token
   const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.jwtUserData = decoded;

    next();
  } catch (e) {
    res.status(401).json({ error: "invald=id token" });
  }
};

//function to generate token
const generateToken = (userData) => {
  return jwt.sign(userData, process.env.SECRET_KEY,{ expiresIn: '1d' });
};

module.exports = { jwtAuthMiddleware, generateToken };
