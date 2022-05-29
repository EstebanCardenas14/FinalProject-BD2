const {request, response} = require('express');

const create = async (req = request, res = response) => {
    const { name, price, description, category, image } = req.body;
    res.status(201).send({
        status: `Producto creado correctamente: ${name}`,
    });
};

const update = async (req = request, res = response) => {
    const { name, price, description, category, image } = req.body;
    res.status(200).send({
        status: `Producto actualizado correctamente: ${name}`,
    });
}

const remove = async (req = request, res = response) => {
    const { name, price, description, category, image } = req.body;
    res.status(200).send({
        status: `Producto eliminado correctamente: ${name}`,
    });
}

const getAll = async (req = request, res = response) => {
    res.status(200).send({
        status: 'Productos obtenidos correctamente',
    });
}

module.exports = {
    create,
    update,
    remove,
    getAll,
};