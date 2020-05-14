const express = require('express');
const postRouter = require('../posts/posts-router.js');
const server = express();

server.use('/api/posts', postRouter);

server.get('/', (req, res) => {
    res.status(200).json({
      message: 'The server is up and running'
    })
})

module.exports = server;