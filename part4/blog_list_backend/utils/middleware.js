const logger =  require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
    logger.info('\n------')
    logger.info('Method:', request.method)
    logger.info('Path:', request.path)
    logger.info('Body:', request.body)
    logger.info('------')
    next()
}

const unknownEndpoint = (request, response) => response.status(404).send({ error: 'unknown endpoint' })

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if(authorization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization.substring(7)
    }
    next()
}
const userExtractor = (request, response, next) => {
    const user = jwt.verify(request.token, process.env.SECRET)
    if(!user.id){ return response.status(401).json({ error: 'token missing or invalid' }) }
    else {
        request.user = user
    }
    next()
}

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') response.status(400).send({ error: 'malformated id'})

    else if (error.name === 'ValidationError') response.status(400).json({ error: error.message})

    else if (error.name === 'JsonWebTokenError') response.status(401).json({ error: 'invalid token' })

    else if (error.name === 'TokenExpiredError') response.status(401).json({ error: 'token expired' })
    logger.error(error.message)
    next(error)
}
module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}