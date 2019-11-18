const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const { mongoDbUrl } = require('./config/database');

const subsString = require('./helpers/subStr');

const passport = require('passport');
require('./config/passport')(passport);


//Connecting MONGODB
mongoose.connect(mongoDbUrl, { useNewUrlParser: true }).then(db => {
    console.log('Mongo Connected');
}).catch(err => { console.log(err) });


mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//set directory
app.use(express.static(path.join(__dirname, 'public')));

const { select, generateDate, paginate } = require('./helpers/handlebars-helpers');
//set view engine
app.engine('handlebars', exphbs({ defaultLayout: 'home', helpers: { select: select, generateDate: generateDate, paginate: paginate, subsString: subsString } }));
app.set('view engine', 'handlebars');

//upload Middleware
app.use(upload());

//Middleware
//body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//method override
app.use(methodOverride('_method'));

//session
app.use(session({
    secret: 'renmissionilovecoding',
    resave: true,
    saveUninitialized: true
}));
//passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Local varibales using middleware
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});

//Load Routes
const main = require('./routes/home');
const admin = require('./routes/admin');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

//use Routes
app.use('/', main);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

app.listen(4500, () => {
    console.log('Listening on port 4500');
});