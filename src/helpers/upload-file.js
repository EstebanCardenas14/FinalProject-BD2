const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});


const uploadFile = (file, validExtensions) => {
  return new Promise((resolve, reject) => {
    try {

      if(!file) {
        return reject('No file uploaded');
      }
      //valido que sea una imagen
      let cutName = file.name.split('.');
      let extension = cutName[cutName.length - 1];
      if (!validExtensions.includes(extension)) {
        return reject(`La extensión ${extension} no es válida -  ${extension}`);
      }
      
      //genero la ruta del archivo
      let uploudPath = path.join(__dirname, '../storage/imagenes/' + file.name);
      //guardo el archivo en la ruta
      file.mv(uploudPath, async (err) => {
        if (err) {
          return reject(err);
        }
        //subo el archivo a cloudinary
        await cloudinary.v2.uploader.upload(uploudPath, (err, result) => {
          if (err) {
            return reject(err);
          }
          //elimino el archivo de la ruta
          fs.unlinkSync(uploudPath);
          //retorno el resultado
          resolve(result.secure_url);
        }
        );
      });
    } catch (error) {
      reject({ message: 'Error al subir el archivo', error });
    }
  });
}

module.exports = {
  uploadFile
}