const User = require('../models/user');
const ExpressError = require('../utils/ExpressError');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// module.exports.renderRegister = (req, res) => {
//     res.render('users/register');
// }

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) 
                return next(err);
            req.flash('success', 'Welcome to Yedarm Page')
            res.redirect('/students');
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success','Welcome back!');
    const redirectUrl = req.session.returnTo || '/students';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    req.session.destroy(function (err) {
        res.redirect('login'); //Inside a callback… bulletproof!
    });
    // res.redirect('login')
}

module.exports.changepassword = async (req, res) => {
    const foundUser = await User.findById(req.user._id);
    foundUser.changePassword(req.body.password, req.body.newPassword);
    console.log('password changed');
    res.redirect('login');
}

module.exports.sendForgotPasswordLink = async (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        async function(token, done) {
            const user = await User.findOne({ email: req.body.email })
            if (!user) {
                req.flash('error', 'No account with that email address exists.');
                return res.redirect('/forgot');
            }
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        
            user.save(function(err) {
                done(err, token, user);
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    // xoauth2: xoauth2.createXOAuth2Generator({
                    //     type: 'OAuth2',
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD
                    // })
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.EMAIL,
                subject: 'YedarmDB Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) 
            return next(err);
        res.redirect('/forgot');
    });
}

module.exports.renderResetPassword = async (req, res) => {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
    }
    res.render('users/reset', { user, token: req.params.token });
}

module.exports.resetPassword = async (req, res) => {
    async.waterfall([
        async function(done) {
            const user = await User.findOne({resetPasswordToken: req.params.token});
            await user.setPassword(req.body.newPassword);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
        
            user.save(function(err) {
                req.login(user, function(err) {
                    if (err) 
                        return next(err);
                    req.flash('success', 'Welcome back!')
                    req.flash('success', 'Success! Your password has been changed.')
                    res.redirect('/students');
                });
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });
            var mailOptions = {
                to: user.email,
                from: process.env.EMAIL,
                subject: 'Your YedarmDB password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your YedarmDB account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                // req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
            }
        ], function(err) {
            if (err) 
                return next(err);
            res.redirect('login');
        });
}

module.exports.changeUsers = async (req, res) => {
    const users = await User.find();
    res.render('users/changeUsers', { users })
}

