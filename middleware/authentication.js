const jwt = require("jsonwebtoken");
const User = require("../model/user");
//const key = process.env.TOKEN_KEY
// const user = User.findOne({ email });

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["authorization"];
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    let parsedToken = token.substring(7, token.length);
    console.log("body", parsedToken)

    try {
        const decoded = jwt.decode(parsedToken);
        // req.user2 = decoded;

        console.log("decodesd", decoded)
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

module.exports = verifyToken;