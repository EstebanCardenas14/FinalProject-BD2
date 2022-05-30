const { request, response } = require('express');
const db = require('../database/postgres-connection');

const create = async (req = request, res = response) => {
    try {
        //Save the type of document collected in the body
        const { tipo_documento } = req.body;

        //List of document types
        console.log('Connected to the database'.blue);
        const docVar = await db.query('SELECT * FROM documento');

        //Loop through the list of document types to see if the document type already exists
        for (let doc in docVar.rows) {
            if (docVar.rows[doc].tipo_documento === tipo_documento) {
                return res.status(400).json({
                    ok: false,
                    message: 'El documento ya existe'
                });
            }
        }
       
        //If the document type does not exist I create it
        await db.query(`INSERT INTO documento (tipo_documento, estado) VALUES ('${tipo_documento}', ${true})`);
        
        //Get the record of the type of document created
        const docResult = await db.query(`SELECT * FROM documento WHERE tipo_documento = '${tipo_documento}'`);

        //Return the type of document created
        if (docResult.rowCount > 0) { 
            return res.status(200).json({
                ok: true,
                document: docResult.rows[0]
            });
        }

        //If the document type was not created, I return an error
        return res.status(404).json({
            ok: false,
            message: 'Documento no creado'
        });

    } catch (error) {
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al crear el documento',
            error
        });
    }
}

const getById = async (req = request, res = response) => {
    try {

        //Get document id
        const { id } = req.params;

        //Get the document
        const document = await db.query(`SELECT * FROM documento WHERE id_documento = ${id}`);
       
        //If the document exists return the document
        if (document.rowCount > 0) {
            return res.status(200).json({
                ok: true,
                document: document.rows
            });
        }

        //If the document does not exist, I return an error.
        return res.status(404).json({
            ok: false,
            message: 'Documento no encontrado'
        });

    } catch (error) {
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al obtener el documento',
            error
        });

    }
}

const getAll = async (req = request, res = response) => {
    try {
        //Get all documents
        const documents = await db.query('SELECT * FROM documento');

        //If there are documents return all documents
        if (documents.rowCount > 0) {
            return res.status(200).json({
                ok: true,
                documents: documents.rows
            });
        }

        //If there are no documents I return an error
        return res.status(404).json({
            ok: false,
            message: 'Documentos no encontrado'
        });
    } catch (error) {
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al obtener los documentos',
            error
        });
    }
}

const remove = async (req = request, res = response) => {
    try {
        //Get document id
        const { id } = req.params;

        //deleted the document
        const document = await db.query(`DELETE FROM documento WHERE id_documento = ${id}`);
        
        //If the document was deleted I return a message
        return res.status(200).json({
            ok: true,
            message: 'Documento eliminado'
        });

    } catch (error) {
        //If there is an error return the error
        return res.status(500).json({
            ok: false,
            message: 'Error al eliminar el documento',
            error
        });
    }
}


module.exports = {
    create,
    getById,
    getAll,
    remove
}
