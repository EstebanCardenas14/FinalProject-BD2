const { request, response } = require('express');
const db = require('../database/postgres-connection');
const bcrypt = require('bcryptjs');

//Update the user
const updateUser = async ( usuario_id, id_documento, username, num_doc, nombres, apellidos, telefono, correo, req = request, res = response) => {
    try {
        return new Promise(async (resolve, reject) => {
            
            //verify the existence of the user
            const user = await db.query(`SELECT * FROM usuario WHERE usuario_id = ${usuario_id}`);
            if (user.rowCount === 0) {
                return reject('El usuario no existe');
            }

            //validate the document type of document
            const doc = await db.query(`SELECT * FROM documento WHERE id_documento = ${id_documento}`);
            if(doc.rowCount === 0){
                return reject('El tipo de documento no existe');
            }

            //verify the update of the username
            if(username !== user.rows[0].username){
                //verify the existence of the username
                const user2 = await db.query(`SELECT * FROM usuario WHERE username = '${username}'`);
                if (user2.rowCount > 0) {
                    return reject('El username del usuario ya se encuentra registrado');
                }
            }

          
            //verify the update of the document number
            if(num_doc !== user.rows[0].num_doc){
                //verify the existence of the document number
                const user3 = await db.query(`SELECT * FROM usuario WHERE num_doc = ${num_doc}`);
                if (user3.rowCount > 0) {
                    return reject('El numero de documento del usuario ya se encuentra registrado');
                }
            }

            //verify the update of the telephone number
            if(Number(telefono) !== Number(user.rows[0].telefono)){
                //verify the existence of the telephone number
                const user4 = await db.query(`SELECT * FROM usuario WHERE telefono = ${telefono}`);
                if (user4.rowCount > 0) {
                    return reject('El telefono del usuario ya se encuentra registrado');
                }
            }

            //verify the update of the email
            if(correo !== user.rows[0].correo){
                //verify the existence of the email
                const user5 = await db.query(`SELECT * FROM usuario WHERE correo = '${correo}'`);
                if (user5.rowCount > 0) {
                    return reject('El correo del usuario ya se encuentra registrado');
                }
            }

            //update the user
           const update =  await db.query(`UPDATE usuario SET doc_id = '${id_documento}', username = '${username}', num_doc = '${num_doc}', nombres = '${nombres}', apellidos = '${apellidos}', telefono = '${telefono}', correo = '${correo}' WHERE usuario_id = ${usuario_id} RETURNING *`);

           return resolve(update.rows[0]);

        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            type: 'Error en el servidor'
        });
    }
};

module.exports = { updateUser };