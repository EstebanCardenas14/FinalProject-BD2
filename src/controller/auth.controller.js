const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const { jwt } = require('../helpers/index');
const db = require('../database/postgres-connection');

const login = async (req = request, res = response) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        console.log('Connected to the database'.blue);

        const user = await db.query(`SELECT * FROM usuario WHERE correo = '${email}'`);
        // Check existence of user
        if (user.rows.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario no encontrado'
            });
        }
        
        let userDB = {username : user.rows[0].username ,id: user.rows[0].usuario_id, nombre: user.rows[0].nombres, correo: user.rows[0].correo, rol: '', id_rol: 0};
        //Check if password is correct
        const validatePassword = bcrypt.compareSync(password, user.rows[0].clave);
       //If the password is uncorrect, return an error
        if (!validatePassword) {
            return res.status(400).json({
                ok: false,
                message: 'La contraseña del usuario no coincide'
            });
        }
      
        //Check if user is active
        if (!user.rows[0].estado) {
            return res.status(401).json({
                message: 'usuario eliminado - no se puede logear'
            })
        }
    
        //verify if user is admin
        const admin = await db.query(`SELECT * FROM administrador WHERE usuario_id = ${userDB.id}`);
        if (admin.rows.length > 0) {
            userDB.rol = 'admin';
            userDB.id_rol = admin.rows[0].administrador_id;
         }

        //verify if user is client
        const client = await db.query(`SELECT * FROM comprador WHERE usuario_id = ${userDB.id}`);
        if (client.rows.length > 0) {
            userDB.rol = 'comprador';
            userDB.id_rol = client.rows[0].comprador_id;
        }

        //verify if user is seller
        const seller = await db.query(`SELECT * FROM proveedor WHERE usuario_id = ${userDB.id}`);
        if (seller.rows.length > 0) {
            userDB.rol = 'proveedor';
            userDB.id_rol = seller.rows[0].proveedor_id;
        }
        
        return res.status(200).json({
            ok: true,
            userDB
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error en el servidor'
        });
    }

};

module.exports = {
    login
};