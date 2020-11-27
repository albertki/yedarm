if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
// console.log(process.env.CLOUDINARY_CLOUD_NAME);

const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require("helmet");

// Import routes for students, users
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const parentRoutes = require('./routes/parents');

// const dbUrl = process.env.DB_URL
// const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yedarm'
const dbUrl = 'mongodb://localhost:27017/yedarm'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // to delete and update
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisisnotagoodsecret'
const store = new MongoStore({   // store session info in mongo vs. memory store
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60   // only refresh in 24 hrs
});

store.on("error", function (error) {
    console.log("STORE ERROR", error);
})

const sessionConfig = { 
    store,
    name: 'kcpcSession',
    secret,
    resave: false, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://code.jquery.com/",
    "https://cdn.datatables.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.datatables.net",
];
const connectSrcUrls = [
    "https://ka-f.fontawesome.com"
];
const fontSrcUrls = [
    "https://ka-f.fontawesome.com"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/de7x3ykky/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// session should be before session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for flash messages
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.warning = req.flash('warning');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/students', studentRoutes);
app.use('/students/:id/parents', parentRoutes);
app.get('/', (req, res) => {
    res.redirect('/login');
})

// if requests don't match any of above, then give 404 error status code
// later may want to create separate 404 template...
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found :(', 404));
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Something went wrong!"
    console.log(err.message);
    // res.send('Something went wrong')
    res.status(status).render('error', {err})
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}!`);
})