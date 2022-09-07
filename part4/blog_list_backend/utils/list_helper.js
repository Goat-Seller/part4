const _ = require('lodash')

const dummy = (blogs) => {
    return Array.isArray(blogs)
    ? 1
    : 0
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum,blog) =>{
        return sum + blog.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    const mostLikes = Math.max(...blogs.map(blog => blog.likes))
    const favBlog = blogs.find(blog => blog.likes === mostLikes)
    return {
        title: favBlog.title,
        author: favBlog.author,
        likes: favBlog.likes
    }
}

const mostBlogs = _.flow(
    blogs => _.countBy(blogs, 'author'), // count by the author
    _.toPairs, // convert to array of [key, value] pairs
    blogs => _.maxBy(blogs, _.last), // get the entry with most blogs
    blog => _.zipObject(['author', 'blogs'], blog), // convert to an object
  )

const mostLikes = (blogs) => {
    const likes = blogs.reduce(({sums,most}, {likes, author}) => {
     sums[author] = likes = (sums[author] || 0) + likes;
     if (likes > most.likes) most = {author,likes};
     return {sums,most};
   }, {sums: {}, most: {likes:0} })
   .most;
  return likes
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}