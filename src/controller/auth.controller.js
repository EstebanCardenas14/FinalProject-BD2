const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const { jwt } = require('../helpers/index');
const db = require('../database/postgres-connection');

const login = async (req = request, res = response) => {

    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await db.query(`SELECT * FROM usuario WHERE correo = '${email}'`);

        let userDB = {username : user.rows[0].username ,id: user.rows[0].usuario_id, nombre: user.rows[0].nombres, correo: user.rows[0].correo, rol: '', id_rol: 0};

        //Check if password is correct
        const validatePassword = bcrypt.compareSync(password, userDB.clave);
        console.log(validatePassword);

       //If the password is uncorrect, return an error
        if (!validatePassword) {
            return res.status(400).json({
                ok: false,
                message: 'La contraseña del usuario no coincide'
            });
        }

        //Check if user is active
        if (!user.state) {
            return res.status(401).json({
                message: 'usuario eliminado - no se puede logear'
            })
        }

        //verify if user is admin
        const admin = await db.query(`SELECT * FROM administrador WHERE usuario_id = ${userDB.usuario_id}`);
        if (admin.rows.length > 0) {
            userDB.rol = 'admin';
            userDB.id_rol = admin.rows[0].administrador_id;
         }

        //verify if user is client
        const client = await db.query(`SELECT * FROM comprador WHERE usuario_id = ${userDB.usuario_id}`);
        if (client.rows.length > 0) {
            userDB.rol = 'comprador';
            userDB.id_rol = client.rows[0].comprador_id;
        }

        //verify if user is seller
        const seller = await db.query(`SELECT * FROM proveedor WHERE usuario_id = ${userDB.usuario_id}`);
        if (seller.rows.length > 0) {
            userDB.rol = 'proveedor';
            userDB.id_rol = seller.rows[0].proveedor_id;
        }
        
       // let userDB = {username : user.rows[0].username ,id: user.rows[0].usuario_id, nombre: user.rows[0].nombres, correo: user.rows[0].correo, rol: '', id_rol: 0};

        //If the user is active, return the token
        const token = await generateJwt(userDB.username, userDB.email, userDB.id, userDB.id_rol);

        return res.status(200).json({
            ok: true,
            token,
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