const { request, response } = require('express');
const db = require('../database/postgres-connection');

const create = async (req = request, res = response) => {
    try {
        //Save the type of document collected in the body
        const { descripcion } = req.body;

        //List of document types
        const rolVar = await db.query( `SELECT * FROM rol WHERE descripcion = '${descripcion}'`);
       
        //Loop through the list of roles to see if the role already exists
        for (let doc in rolVar.rows) {
           
            if (rolVar.rows[doc].descripcion === descripcion) {
                
                return res.status(400).json({
                    ok: false,
                    message: 'El rol ya existe'
                });
            }
        }
        
        //If the document type does not exist, create it
        await db.query(`INSERT INTO rol (descripcion, estado) VALUES ('${descripcion}', ${true})`);
      
        //Get the record of the created role
        const rolResult = await db.query(`SELECT * FROM rol WHERE descripcion = '${descripcion}'`);
        
        //Return the created role
        if (rolResult.rowCount > 0) { 
            return res.status(200).json({
                ok: true,
                rol: rolResult.rows[0]
            });
        }

        //If the role was not created return an error
        return res.status(404).json({
            ok: false,
            message: 'Rol no creado'
        });


    } catch (error) {
        console.log(error);
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al crear el rol',
            error
        });

    }
}

const getById = async (req = request, res = response) => {
    try {

        //Get role id
        const { id } = req.params;

        //get the role
        const rol = await db.query(`SELECT * FROM rol WHERE id_rol = ${id}`);

        //Return the role
        if (rol.rowCount > 0) { 
            return res.status(200).json({
                ok: true,
                rol: rol.rows[0]
            });
        }

        //If the role does not exist return an error
        return res.status(404).json({
            ok: false,
            message: 'No existe el rol'
        });

    } catch (error) {
            
            //If there is an error return the error
            return res.status(500).json({
                ok: false,
                message: 'Error al obtener el rol',
                error
            });
    
        }
}

const getAll = async (req = request, res = response) => {
    try {

        //Get all roles
        const roles = await db.query('SELECT * FROM rol');

        //Return all roles
        if (roles.rowCount > 0) { 
            return res.status(200).json({
                ok: true,
                roles: roles.rows
            });
        }

        //If there are no roles I return an error
        return res.status(404).json({
            ok: false,
            message: 'No hay roles'
        });

    } catch (error) {
            
            //If there is an error return the error
            return res.status(500).json({
                ok: false,
                message: 'Error al obtener los roles',
                error
            });
    
        }
}

const remove = async (req = request, res = response) => {
    try {

        //Get role id
        const { id } = req.params;

        //Get the role
        const rol = await db.query(`SELECT * FROM rol WHERE id_rol = ${id}`);

        //If the role exists, it is removed.
        if (rol.rowCount > 0) { 
            await db.query(`DELETE FROM rol WHERE id_rol = ${id}`);
            return res.status(200).json({
                ok: true,
                message: 'Rol eliminado'
            });
        }

        //If the role does not exist return an error
        return res.status(404).json({
            ok: false,
            message: 'No existe el rol'
        });

    } catch (error) {
            
            //If there is an error return the error
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar el rol',
                error
            });
    
        }
}

const update = async (req = request, res = response) => {
    try {

        //Get role id
        const { id } = req.params;

        //get the role to be updated
        const rol = await db.query(`SELECT * FROM rol WHERE id_rol = ${id}`);

        //Save the description of the collection in the body
        const { descripcion } = req.body;

        //If the role exists, I update it
        if (rol.rowCount > 0) { 
            await db.query(`UPDATE rol SET descripcion = '${descripcion}' WHERE id_rol = ${id}`);
            return res.status(200).json({
                ok: true,
                message: 'Rol actualizado'
            });
        }

        //If the role does not exist return an error
        return res.status(404).json({
            ok: false,
            message: 'No existe el rol'
        });

    } catch (error) {
            
            //If there is an error return the error
            return res.status(500).json({
                ok: false,
                message: 'Error al actualizar el rol',
                error
            });
    
        }
}

module.exports = {
    create,
    getById,
    getAll,
    remove,
    update
}