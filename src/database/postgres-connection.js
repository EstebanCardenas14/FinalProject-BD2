const { Pool } = require('pg');

const client = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT
});

const postgres = async() => {
    try {
        await client.connect();
        console.log('Data base postgres: \x1b[32m%s\x1b[0m'.bold, 'online'.underline.yellow.bold);
        return client;
    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de iniciar la base de datos'.underline.red.bold);
    }
}

module.exports = {
    query: (text) => client.query(text),
};