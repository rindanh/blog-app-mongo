

const createError = (statusCode, data, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.data = data
    return error;
}

const errorHandler = (error, req, res, next) => {
    const status = error?.statusCode || 500
    const message = error?.message || 'Internal Server Error'
    const data = error?.data
    res.status(status).json({message, data})
}

module.exports = {
    createError,
    errorHandler
}