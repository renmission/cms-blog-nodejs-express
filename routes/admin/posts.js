const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const { isEmpty, uploadDir } = require('../../helpers/upload-helpers');
const fs = require('fs');
const path = require('path');

const { ensureAuthenticated } = require('../../helpers/authentication');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', ensureAuthenticated, (req, res) => {
    Post.find()
        .populate('category')
        .then(posts => {
            Category.find().then(categories => {
                res.render('admin/posts', { posts, categories });
            });
        });
});

router.get('/create', ensureAuthenticated, (req, res) => {

    Category.find({}).then(categories => {
        res.render('admin/posts/create', { categories: categories });
    })

});

router.get('/my-posts', (req, res) => {

    Post.find({ user: req.params.id })
        .populate('category')
        .then(posts => {

            res.render('admin/posts/my-posts', { posts });
        });

});

router.post('/create', ensureAuthenticated, (req, res) => {

    //form validation
    let errors = [];

    if (!req.body.title) {
        errors.push({ message: 'Please add a title' })
    }

    if (errors.length > 0) {
        res.render('admin/posts/create', {
            errors: errors
        })
    } else {

        let filename = '';

        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now() + '-' + file.name;

            let dirUploads = './public/uploads/';

            file.mv(dirUploads + filename, (err) => {
                if (err) throw err;
            });
        }



        let allowComments = true;
        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        const newPost = new Post({
            // user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.body,
            category: req.body.category,
            file: filename
        });

        newPost.save().then(savePost => {

            req.flash('success_message', `Post ${savePost.title} was created successfully`);

            res.redirect('/admin/posts');
        }).catch(err => {
            console.log('could not save post', err);
        });


    }



});

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Post.findOne({ _id: req.params.id })
        .populate('category')
        .then(post => {

            Category.find({}).then(categories => {
                res.render('admin/posts/edit', { post: post, categories: categories });
            })

        }).catch(err => {
            console.log('data not found', err);
        });
});

router.put('/edit/:id', ensureAuthenticated, (req, res) => {

    Post.findOne({ _id: req.params.id }).then(post => {

        if (req.body.allowComments) {
            allowComments = true;
        } else {
            allowComments = false;
        }

        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category = req.body.category;


        if (!isEmpty(req.files)) {

            let file = req.files.file;
            filename = Date.now() + '-' + file.name;
            post.file = filename;

            let dirUploads = './public/uploads/';

            file.mv(dirUploads + filename, (err) => {
                if (err) throw err;
            });
        }

        post.save().then(updatedPost => {

            req.flash('success_message', `Post was successfully updated`);

            res.redirect('/admin/posts/my-posts');
        });

    }).catch(err => {
        console.log('data not updated', err);
    });
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
    Post.findOne({ _id: req.params.id })
        .populate('comments')
        .then(post => {


            fs.unlink(uploadDir + post.file, (err) => {

                if (!post.comments.length < 1) {

                    post.comments.forEach(comments => {

                        comments.remove();

                    })
                }

                post.deleteOne().then(postRemove => {

                    req.flash('success_message', 'Post was successfully deleted');

                    res.redirect('/admin/posts/my-posts');

                })


            });

        })
});


module.exports = router;