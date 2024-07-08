const jwt = require("jsonwebtoken");

const authImg = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization ? authorization.split(" ")[1] : null;

  if (!token) {
    const tokenParam = req.query.t;

    if (tokenParam) {
      try {
        const userInfo = await jwt.verify(tokenParam, process.env.JWT_SECRET);
        req.userInfo = userInfo;
        next();
      } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    try {
      const userInfo = await jwt.verify(token, process.env.JWT_SECRET);
      req.userInfo = userInfo;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
};

module.exports = authImg;
