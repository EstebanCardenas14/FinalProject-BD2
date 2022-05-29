const mongoose = require('mongoose');
const colors = require('colors');

const mongoDB = async() => {
    try {
        mongoose.connection.openUri(process.env.MONGODB_CNN , (err, res) => {
            if (err) throw err;
            console.log('Data base mongo: \x1b[32m%s\x1b[0m'.bold, 'online'.underline.yellow.bold);
        });

    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la base de datos'.underline.red.bold);
    }
};

module.exports = {
    mongoDB
};