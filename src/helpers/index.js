const validateUser = require('./validate-user');
const createUser = require('./create-user');
const updateUser = require('./update-user');
const uploadFile = require('./upload-file');
const deleteFile = require('./delete-file');

module.exports = {
    ...validateUser,
    ...createUser,
    ...updateUser,
    ...uploadFile,
    ...deleteFile
};