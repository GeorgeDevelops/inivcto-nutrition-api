const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const bcrypt = require("bcrypt");
const Log = require("./../middlewares/logger");
const _ = require("lodash");
const admin = require("./../middlewares/admin");
const auth = require("./../middlewares/authenticated");

router.get("/users", [auth, admin], async (req, res) => {
    try {
        const users = await User.find({});
        let response = [];
        users.forEach(user => {
            let object = _.pick(user, ["first_name", "last_name", "phone", "email", "address", "createdAt", "_id", "isAdmin"])
            response.push(object);
            object = null;
        });
        return res.status(200).send(response);
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.get("/users/:id", auth, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user || user === "") return res.status(404).send("Este usuario no existe.")
        let obj = _.pick(user, ["first_name", "last_name", "phone", "email", "address", "createdAt", "_id"]);
        return res.status(200).send(obj);
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.post("/signup", async (req, res) => {
    let body = req.body;
    const { first_name, last_name, phone, email, address, privacy_policy, password } = req.body;

    try {
        if (!body.first_name || body.first_name === "") return res.status(400).send("Primer nombre no puede estar vacio.");
        if (body.first_name.length < 3) return res.status(400).send("Primer nombre debe ser al menos 3 caracteres de longitud.");
        if (body.first_name.length > 25) return res.status(400).send("Primer nombre demasiado largo");

        if (!body.email || body.email === "") return res.status(400).send("Correo electronico no puede estar vacio.");
        if (!body.email.includes("@")) return res.status(400).send("Correo electronico no valido");
        if (!body.email.includes(".")) return res.status(400).send("Correo electronico no valido");
        if (body.email.length < 13) return res.status(400).send("Correo electronico debe ser al menos 13 caracteres de longitud.");
        if (body.email.length > 45) return res.status(400).send("Correo electronico demasiado largo");

        if (!body.last_name || body.last_name === "") return res.status(400).send("Apellido no puede estar vacio.");
        if (body.last_name.length < 3) return res.status(400).send("Apellido debe ser al menos 3 caracteres de longitud.");
        if (body.last_name.length > 25) return res.status(400).send("Apellido nombre demasiado largo");

        if (!body.phone || body.phone === "") return res.status(400).send("Telefono no puede estar vacio.");
        if (body.phone.length < 10) return res.status(400).send("Telefono debe ser al menos 10 caracteres de longitud.");
        if (body.phone.length > 11) return res.status(400).send("Telefono demasiado largo");

        if (!body.password || body.password === "") return res.status(400).send("Contraseña no puede estar vacio.");
        if (body.password.length < 8) return res.status(400).send("Contraseña debe ser al menos 8 caracteres de longitud.");
        if (body.password.length > 25) return res.status(400).send("Contraseña nombre demasiado largo");

        if (!privacy_policy) return res.status(400).send("Debe aceptar las politicas de privacidad");

        const duplicated = await User.find({ email: email });
        if (duplicated.length > 0) return res.status(400).send("Esta cuenta ya existe.");

        let encrypted = await bcrypt.hash(password, 10);

        const user = new User({
            first_name: first_name,
            last_name: last_name,
            phone: phone,
            email: email,
            address: address,
            password: encrypted,
            privacy_policy: privacy_policy,
        });
        await user.save();

        let token = user.generateJWT();
        return res.header("x-auth-token", token).header("access-control-expose-headers", "x-auth-token").status(200).send("Se ha registrado exitosamente!");
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (Object.values(req.body).length < 2) return res.status(400).send("Solicitud Invalida.")

        const user = await User.findOne({ email: email });
        if (!user || user === "") return res.status(404).send("Correo o contraseña incorrecta");

        const isCorrect = await bcrypt.compare(password, user.password);
        if (!isCorrect) return res.status(404).send("Correo o contraseña incorrecta");

        const token = user.generateJWT();

        return res
            .header("x-auth-token", token)
            .header("access-control-expose-headers", "x-auth-token")
            .status(200)
            .send("Has iniciado seccion exitosamente.");
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.put("/users/:id/update", auth, async (req, res) => {
    const { body, params } = req;
    let { id } = params;
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).send("Esta cuenta no existe.");

        const updated = await User.findByIdAndUpdate({ _id: id }, body, { new: true });

        let keys = Object.keys(body);
        for (let key of keys) {
            // console.log(`${updated[key]} - ${body[key]}`);
            if (updated[key] !== body[key]) return res.status(400).send("Informacion no actualizada.");
            return res.status(200).send("Informacion actualizada exitosamente.");
        }
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.delete("/delete/:id", [auth, admin], async (req, res) => {
    const { params } = req;
    const { id } = params;
    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).send("Esta cuenta ya no existe.");
        await user.remove();
        return res.status(200).send("Cuenta eliminada exitosamente.");
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

module.exports = router;

