const path = require('path');
const { v4: uuidv4 } = require('uuid');

const uploadFile = (file,validExtensions,save = '' ) => {
    return new Promise((resolve, reject) => {
      try {
        let cutName = file.name.split('.');
        let extension = cutName[cutName.length - 1];
        
        if (!validExtensions.includes(extension)) {
            return reject(`La extensión ${extension} no es válida -  ${extension}`);
        }
        let name = uuidv4()+'.'+extension;
        let uploudPath = path.join(__dirname, '../storage/' + save + name);
        file.mv(uploudPath, async (err) => {
            if (err) {
                return reject(err);
            }
            resolve(name);
        });
      } catch (error) {
        reject({ message: 'Error al subir el archivo', error });
      }
    });
}

module.exports = {
    uploadFile
}