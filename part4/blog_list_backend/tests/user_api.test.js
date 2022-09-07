const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt =  require('bcrypt')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const User = require('../models/user')

describe('when there is initialy one user in db', () =>{
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('root', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })
    test('creation falls when username is taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'rooten',
        }
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('username must be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
    test('creation falls when username is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "Bo",
            name: "Boo",
            password: "beep"
        }
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('username is too short')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
    test('creation falls when password is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "Beep",
            name: "Boo",
            password: "bo"
        }
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('password is too short')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})
afterAll(() => mongoose.connection.close())