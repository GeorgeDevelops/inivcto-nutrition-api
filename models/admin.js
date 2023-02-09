const { Schema, model, default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const date = new Date();

const schema = new Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    cedula: {
        type: String,
        required: true,
        maxLength: 11
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    is_admin: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: String,
        default: date.toLocaleDateString("ES-es")
    }
});

schema.methods.generateJWT = function () {
    const token = jwt.sign({ _id: this._id, firstName: this.first_name, lastName: this.last_name, is_admin: this.is_admin }, config.get("private.key"), { algorithm: 'HS256' });
    return token;
}

const Admin = model("admin", schema);

module.exports = Admin;