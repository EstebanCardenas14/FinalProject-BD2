const { request, response } = require('express');
const db = require('../database/postgres-connection');
const { validateUser, createUser, updateUser } = require('../helpers/index');
const Comprador = require('../models/Neo4j/comprador');
const comprador = new Comprador();

const create = async (req = request, res = response) => {
    const { id_documento, username, num_doc, nombres, apellidos, telefono, correo, clave } = req.body;

    try {
        //verify the existence of the buyer
        await validateUser(id_documento, username, num_doc, telefono, correo);
        //create the buyer
        const user = await createUser('Comprador', id_documento, username, num_doc, nombres, apellidos, telefono, correo, clave);
        const CompradorDB = await db.query(`SELECT * FROM comprador WHERE usuario_id = ${user.usuario_id}`);
        if (CompradorDB.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El Comprador no existe'
            });
        }
        //create the buyer in the neo4j database
        const compradorNeo = { comprador_id : CompradorDB.rows[0].comprador_id, nombres: user.nombres, apellidos: user.apellidos, num_doc: user.num_doc };
        console.log('COMPRADOR NEO --> '.yellow,compradorNeo);
        const neoComprador = await comprador.createComprador(compradorNeo);
        return res.status(200).json({
            ok: true,
            message: 'Comprador creado',
            comprador: user,
            neoComprador : neoComprador
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: error
        });
    }

}

module.exports = {
    create
}