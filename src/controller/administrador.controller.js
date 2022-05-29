const { request, response } = require('express');
const db = require('../database/postgres-connection');
const { validateUser, createUser, updateUser } = require('../helpers/index');

const create = async (req = request, res = response) => {
    const {  id_documento, username, num_doc, nombres, apellidos, telefono, correo, clave  } = req.body;
    try{
        //verify the existence of the user
        await validateUser(id_documento, username, num_doc, telefono, correo);
        //create the administrator
        const user = await createUser('Administrador', id_documento, username, num_doc, nombres, apellidos, telefono, correo, clave);
        return res.status(200).json({
            ok: true,
            message: 'Administrador creado correctamente',
            administrador : user.rows[0]
        });

    }catch(error){
        return res.status(400).json({
            ok: false,
            message: error
        });
    }
}
