const validateUser = require('./validate-user');
const createUser = require('./create-user');
const updateUser = require('./update-user');
const uploadFile = require('./upload-file');
const deleteFile = require('./delete-file');
const verifyQuantity = require('./verify-quantity');
const resetProduct = require('./reset-product');

module.exports = {
    ...validateUser,
    ...createUser,
    ...updateUser,
    ...uploadFile,
    ...deleteFile,
    ...verifyQuantity,
    ...resetProduct
};