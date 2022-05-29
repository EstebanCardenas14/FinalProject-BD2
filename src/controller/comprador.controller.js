const { request, response } = require('express');
const db = require('../database/postgres-connection');
const { validateUser, createUser, updateUser } = require('../helpers/index');

const create = async (req = request, res = response) => {
    const {  id_documento, username, num_doc, nombres, apellidos, telefono, correo, clave  } = req.body;

    try{
        //verify the existence of the buyer
        await validateUser(id_documento, username, num_doc, telefono, correo);
        //create the buyer
        const user = await createUser('Comprador', id_documento, username, num_doc, nombres, apellidos, telefono, correo, clave);
        return res.status(200).json({
            ok: true,
            message: 'Comprador creado',
            comprador: user.rows[0]
        });

    }catch(error){
        return res.status(400).json({
            ok: false,
            message: error
        });
    }

}

const getById = async (req = request, res = response) => {
    try {
        //bring the id of the buyer
        const { id } = req.params;

        //bring the buyer
        const user = await db.query(`SELECT * FROM usuario WHERE usuario_id = '${id}'`);
        //verify that the buyer exists
        if (userVer.rows.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Comprador no encontrado'
            });
        }

        //return the buyer
        return res.status(200).json({
            ok: true,
            message: 'Comprador encontrado',
            user: user.rows
        });

    } catch (error) {
        //if there is an error, return the error
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor'
        });
    }
}

const getAll = async (req = request, res = response) => {
    try {
         const compradores = [];
         const data = await db.query(`SELECT * FROM comprador`);

         for(let resgister in data.rows){
                const user = await db.query(`SELECT * FROM usuario WHERE usuario_id = '${data.rows[resgister].usuario_id}'`);
                compradores.push(user.rows[0]);
            }

        return res.status(200).json({
            ok: true,
            message: 'Compradores encontrados',
            compradores
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor'
        });
    }

}


        //update the buyer
const updateById = async(req = request, res = response) => {
    try {

        const { id } = req.params;
        const { id_documento, username, num_doc, nombres, apellidos, telefono, correo } = req.body;
        //verify that the buyer exists
        const user = await db.query(`SELECT * FROM  WHERE comprador usuario_id = '${id}'`);
        if (user.rows.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'The user is not a buyer'
            });
        }

        //update the user
        const compador = await updateUser(id, id_documento, username, num_doc, nombres, apellidos, telefono, correo);

        return res.status(200).json({
            ok: true,
            message: 'Comprador actualizado',
            comprador
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor'
        });

    }
}


const deleteById = async (req = request, res = response) => {
    try {
        const { id } = req.params;
        //Delete the buyer
        await db.query(`DELETE FROM comprador WHERE id_usuario = ${id}`);
        //Delete the user
        await db.query(`DELETE FROM usuario WHERE id_usuario = ${id}`);
        return res.status(200).json({
            ok: true,
            message: 'Comprador eliminado'
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor'
        });
    }
}



module.exports = {
    create,
    getAll,
    updateById,
    deleteById,
    getById
}