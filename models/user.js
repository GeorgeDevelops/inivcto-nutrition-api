const { Schema, model, default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
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
    address: {
        street: String,
        sector: String,
        city: String,
        reference: String
    },
    first_purchase: {
        made: {
            type: Boolean,
            default: false
        },
        date: {
            type: String,
            default: null
        }
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    terms_and_conditions: {
        type: Boolean,
        default: false
    },
    privacy_policy: {
        type: Boolean,
        default: false
    },
    card_payment_security_policy: {
        type: Boolean,
        default: false
    },
    cancelation_policy: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: String,
        default: date.toLocaleDateString("ES-es")
    }
});

schema.methods.generateJWT = function () {
    const token = jwt.sign({ _id: this._id, firstName: this.first_name }, process.env.PRIVATE_KEY);
    return token;
}

const User = model("user", schema);

module.exports = User;