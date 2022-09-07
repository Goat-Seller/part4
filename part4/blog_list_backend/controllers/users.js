const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { user: 0 })
    response.json(users)
})

userRouter.post('/', async (request, response) => {
    const { username, name,  password } = request.body

    if(username.length < 3){ return response.status(400).json({ error: 'username is too short' })}
    if(password.length < 3){ return response.status(400).json({ error: 'password is too short' })}

    const existingUser = await User.findOne({ username })
    if(existingUser){ return response.status(400).json({ error: 'username must be unique' })}

    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
        username,
        name,
        passwordHash
    })
    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = userRouter