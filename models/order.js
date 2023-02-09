const { required } = require("joi");
const { Schema, model } = require("mongoose");
const date = new Date();

const schema = new Schema({
    orderId: String,
    customerId: String,
    content: [Object],
    total: Number,
    status: {
        type: String,
        required: true,
        default: "pendiente"
    },
    isPaid: Boolean,
    payment_details: {
        type: Object,
        required: true
    },
    date: {
        type: String,
        required: true,
        default: date.toLocaleDateString("ES-es")
    }
});

const Order = model("order", schema);

module.exports = Order;