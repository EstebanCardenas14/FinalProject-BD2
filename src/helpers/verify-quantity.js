const { request, response } = require('express');
const db = require('../database/postgres-connection');


//check the available quantity of the product variant
const verifyQuantity = async (variante_id, cantidad,req = request, res = response) => {
    try {

        return new Promise(async (resolve, reject) => {
            
            //verify if the product variant exists
            const variante = await db.query(`SELECT * FROM variante WHERE variante_id = '${variante_id}'`);
            if (variante.rowCount === 0) {
                return reject('La variante no existe');
            }

            //verify if the product variant is available
            const variante_disponible = await db.query(`SELECT * FROM variante WHERE variante_id = '${variante_id}' AND stock >= ${cantidad}`);
            if (variante_disponible.rowCount === 0) {
                return reject('La cantidad solicitada no esta disponible');
            }

            //sustract the quantity from the product variant
            const sustract = await db.query(`UPDATE variante SET stock = stock - ${cantidad} WHERE variante_id = '${variante_id}' RETURNING *`);
            console.log('Cantidad disponible: ',sustract.rows[0].stock);
            if (sustract.rowCount === 0) {
                return reject('No se pudo actualizar el stock');
            }

            return resolve(variante_disponible.rows[0]);
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            type: 'Error en el servidor'
        });
    }
};

module.exports = { verifyQuantity };