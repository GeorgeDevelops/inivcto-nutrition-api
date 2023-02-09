const mongoose = require("mongoose");
const date = new Date();

const promoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    start: { type: String, default: date.toLocaleDateString("es-ES") },
    deadline: { type: String, required: true },
    type: { type: String, required: true },
    discount: { type: Number, required: true },
    enabled: { type: Boolean, default: true }
});

const Promo = mongoose.model("promo", promoSchema);

module.exports = Promo;