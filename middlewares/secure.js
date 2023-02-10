const config = require("config");
const Log = require("./logger");

module.exports = function () {
    if (!config.get("PRIVATE_KEY") || config.get("PRIVATE_KEY") === "") {
        Log.error("FATAL ERROR: Secret key is not defined.");
        process.exit(1);
    }
}