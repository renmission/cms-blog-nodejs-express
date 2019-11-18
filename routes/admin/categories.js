const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');

const { ensureAuthenticated } = require('../../helpers/authentication');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', ensureAuthenticated, (req, res) => {

    Category.find().then(categories => {
        res.render('admin/categories', { categories: categories });
    }).catch(err => {
        console.error(err.meesage);
    })
});

router.post('/create', ensureAuthenticated, (req, res) => {

    const newCategory = new Category({
        name: req.body.name
    });

    newCategory.save().then(saveCategory => {

        req.flash('success_message', `Category ${saveCategory.name} was successfully created`);

        res.redirect('/admin/categories');
    });

});


router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Category.findOne({ _id: req.params.id }).then(category => {
        res.render('admin/categories/edit', { category: category });
        console.log(category);
    });
});

router.put('/edit/:id', ensureAuthenticated, (req, res) => {
    Category.findOne({ _id: req.params.id }).then(category => {


        category.name = req.body.name;

        if (category.name === "") {
            req.flash('error_message', `Category must not be empty`);
        }

        category.save().then(updateCategory => {
            req.flash('success_message', 'Category was successfully updated');
            res.redirect('/admin/categories');
        })
    });
});


router.delete('/:id', ensureAuthenticated, (req, res) => {
    Category.findOne({ _id: req.params.id }).then(category => {

        category.deleteOne();

        req.flash('success_message', `Category ${category.name} was successfully deleted`);

        res.redirect('/admin/categories');

    }).catch(err => {
        console.log('no data deleted', err);
    })
});


module.exports = router;