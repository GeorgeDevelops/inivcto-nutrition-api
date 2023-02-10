const jwt = require("jsonwebtoken");
const config = require("config");
const Log = require("./logger");

module.exports = function (req, res, next) {
    const token = req.header("x-auth-token");
    if (!token || token === "") return res.status(401).send("No token provided.");

    try {
        const decoded = jwt.verify(token, config.get("PRIVATE_KEY"));
        req.user = decoded;
        next();
    } catch (error) {
        Log.error(error.message);
        return res.status(400).send("Invalid token.");
    }
}