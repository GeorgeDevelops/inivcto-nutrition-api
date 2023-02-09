const Joi = require('joi');

const schema = Joi.object({

    first_name: Joi.string().min(4).max(15).required(),

    last_name: Joi.string().min(4).max(15).required(),

    cedula: Joi.string().min(11).required(),

    email: Joi.string().email(),

    phone: Joi.string().min(10).max(15).required(),


    password: Joi.string().min(8).max(30).required()
});

module.exports.Validator = schema;

const product = Joi.object({
    name: Joi.string().max(50).required(),
    brand: Joi.object().length(2).keys({
        id: Joi.number().required(),
        name: Joi.string().required()
    }),
    images: Joi.array().required(),
    weight: Joi.array().required(),
    category: Joi.object().length(2).keys({
        id: Joi.number().required(),
        name: Joi.string().required()
    }),
    description: Joi.string().required()
});

module.exports.ProductValidator = product;
