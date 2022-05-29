const { request, response } = require('express');
const db = require('../database/postgres-connection');

//verify the existence of the user
const validateUser = async (id_documento,username, num_doc, telefono, correo, req = request, res = response) => {
    try {

        return new Promise(async(resolve, reject) => {
            const doc = await db.query(`SELECT * FROM documento WHERE id_documento = ${id_documento}`);
            const user = await db.query(`SELECT * FROM usuario WHERE username = '${username}'`);
            const user2 = await db.query(`SELECT * FROM usuario WHERE num_doc = ${num_doc}`);
            const user3 = await db.query(`SELECT * FROM usuario WHERE telefono = ${telefono}`);
            const user4 = await db.query(`SELECT * FROM usuario WHERE correo = '${correo}'`);
            //validate the document type of the user
            if(doc.rowCount === 0){
                return reject('El tipo de documento no existe');
            }
            //verify the existence of the username
            if (user.rowCount > 0) {
                return reject('El username del usuario ya se encuentra registrado');
            }
            //verify the existence of the document number
            if (user2.rowCount > 0) {
                return reject('El numero de documento del usuario ya se encuentra registrado');
            }
            //verify the existence of the telephone number
            if (user3.rowCount > 0) {
                return reject('El telefono del usuario ya se encuentra registrado');
            }
            //verify the existence of the email
            if (user4.rowCount > 0) {
                return reject( 'El correo del usuario ya se encuentra registrado');
            }
            return resolve(true);
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            type: 'Error en el servidor'
        });
    }
};

module.exports = { validateUser };