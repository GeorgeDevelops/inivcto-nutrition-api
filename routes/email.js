const express = require("express");
const router = express.Router();
const Log = require("./../middlewares/logger");
const emailEngine = require("./../tools/emailengine");

router.post("/email/contact", async (req, res) => {
    const { sender, name, subject, message } = req.body;
    const secret_key = process.env.EMAIL_SECRET_KEY;
    let options = {
        from: `"Invicto Nutrition Support - " <${process.env.EMAIL_USER}>`,
        to: `invictonutrition@gmail.com`,
        subject: `${subject} | Invicto Nutrition Contact Form`,
        template: "formMessage",
        context: {
            content: message,
            name,
            sender
        }
    }
    try {
        if (!secret_key || secret_key === "") return res.status(403).send("Unauthorized. Check settings");
        if (!sender || sender === "") return res.status(400).send("ERROR: Sender is not defined.");
        if (!subject || subject === "") return res.status(400).send("ERROR: Subject not defined.");
        if (!message || message === "") return res.status(400).send("ERROR: Message not defined.");

        const email = await emailEngine.sendMail(options);
        if (!email.messageId) return res.status(400).send("Algo ha salido mal enviar email");

        let reply = {
            from: `"Invicto Nutrition Soporte - " <${process.env.EMAIL_USER}>`,
            to: `${sender}`,
            subject: `${subject} | Invicto Nutrition Mensaje de Confirmacion`,
            template: "contact",
            context: { name }
        };

        await emailEngine.sendMail(reply);

        return res.status(200).send("Email sent.");
    } catch (err) {
        Log.error(`An Internal error has occurred. ==> ${err.message}`);
        return res.status(500).send("Ha ocurrido un error, por favor comuniquese con soporte");
    }
});
router.post("/thank-you-for-your-registration", async (req, res) => {
    const { name, coupon, email } = req.body;
    const secret_key = process.env.EMAIL_SECRET_KEY;

    let options = {
        from: `"Invicto Nutrition Support - " <${process.env.EMAIL_USER}>`,
        to: `${email}`,
        subject: `Gracias por registrarte | Invicto Nutrition`,
        template: "signup",
        context: {
            name,
            coupon
        }
    }

    if (!secret_key || secret_key === "") return res.status(403).send("Unauthorized. Check settings");
    if (!name || name === "") return Log.error("An error occurred - Name was not defined.");
    if (!coupon || coupon === "") return Log.error("An error occurred - Coupon was not defined.");

    try {
        const email = await emailEngine.sendMail(options);
        if (!email.messageId) return res.status(400).send("Algo ha salido mal enviar email");

        return res.status(200).send("Email sent.")
    } catch (err) {
        Log.error(`An Internal error has occurred. ==> ${err.message}`);
        return res.status(500).send("Ha ocurrido un error, por favor comuniquese con soporte");
    }
});
router.post("/thank-you-for-your-purchase", async (req, res) => {
    const { name, email, orderId } = req.body;
    const secret_key = process.env.EMAIL_SECRET_KEY;

    let options = {
        from: `"Invicto Nutrition Support - " <${process.env.EMAIL_USER}>`,
        to: `${email}`,
        subject: `Gracias por tu compra | Invicto Nutrition`,
        template: "order",
        context: {
            name,
            orderId
        }
    }

    if (!secret_key || secret_key === "") return res.status(403).send("Unauthorized. Check settings");
    if (!name || name === "") return Log.error("An error occurred - Name was not defined.");

    try {
        const email = await emailEngine.sendMail(options);
        if (!email.messageId) return res.status(400).send("Algo ha salido mal enviar email");

        return res.status(200).send("Email sent.")
    } catch (err) {
        Log.error(`An Internal error has occurred. ==> ${err.message}`);
        return res.status(500).send("Ha ocurrido un error, por favor comuniquese con soporte");
    }
});
router.post("/admin/email/send", async (req, res) => {
    const { email, name, subject, content } = req.body;
    try {
        const secret_key = process.env.EMAIL_SECRET_KEY;


        if (!secret_key || secret_key === "") return res.status(403).send("Unauthorized. Check settings");
        if (!email || email === "") return res.status(400).send("ERROR: Email is not defined.");
        if (!subject || subject === "") return res.status(400).send("ERROR: Subject not defined.");
        if (!content || content === "") return res.status(400).send("ERROR: Contenido not defined.");

        let options = {
            from: `"Invicto Nutrition Support - " <${process.env.EMAIL_USER}>`,
            to: `${email}`,
            subject: `${subject} | Invicto Nutrition Support`,
            template: "email",
            context: {
                content,
                name
            }
        }

        const mail = await emailEngine.sendMail(options);
        if (!mail.messageId) return res.status(400).send("Algo ha salido mal enviar email");

        return res.status(200).send("Correo enviado.");
    } catch (err) {
        Log.error(`An Internal error has occurred. ==> ${err.message}`);
        return res.status(500).send("Ha ocurrido un error, por favor comuniquese con soporte");
    }
});

module.exports = router; 