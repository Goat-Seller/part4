const info = (...params) => {
    process.env.NODE_ENV !== 'test'
    ? console.log(...params)
    : null
}

const error = (...params) => {
    process.env.NODE_ENV !== 'test'
    ? console.log(...params)
    : null
}

module.exports = { info, error }