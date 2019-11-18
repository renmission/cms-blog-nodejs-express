const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const Category = require('../../models/Category');
const User = require('../../models/User');

const { ensureAuthenticated } = require('../../helpers/authentication');



router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', ensureAuthenticated, (req, res) => {

    const promises = [
        User.estimatedDocumentCount().exec(),
        Post.estimatedDocumentCount().exec(),
        Comment.estimatedDocumentCount().exec(),
        Category.estimatedDocumentCount().exec()
    ];

    Promise.all(promises).then(([userCount, postCount, commentCount, categoryCount]) => {

        res.render('admin/index', {
            userCount: userCount,
            postCount: postCount,
            commentCount: commentCount,
            categoryCount: categoryCount
        });

    });

});


router.post('/generate-fake-posts', ensureAuthenticated, (req, res) => {

    for (let i = 0; i < req.body.amount; i++) {

        let post = new Post();

        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.paragraph();

        post.save(err => {
            if (err) throw err;
        });
    }
    res.redirect('/admin/posts');
});



module.exports = router;