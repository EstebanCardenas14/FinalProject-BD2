const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const deleteFile = (file, save = '') => {
   try{
    return new Promise((resolve, reject) => {

        // Hay que borrar la imagen del servidor
        const pathImagen = path.join(__dirname, '../storage/' + save + file);
    
        if (fs.existsSync(pathImagen)) {
            fs.unlinkSync(pathImagen);
           return resolve(true);
        } else {
            return  reject('La imagen no existe');
        }
        
    });
   } catch (error) {
         return error;
    }
}

module.exports = {
    deleteFile
}