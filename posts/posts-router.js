const express = require('express');
const db = require('../data/db.js');
const router = express.Router();

router.use(express.json());

// GET POSTS /api/posts -------------------- //
router.get('/', (req, res) => {
  db.find()
    .then(posts => res.status(200).json(posts))
    .catch(() => res.status(500).json({
      message: 'The posts information could not be retrieved'
    }))
});

// CREATE NEW POST /api/posts ------------------- //
router.post('/', async (req, res) => {
  const post = req.body;

  if (post.title && post.contents) {
    db.insert(post)
      .then(({ id }) => {
        db.findById(id) // fetches newly created post by id and returns the whole object
          .then(newPost => {
            if (newPost.length) {
              res.status(201).json(newPost);
            } else {
              res.status(404).json({
                message: 'The post with the specified ID does not exist.'
              });
            }
          })
      })
      .catch(() => {
        res.status(500).json({
          message: 'There was an error while saving the post to the database'
        });
      });
  } else {
    res.status(400).json({
      message: 'Please provide a title and contents for the post.'
    })
  }
});

// CREATE NEW POST COMMENT /api/posts/:id/comments --- //
router.post('/:id/comments', (req, res) => {
  const postId = req.params.id;
  const comment = req.body;

  if (!comment.text) {
    res.status(400).json({
      message: 'Please provide text for the comment'
    });
  }

  db.findById(postId)
    .then(() => {

      comment.post_id = postId; // adds post id as param in comment object

      db.insertComment(comment)
        .then(({ id }) => {

          db.findCommentById(id)
            .then(comment => res.status(201).json(comment))
            .catch(() => res.status(500).json({
                message: 'There was an error while saving the comment to the database'
              }))
        })

    })
    .catch(() => {
      res.status(404).json({
        message: 'The post with the specified ID does not exists.'
      });
    })
});

// GET POST /api/posts/:id --- //
router.get('/:id', (req, res) => {
  const postId = req.params.id;

  db.findById(postId)
    .then(post => {
      if (post.length) {
          res.status(200).json(post);
      } else {
        res.status(404).json({
          message: 'The post with the specified ID does not exist'
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: 'The post information could not be retrieved' });
    });
});

// GET POST COMMENTS /api/posts/:id/comments --- //
router.get('/:id/comments', (req, res) => {
  const postId = req.params.id;

  db.findById(postId)
    .then(post => {
      if (post.length) {
        db.findPostComments(postId)
          .then(comments => res.status(200).json(comments))
          .catch(() => {
            res.status(500).json({
              message: 'The comments information could not be retrieved'
            });
          });
      } else {
        res.status(404).json({
          message: 'The post with the specified ID does not exist.'
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: 'The post information could not be retrieved'
      })
    })
});

// DELETE POST /api/posts/:id --- //
router.delete('/:id', (req, res) => {
  const postId = req.params.id;

  db.findById(postId)
    .then(post => {
      if (post.length) {
        db.remove(postId)
          .then(() => res.status(200).json(post))
          .catch(() => res.status(500).json({
            message: 'The post could not be removed'
          }))
      } else {
        res.status(404).json({
          message: 'The post with the specified ID does not exist.'
        });
      }
    })
    .catch(() => {
      res.status(500).json({
        message: 'The post information could not be retrieved'
      })
    });
});

// UPDATE POST /api/posts/:id --- //
router.put('/:id', (req, res) => {
  const postId = req.params.id;
  const updates = req.body;

  if (!updates.title || !updates.contents) {
    res.status(400).json({
      message: 'Please provide title and contents for the post.'
    });
  }

  db.findById(postId)
    .then(post => {
      if (post.length) {
        db.update(postId, updates)
          .then(() => {
            db.findById(postId)
              .then(updatedPost => {
                if (updatedPost.length) {
                  res
                    .status(200)
                    .json(updatedPost)
                } else {
                  res
                    .status(500)
                    .json({ error: 'The post information could not be modified' });
                }
              })
          })
      } else {
        res
          .status(404)
          .json({ message: 'The post with the specified ID does not exist.' });
        }
    })
    .catch(() => {
      res
        .status(500)
        .json({ error: 'The post information could not be retrieved' })
    });
});

module.exports = router;