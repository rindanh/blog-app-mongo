const { createError } = require("./errors");
const jwt = require('jsonwebtoken')

const extractValidJWTToken = async (req, res, next) => {
    try {
        const authHeader = await req.get("Authorization");

        if (!authHeader) {
            return next()
        }

        console.log("auth header", authHeader)

        const token = authHeader.substring(7); // remove Bearer prefix from token
        const decodedToken = jwt.decode(token);

        if (!decodedToken) return next()

        const finalDecodedToken = jwt.verify(token, 'secret');

        if (!finalDecodedToken) return next()

        req.userId = decodedToken.user._id
        console.log("user", decodedToken.user)

        next()
    } catch (err) {
        console.log(err)
        next()
    }
}

const authenticated = async (req, res, next) => {
    if (!req.userId) {
        return res.status(401).json({message: 'Unauthorized'})
    }
    next()
}

module.exports = {
    extractValidJWTToken,
    authenticated
}