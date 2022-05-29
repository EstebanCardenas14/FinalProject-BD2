const { request, response } = require('express');
const db = require('../database/postgres-connection');
const {uploadFile} = require('../helpers/upload-file');

const create = async (req = request, res = response) => {
    try{
        //Get the name of the marca
        const { imagen,nombre } = req.body;

        //validate if the marca already exists
        const marca = await db.query(`SELECT * FROM marca WHERE nombre = '${nombre}'`);

        //If the marca was found, I return an error
        if(marca.rowCount > 0){
            return res.status(400).json({
                ok: false,
                message: 'La marca ya existe'
            });
        }

        //If the marca was not found, I create the marca
        const create = await db.query(`INSERT INTO marca (imagen,nombre, estado) VALUES ('${imagen}','${nombre}', ${true}) RETURNING *`);
        if(create.rowCount > 0){
            return res.status(200).json({
                ok: true,
                marca: create.rows[0]
            });
        }

        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al crear la marca',
            error
        });


    }catch(error){
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });
    }
}

const getAll = async (req = request, res = response) => {
    try{
        //Get all the marca
        const marca = await db.query('SELECT * FROM marca');

        //If the marca was found, I return the marca
        if(marca.rowCount > 0){
            return res.status(200).json({
                ok: true,
                marcas: marca.rows
            });
        }

        //If the marca was not found, I return an error
        return res.status(404).json({
            ok: false,
            message: 'No se encontraron marcas'
        });

    }catch(error){
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al obtener las marcas',
            error
        });
    }
}

const getById = async (req = request, res = response) => {
    try{
        //Get the id of the marca
        const { id } = req.params;

        //Get the marca
        const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${id}`);

        //If the marca was found, I return the marca
        if(marca.rowCount > 0){
            return res.status(200).json({
                ok: true,
                marca: marca.rows[0]
            });
        }

        //If the marca was not found, I return an error
        return res.status(404).json({
            ok: false,
            message: 'No se encontró la marca'
        });

    }catch(error){
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al obtener la marca',
            error
        });
    }
}

const update = async (req = request, res = response) => {
    try{
        const { id } = req.params;
        const { nombre } = req.body;
        const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${id}`);

        //If the marca was found, I update the marca
        if(marca.rowCount > 0){
            update = await db.query(`UPDATE marca SET nombre = '${nombre}' WHERE marca_id = ${id} RETURNING *`);
            return res.status(200).json({
                ok: true,
                message: 'Marca actualizada',
                marca: update.rows[0]
            });
        }

        //If the marca was not found, I return an error
        return res.status(404).json({
            ok: false,
            message: 'No se encontró la marca'
        });

    }catch(error){
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al actualizar la marca',
            error
        });
    }
}

const deleteById = async (req = request, res = response) => {
    try{
        const { id } = req.params;
        const marca = await db.query(`SELECT * FROM marca WHERE marca_id = ${id}`);

        //If the marca was found, I delete the marca
        if(marca.rowCount > 0){
            await db.query(`DELETE FROM marca WHERE marca_id = ${id}`);
            return res.status(200).json({
                ok: true,
                message: 'Marca eliminada'
            });
        }

        //If the marca was not found, I return an error
        return res.status(404).json({
            ok: false,
            message: 'No se encontró la marca'
        });

    }catch(error){
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al eliminar la marca',
            error
        });
    }
}

const uploadImg = async (req = request, res = response) => {
    try{

        const path = await uploadFile(req.files.archivo,['png', 'jpg', 'jpeg'] ,'marca/');
        const pathRoute = `${process.env.ROUTE_IMG}/storage/marca/`+ path;
        //console.log(pathRoute);
        
        res.status(200).json({
            ok: true,
            message: 'Imagen subida con exito',
            pathRoute
        });

    }
    catch(error){
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al actualizar la imagen de la marca',
            error
        });
    }
}



module.exports = {
    create,
    getAll,
    getById,
    update,
    deleteById,
    uploadImg
}

   