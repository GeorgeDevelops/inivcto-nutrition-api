const { Schema, model } = require("mongoose");
const date = new Date();

const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    weight: {
        type: [Object],
        required: true
    },
    brand: {
        type: Object,
        required: true
    },
    images: {
        type: [Object],
        required: true
    },
    category: {
        type: Object,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    published: {
        type: String,
        required: true,
        default: date.toLocaleDateString("ES-es")
    }
});

const Product = model("product", schema);

module.exports = Product;