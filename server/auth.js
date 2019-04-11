const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

var api = require("./api")

const auth = function(req,res, next){
  const token = req.body.token ||
                req.query.token ||
                req.headers['authorization'];

  if(!token){
    res.status(401).send('Unauthorized: No token provied');
  } else {
    jwt.verify(token,secret,function(err,decoded){
      if(err){
        res.status(401).send('Unauthorzied: Invalid token');
      } else {
        req.email = decoded.email;
        if(api[req.email]==undefined){
          res.status(401).send('Unauthorzied: Invalid token');
        }
        next();
      }
    })
  }
}

module.exports = auth;