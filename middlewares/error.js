const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = {...err} //hacemos copia de err
    err.message = err.message
    //Log to console for dev
    console.log('errr',err)

    //MOngoose bad objectId
    if (err.name === 'CastError') {
        const message = `Bootcamp not found with id of ${err.value}`
        error = new ErrorResponse(message, 404)
    }
    //Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered'
        error = new ErrorResponse(message, 400)
    }
    // Mngoose validation error
    if(err.name === 'ValidationError') {
        const message =  Object.values(err.errors).map(value => value.message)
        error = new ErrorResponse(message, 400)
    }
    res.status(error.statusCode || 500).json({ 
        success: false,
        error: error.message || 'Server error'
    })
}

module.exports = errorHandler;