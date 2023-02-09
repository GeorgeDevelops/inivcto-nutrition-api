const { Schema, model } = require("mongoose");
const date = new Date();

const schema = new Schema({
    customerId: String,
    orderId: String
});

const Customer = model("customer", schema);

module.exports = Customer;