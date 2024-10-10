const path = require('path');
const mongoose = require('mongoose');

const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const csurf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const User = require('./models/userModel');
const errorController = require('./controllers/error');

require('dotenv').config({path : path.join(__dirname, 'apikeys.env')});

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const MONGODB_URI = 'mongodb+srv://rohit:Rohit123%40@cluster0.ha5sq.mongodb.net/shop?&w=majority&appName=Cluster0';

const app = express();
const csurfProtection = csurf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const { error } = require('console');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


const store = new MongoDBStore({
    uri : MONGODB_URI,
    collection : 'sessions'
});

const fileStorage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'images');
    },
    filename : (req, file, cb) => {
        cb(null, new Date().toISOString() + ' - ' + file.originalName);
    }
});

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else{
        cb(null, false);
    }
};

app.use(session({
    secret : 'rohit', resave : false, saveUninitialized : false, store : store
}));

app.use((req, res, next) => {

    if(!req.session.user){
        return next();
    }
    
    User.findById(req.session.user._id).then(user => {
        req.user = user;
        next();
    }).catch(err => {
        console.log(err);
    });
});

app.use(csurfProtection);
app.use(flash());

app.use(multer({
    fileFilter : fileFilter,
    storage : fileStorage
}).single('image'));

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {

    return res.status(500).render('500', {
        pageTitle : 'Error',
        path : '/500',
        csrfToken : req.csrfToken,
        isAuthenticated : req.session.isLoggedIn,
    });
});

mongoose.connect(MONGODB_URI).then(result => {

    app.listen(3000);
}).catch(err => {
    console.log("Error is :" + err);
});