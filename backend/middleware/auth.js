const jwt = require('jsonwebtoken');
const util = require('../Utilities/util');

const auth = {
    verifyToken: (req, res, next) => {
        if (!req.headers.token) {
           return res.send({"code":util.statusCode.FOUR_ZERO_ONE, "message":"Invalid token !!"})
        }
        jwt.verify(req.headers.token, util.secret, (err, decoded) => {
            if (err) {
                res.send({"code":"401", "message":"Invalid token !!", "error":err})
            } else {
                req.user=decoded;
                next();
            }
        })
    }
}

module.exports = auth;