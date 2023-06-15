require("dotenv").config();
const jwt = require("jsonwebtoken");
const fs = require("fs");

const { redis } = require("../helpers/redis");

const validator = (req, res, next) => {
  ref_token = req.headers?.ref_authorization ? req.headers?.ref_authorization?.split(" ")[1] : undefined;
  token = req.headers?.authorization ? req.headers?.authorization?.split(" ")[1] : req.cookies.token;

  jwt.verify(token, process.env.token_key, (err, decoded) => {

    if (err) {
      if (err.expiredAt && ref_token) {
        jwt.verify(ref_token, process.env.refresh_key, async (err, decoded) => {
          if (err) {
            res
              .status(401)
              .json({ error: `please login again your token is not valid` });
          } else {
            if ( await redis.get(req.body.name)){
              res
                .status(403)
                .json({ error: `please login you are in blacklist` });
            } else {
              let token = jwt.sign(
                { user: decoded.user, id: decoded.id.id, role: decoded.role },
                process.env.token_key,
                { expiresIn: "6s" }
              );
              res.cookie("token", token);
              req.body.user = decoded.user;
              req.body.id = decoded.id;
              req.body.role = decoded.role;
              next();
            }
          }
        });
      } else {
        res
          .status(406)
          .json({ error: `please login again your token is not valid` });
      }
    } else {
      req.body.user = decoded.user;
      req.body.id = decoded.id;
      req.body.role = decoded.role;
      next();
    }
  });
};

const authorization = (req, res, next) => {
  const allRoles = JSON.parse(fs.readFileSync("./permition.json", "utf-8"));
  if (
    req.body.role &&
    allRoles[req.body.role] &&
    allRoles[req.body.role].permitedMethod.includes(req.method) &&
    allRoles[req.body.role].permitedRoutes.includes(req.url)
  ) {
    next();
  } else {
    res.status(403).json({ error: `you are not authorized` });
  }
};

module.exports = { validator, authorization };