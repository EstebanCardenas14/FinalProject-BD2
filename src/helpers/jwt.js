const jwt = require('jsonwebtoken');

const generateJwt = (username, email, rol) => {

    const payload = { username, email, rol };

    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
        //    expiresIn: '24h'
        }, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });

};

module.exports = {
    generateJwt
};