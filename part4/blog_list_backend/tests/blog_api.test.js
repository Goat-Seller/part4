const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const Blog = require('../models/blog')
const last  = require('lodash/last')



beforeEach(async () => {
    await Blog.deleteMany({})
    const initialBlogs = await helper.loadBlogs()
    await Blog.insertMany(initialBlogs)
})
describe('Blogs data validation', () => {
    test('blogs as JSON', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test('all blogs', async () => {
        const initialBlogs = await helper.loadBlogs()
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(initialBlogs.length)
    })
    test('id property is defined', async () => {
        const response = await api.get('/api/blogs')
        const id = response.body.map(b => b.id)
        expect(id).toBeDefined()
    })
})
describe('Blog validation', () => {
    test('a valid blog can be added', async () => {
        const initialBlogs = await helper.loadBlogs()
        const user = await api
            .post('/api/login')
            .send({ username: 'root', password: 'root'})
        const newBlog = {
            title: 'W szczebrzeszynie chrząszcz brzmi w trzcinie',
            author: 'Me',
            url: 'https://somethinginpolish.com',
            likes: 2,
        }
        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + user.body.token)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
    })
    test('default number of likes is 0', async () => {
        const user = await api
            .post('/api/login')
            .send({ username: 'root', password: 'root'})
        const newBlog = {
            title: 'W szczebrzeszynie chrząszcz brzmi w trzcinie',
            author: 'Me',
            url: 'https://somethinginpolish.com',
        }
        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + user.body.token)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const blogsAtEnd = await helper.blogsInDb()
        const blog = last(blogsAtEnd)
        expect(blog.likes).toBe(0)
    })
    test('a blog without title and url is nod added', async () => {
        const initialBlogs = await helper.loadBlogs()
        const user = await api
            .post('/api/login')
            .send({ username: 'root', password: 'root'})
        const newBlog = {
            author: 'Me'
        }
        await api
            .post('/api/blogs')
            .set('Authorization', 'bearer ' + user.body.token)
            .send(newBlog)
            .expect(400)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(initialBlogs.length)
    })
})
describe('Blog transformation', () => {
    test('removing blog', async () => {
        const initialBlogs = await helper.loadBlogs()
        const user = await api
            .post('/api/login')
            .send({ username: 'root', password: 'root'})
        const blogsAtStart = await helper.blogsInDb()
        await api
            .delete(`/api/blogs/${blogsAtStart[0].id}`)
            .set('Authorization', 'bearer ' + user.body.token)
            .expect(204)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)

        const titles = blogsAtEnd.map(b => b.title)

        expect(titles).not.toContain(blogsAtStart[0].title)
    })
    test('updating blog', async () => {
        const initialBlogs = await helper.loadBlogs()
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = {
            id: blogsAtStart[0].id,
            title: blogsAtStart[0].title,
            author: blogsAtStart[0].author,
            url: blogsAtStart[0].url,
            likes: blogsAtStart[0].likes + 1
        }
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(blogToUpdate)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(initialBlogs.length)

        expect(blogsAtEnd[0].likes).toBe(blogsAtStart[0].likes + 1)
    })
})
afterAll(() => mongoose.connection.close())