const { request, response } = require('express');
const db = require('../database/postgres-connection');
const Categoria = require('../models/Neo4j/categoria');
const categoria = new Categoria();

const create = async (req = request, res = response) => {
    try {
        //save the category collected in the body
        const { nombre } = req.body;
        console.log('Connected to the database...'.blue);
        //Verify if the category already exists
        const category = await db.query(`SELECT * FROM categoria`);
        if (category.rowCount > 0) {
            const categoryExists = category.rows.find(cat => cat.nombre.toUpperCase() === nombre.toUpperCase());
            if (categoryExists) {
                return res.status(400).json({
                    ok: false,
                    message: 'La categoría ya existe'
                });
            }
        }

        //if the category does not exist, create it
        const created = await db.query(`INSERT INTO categoria (nombre, estado) VALUES ('${nombre}', ${true}) RETURNING *`);
        if (created.rowCount === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear la categoría'
            })
        }
        let catDB = { nombre: created.rows[0].nombre, categoria_id: created.rows[0].categoria_id };
        const response = await categoria.createCategoria(catDB);

        return res.status(200).json({
            ok: true,
            message : 'Categoria creada con exito',
            categoria : created.rows[0],
            categoriaNeo : response
        });

    } catch (error) {
        //if there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al crear la categoria',
            error
        });
    }
}

const getById = async (req = request, res = response) => {
    try {

        //save the id of the category collected in the body
        const { id } = req.params;

        //list the category
        const category = await db.query(`SELECT * FROM categoria WHERE categoria_id = '${id}'`);

        //return the category
        if (category.rowCount > 0) {
            return res.status(200).json({
                ok: true,
                category: category.rows[0]
            });
        }

        //if the category was not found return an error
        return res.status(404).json({
            ok: false,
            message: 'Categoria no encontrada'
        });

    } catch (error) {
        //if there is an error return the error
        console.log(error);
        return res.status(500).json({
            ok: false,
            message: 'Error al obtener la categoria',
            error
        });

    }
}

const getAll = async (req = request, res = response) => {
    try {

        //list the categories
        const categories = await db.query(`SELECT * FROM categoria`);

        //return the categories
        if (categories.rowCount > 0) {
            return res.status(200).json({
                ok: true,
                categories: categories.rows
            });
        }

        //if the categories were not found return an error
        return res.status(404).json({
            ok: false,
            message: 'No se encontraron categorías'
        });

    } catch (error) {
        //if there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al obtener las categorías',
            error
        });

    }
}

const update = async (req = request, res = response) => {
    try {

        //bring the id of the category in the params
        const { id } = req.params;

        //bring the category data in the body
        const { nombre } = req.body;

        //edit the category
        const updated = await db.query(`UPDATE categoria SET nombre = '${nombre}' WHERE categoria_id = '${id}' RETURNING *`);

        //return the updated category
        if (updated.rowCount > 0) {
            return res.status(200).json({
                ok: true,
                category: updated.rows[0]
            });
        }

        //if the category was not updated return an error
        return res.status(404).json({
            ok: false,
            message: 'No existe la categoria'
        });

    } catch (error) {
        console.log(error);
        //if there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al actualizar la categoria',
            error
        });

    }
}

const deleteById = async (req = request, res = response) => {
    try {

        //save the id of the category collected in the body
        const { id } = req.params;

        //verify if the category exists
        const category = await db.query(`SELECT * FROM categoria WHERE categoria_id = '${id}'`);
        if (category.rowCount > 0) {
            //delete the category
            await db.query(`DELETE FROM categoria WHERE categoria_id = ${id}`);
            //return the deleted category
            return res.status(200).json({
                ok: true,
                category: 'Categoria eliminada correctamente'
            });
        }

        //if the category was not found return an error
        return res.status(404).json({
            ok: false,
            message: 'No existe la categoria'
        });


    } catch (error) {
        //if there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al eliminar la categoria',
            error
        });

    }
}

module.exports = {
    create,
    getById,
    getAll,
    update,
    deleteById
}
