const jwt = require("jsonwebtoken");

const getUser = async (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization) {
    const token = authorization.split(" ")[1];
    if (token) {
      try {
        const userInfo = await jwt.verify(token, process.env.JWT_SECRET);
        req.userInfo = userInfo;
        return res.status(200).json({ user: userInfo });
      } catch (error) {
        return res.status(401).json({ message: "unauthorized" });
      }
    } else {
      return res.status(401).json({ message: "unauthorized" });
    }
  } else {
    return res.status(401).json({ message: "unauthorized" });
  }
};

module.exports = getUser;
