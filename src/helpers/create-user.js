const { request, response } = require('express');
const db = require('../database/postgres-connection');
const bcrypt = require('bcryptjs');

//create the user
const createUser = async (role, id_documento, username, num_doc, nombres, apellidos, telefono, correo, clave, req = request, res = response) => {
    try {

        return new Promise(async (resolve, reject) => {
            //Encrypt the password
            const salt = bcrypt.genSaltSync();
            pass = bcrypt.hashSync(clave, salt);
            //create the user
            await db.query(`INSERT INTO usuario (doc_id, username, num_doc, nombres, apellidos, telefono, correo, clave, estado) VALUES (${id_documento},'${username}',${num_doc},'${nombres}','${apellidos}',${telefono},'${correo}','${pass}',${true});`);
            //verify the existence of the user
            const user =  await db.query(`SELECT * FROM usuario WHERE username = '${username}'`);
            if (user.rowCount === 0) {
                return reject('Error al crear el usuario');
            }
            //associate the user to the role
            if(role === 'Administrador'){
                await db.query(`INSERT INTO administrador(usuario_id, estado) VALUES (${user.rows[0].usuario_id}, ${true})`);
                //verify the existence of the administrator
                const admin = await db.query(`SELECT * FROM administrador WHERE usuario_id = ${user.rows[0].usuario_id}`);
                if (admin.rowCount === 0) {
                    return reject('Error al crear el administrador');
                }
            }
            if(role === 'Comprador'){
                await db.query(`INSERT INTO comprador(usuario_id, estado) VALUES (${user.rows[0].usuario_id}, ${true})`);
                //verify the existence of the buyer
                const comprador = await db.query(`SELECT * FROM comprador WHERE usuario_id = ${user.rows[0].usuario_id}`);
                if (comprador.rowCount === 0) {
                    return reject('Error al crear el comprador');
                }
            }
            if(role === 'Proveedor'){
                await db.query(`INSERT INTO proveedor(usuario_id, estado) VALUES (${user.rows[0].usuario_id}, ${true})`);
                //verify the existence of the provider
                const proveedor = await db.query(`SELECT * FROM proveedor WHERE usuario_id = ${user.rows[0].usuario_id}`);
                if (proveedor.rowCount === 0) {
                    return reject('Error al crear el proveedor');
                }
            }
                
            resolve(user.rows[0]);

        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            type: 'Error en el servidor'
        });
    }
};

module.exports = { createUser };