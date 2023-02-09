module.exports = function (req, res, next) {
    if (!req.user.is_admin) return res.status(403).send("Acceso denegado.");
    next();
}