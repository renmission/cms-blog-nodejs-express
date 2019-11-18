const express = require('express');
const router = express.Router();
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');

const { ensureAuthenticated } = require('../../helpers/authentication');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', ensureAuthenticated, (req, res) => {

    Comment.find({})
        .populate('user')
        .then(comments => {
            res.render('admin/comments', { comments: comments });
        })

})

router.post('/', ensureAuthenticated, (req, res) => {

    Post.findOne({ _id: req.body.id }).then(post => {

        const newComment = new Comment({

            user: req.user,
            body: req.body.body

        })

        post.comments.push(newComment);

        post.save().then(savePost => {

            newComment.save().then(savedComment => {

                req.flash('success_message', 'Your comment will review in a moment, thank you');

                res.redirect(`/post/${post.slug}`);

            })
        })

    })
});

router.delete('/:id', ensureAuthenticated, (req, res) => {
    Comment.findByIdAndDelete({ _id: req.params.id }).then(deleteComment => {

        Post.findOneAndUpdate({ comments: req.params.id }, { $pull: { comments: req.params.id } }, (err, data) => {

            if (err) return console.log(err);

            req.flash('success_message', 'Comment deleted successfully')
            res.redirect('/admin/comments');

        });

    });

});

router.post('/approve-comment', ensureAuthenticated, (req, res) => {

    Comment.findByIdAndUpdate(req.body.id, { $set: { approveComment: req.body.approveComment } }, (err, result) => {
        if (err) return err;
        res.send(result);
    })

})


module.exports = router;