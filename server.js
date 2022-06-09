const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const { mongoDB } = require('./src/database/mongose-connection');
require('dotenv').config();
class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.host = process.env.HOST || 'localhost';
        this.server = require('http').createServer(this.app);

        this.middlewares();
        this.routes();

        mongoDB();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(logger('dev'));
        this.app.use(express.urlencoded({ extended: true }));
        //static images
        this.app.use('/storage', express.static(path.join(__dirname, 'src/storage')));
        //Fileupload - carga de archivos
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));
    }

    routes() {
        this.app.use('/doc', require('./src/routes/documents.routes'));
        this.app.use('/comprador', require('./src/routes/comprador.routes'));
        this.app.use('/proveedor', require('./src/routes/proveedor.routes'));
        this.app.use('/auth', require('./src/routes/auth.routes'));
        this.app.use('/categoria', require('./src/routes/categoria.routes'));
        this.app.use('/marca', require('./src/routes/marca.routes'));
        this.app.use('/producto', require('./src/routes/producto.routes'));
        this.app.use('/variante', require('./src/routes/variante.routes'));
        this.app.use('/carrito', require('./src/routes/carrito.routes'));
        

    }

    launch() {
        // Route default
        this.app.use('/', (req, res, next) => {
            res.status(200).json({
                ok: true,
                message: 'Página de inicio'
            });
        });
        this.server.listen(this.port, this.host, () => {
            console.log(`Server running on ${this.host}:${this.port}`.magenta);
        });
    }

}

module.exports = Server;