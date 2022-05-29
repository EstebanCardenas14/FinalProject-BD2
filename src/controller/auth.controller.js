const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const { jwt } = require('../helpers/index');
const db = require('../database/postgres-connection');

const login = async (req = request, res = response) => {

    const { email, password } = req.body;
   

    try {
        // Check if user exists
        const user = await db.query(`SELECT * FROM usuario WHERE correo = '${email}'`);
        console.log(user.rows);

        let userDB = user.rows[0];
        console.log(userDB);
        console.log(user.rows.clave);
        console.log(userDB.clave);

        //Check if password is correct
       // const validatePassword = bcrypt.compareSync(password, userDB.clave);

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
        
        //If the user is active, return the token
        const token = await generateJwt(user._id, user.email);
       
        return res.status(200).json({
            ok: true,
            token
        });

        //Returns the error if the user does not exist
        return res.status(400).json({
            ok: false,
            message: 'Email no encontrado'
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