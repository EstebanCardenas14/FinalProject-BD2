const { request, response } = require('express');
const db = require('../database/postgres-connection');
const { uploadFile, deleteFile } = require('../helpers');

const create = async (req = request, res = response) => {
    const { producto_id } = req.params;
    const { precio, descripcion, caracteristicas, stock } = req.body;
    try {

        //verify the existence of the product
        const producto = await db.query(`SELECT * FROM producto WHERE producto_id = ${producto_id}`);
        if (producto.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        //verify precio is a number
        if (isNaN(precio)) {
            return res.status(400).json({
                ok: false,
                message: 'El precio debe ser un número'
            });
        }

        //verify stock is a number
        if (isNaN(stock)) {
            return res.status(400).json({
                ok: false,
                message: 'El stock debe ser un número'
            });
        }

        //create the variante
        const createVariante = await db.query(`INSERT INTO variante (producto_id,precio,descripcion,caracteristicas,stock,estado) VALUES (${producto_id},${precio},'${descripcion}','${caracteristicas}',${stock},${true}) RETURNING *`);
        if (createVariante.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear la variante',
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Variante creada',
            variante: createVariante.rows[0]
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            type: 'Error en el servidor',
            error
        });
    }

};

const uploadImg = async (req = request, res = response) => {

    const { variante_id } = req.params;

    try {

        //verify the existence of the variante
        const variante = await db.query(`SELECT * FROM variante WHERE variante_id = ${variante_id}`);
        if (variante.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La variante no existe'
            });
        }

        //upload the image
        const path = await uploadFile(req.files.archivo, ['png', 'jpg', 'jpeg'], 'variante/');
        const pathRoute = `${process.env.ROUTE_IMG}/storage/variante/` + path;
        if(!pathRoute){
            return res.status(400).json({
                ok: false,
                message: 'Error al subir la imagen'
            });
        }
        let description = `Foto de la variante de : ${variante.rows[0].descripcion}, con id de variante : ${variante.rows[0].variante_id}`;
        //save the photo
        const savePhoto = await db.query(`INSERT INTO foto_variante (variante_id,imagen,descripcion,estado) VALUES (${variante_id},'${pathRoute}','${description}',${true}) RETURNING *`);

        res.status(200).json({
            ok: true,
            message: 'Imagen subida con exito',
            foto: savePhoto.rows[0]
        });

    }
    catch (error) {
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al actualizar la imagen de la marca',
            error
        });
    }
}

const getVariant = async (req = request, res = response) => {
    try {

        const { variante_id } = req.params;
        const variante = await db.query(`SELECT * FROM variante WHERE variante_id = ${variante_id}`);
        const producto = await db.query(`SELECT * FROM producto WHERE producto_id = ${variante.rows[0].producto_id}`);
        let fotos = await db.query(`SELECT * FROM foto_variante WHERE variante_id = ${variante_id}`);

        if (variante.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La variante no existe'
            });
        }

        if (producto.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        if (fotos.rowCount === 0) {
            return res.status(200).json({
                ok: true,
                message: 'Variante encontrada',
                variante: variante.rows[0],
                producto: producto.rows[0],
                fotos : 'La variante no tiene fotos'
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Variante encontrada',
             producto: producto.rows[0],
            variante: variante.rows[0],
            fotos: fotos.rows
        });


    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });

    }

}

const getVariantes = async (req = request, res = response) => {
    try {

        const { producto_id } = req.params;
        const producto = await db.query(`SELECT * FROM producto WHERE producto_id = ${producto_id}`);
        const variantes = await db.query(`SELECT * FROM variante WHERE producto_id = ${producto_id}`);
        if (producto.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        if (variantes.rowCount === 0) {
            return res.status(200).json({
                ok: true,
                message: 'El producto no tiene variantes',
            });
        }

        return res.status(200).json({
            ok: true,
            producto: producto.rows[0],
            variantes: variantes.rows
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });

    }

} 

const getById = async (req = request, res = response) => {
    try {

        const { id } = req.params;
        const variante = await db.query(`SELECT * FROM variante WHERE variante_id = ${id}`);
        const producto = await db.query(`SELECT * FROM producto WHERE producto_id = ${variante.rows[0].producto_id}`);

        if (variante.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La variante no existe'
            });
        }

        if (producto.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Variante encontrada',
            variante: variante.rows[0],
            producto: producto.rows[0]
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });

    }

}

const getAll = async (req = request, res = response) => {
    try {
        const variantes = [];
        const data = await db.query(`SELECT * FROM variante`);

        for (let variant in data.rows) {
            const variante = await db.query(`SELECT * FROM variante WHERE variante_id = ${data.rows[variant].id_variante}`);
            variantes.push(variante.rows[0]);
        }

        return res.status(200).json({
            ok: true,
            message: 'Variantes encontradas',
            variantes
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });

    }

}

const update = async (req = request, res = response) => {

    const { id } = req.params;
    const { descripcion, stock, producto_id } = req.body;
    try {

        //verify the existence of the variante
        const variante = await db.query(`SELECT * FROM variante WHERE variante_id = ${id}`);
        if (variante.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La variante no existe'
            });
        }

        //verify the existence of the product
        const producto = await db.query(`SELECT * FROM producto WHERE producto_id = ${producto_id}`);
        if (producto.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        //update the variante
        const update = await db.query(`UPDATE variante SET descripcion = '${descripcion}', stock = ${stock}, producto_id = ${producto_id} WHERE variante_id = ${id}`);

        return res.status(200).json({
            ok: true,
            message: 'Variante actualizada',
            update
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });

    }
}

const deleteById = async (req = request, res = response) => {

    const { id } = req.params;
    try {
        //verify the existence of the variante
        const variante = await db.query(`SELECT * FROM variante WHERE variante_id = ${id}`);
        if (variante.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'La variante no existe'
            });
        }

        //delete the variante
        const deleteVariante = await db.query(`DELETE FROM variante WHERE variante_id = ${id}`);

        return res.status(200).json({
            ok: true,
            message: 'Variante eliminada',
            deleteVariante
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor',
            error
        });

    }
}

module.exports = {
    create,
    uploadImg,
    getById,
    getAll,
    update,
    deleteById,
    getVariant,
    getVariantes
}



