const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
var xoauth2 = require('xoauth2');
const multer  = require('multer')

require('dotenv').config();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAlreadyLoggedIn } = require('../middleware');

router.route('/register')
    // .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(isAlreadyLoggedIn, users.renderLogin)
    .post(passport.authenticate('local', 
        { failureFlash: true, failureRedirect: '/login'}
        ), users.login);

router.post('/changepassword', passport.authenticate('local', 
        { failureFlash: true, failureRedirect: '/login'}
        ), catchAsync(users.changepassword)
);

router.get('/logout', isLoggedIn, users.logout);

router.route('/forgot')
    .get((req, res) => {
        res.render('users/forgot');
    })
    .post(catchAsync(users.sendForgotPasswordLink));

router.route('/reset/:token')
    .get(users.renderResetPassword)
    .put(catchAsync(users.resetPassword));

module.exports = router;