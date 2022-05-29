const {request, response} = require('express');

const create = async (req = request, res = response) => {
    const { name, email, password } = req.body;
    res.status(201).send({
        status: `Usuario creado correctamente: ${name}`,
    });
};

const update = async (req = request, res = response) => {
    const { name, email, password } = req.body;
    res.status(200).send({
        status: `Usuario actualizado correctamente: ${name}`,
    });
}

const remove = async (req = request, res = response) => {
    const { name, email, password } = req.body;
    res.status(200).send({
        status: `Usuario eliminado correctamente: ${name}`,
    });
}

const getAll = async (req = request, res = response) => {
    res.status(200).send({
        status: 'Usuarios obtenidos correctamente',
    });
}

module.exports = {
    create,
    update,
    remove,
    getAll,
};
