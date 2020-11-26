const express = require('express');
const router = express.Router();
const passport = require('passport');

const users = require('../controllers/users');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { isLoggedIn, isAlreadyLoggedIn } = require('../middleware');


router.route('/register')
    // .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(isAlreadyLoggedIn, users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'})
        , users.login);

router.get('/logout', isLoggedIn, users.logout)

module.exports = router;