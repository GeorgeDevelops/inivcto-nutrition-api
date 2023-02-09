const { connect } = require("mongoose");
const config = require("config");
const Log = require("./logger");

module.exports = function () {
    connect(config.get("db.URI"), () => {
        Log.info(`Server connected to MongoDB Database...`);
    });
}