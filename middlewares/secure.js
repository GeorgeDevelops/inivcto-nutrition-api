const Log = require("./logger");

module.exports = function () {
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "") {
        Log.error("FATAL ERROR: Secret key is not defined.");
        process.exit(1);
    }
}