const User = require('../models/user');
const ExpressError = require('../utils/ExpressError');


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
    res.redirect('/login')
}

module.exports.changepassword = async (req, res) => {
    const foundUser = await User.findById(req.user._id);
    foundUser.changePassword(req.body.password, req.body.newPassword);
    console.log('password changed');
    res.redirect('/login');
}