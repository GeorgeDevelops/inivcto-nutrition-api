const express = require("express");
const app = express();
const Log = require("./middlewares/logger");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

// Routes Files 

const adminRoute = require("./routes/admins");
const userAuthenticationRoute = require("./routes/auth");
const productsRoute = require("./routes/products");
const ordersRoute = require("./routes/orders");
const emailRoute = require("./routes/email");
const paypalRoute = require("./routes/paypal");
const customerRoute = require("./routes/customers");
const promoRoute = require("./routes/promos");
const paymentRoute = require("./routes/payments");

// Catching exceptions and unhandle promises
process.on("connection", (stream) => {
    Log.info("There has been a new connection", stream);
});

process.on('exit', async (code) => {
    Log.info('Process exit event with code: ', code);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    Log.error("uncaughtException : ", error);
    process.exit(1);
});

process.on("unhandledRejection", (error) => {
    Log.error("unhandledRejection", error);
    process.exit(1);
});


// Middlewares 
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());
require('dotenv').config();
require("./middlewares/db")();
require("./middlewares/secure")();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Test route
app.get("/api", async (req, res) => {
    try {
        return res.status(200).json({ status: 200, outcome: "SUCCESS" });
    } catch (error) {
        return res.status(500).json({ status: 500, outcome: "FAIL" });
    }
});

app.use("/api", adminRoute);
app.use("/api", userAuthenticationRoute);
app.use("/api", productsRoute);
app.use("/api", ordersRoute);
app.use("/api", emailRoute);
app.use("/api", paypalRoute);
app.use("/api", customerRoute);
app.use("/api", promoRoute);
app.use("/api", paymentRoute);

// Listener
const port = process.env.PORT || 5000;
app.listen(port, () => Log.info(`Listening on PORT: ${port}`));