const config = require("config");
const Log = require("./logger");

module.exports = function () {
    if (!config.get("private.key") || config.get("private.key") === "") {
        Log.error("FATAL ERROR: Secret key is not defined.");
        process.exit(1);
    }
}