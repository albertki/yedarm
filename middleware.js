module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER...", req.user);
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        console.log('not authenticated!');
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    console.log('authenticated!');
    next()
}
module.exports.isAlreadyLoggedIn = (req, res, next) => {
    // console.log("REQ.USER...", req.user);
    if(req.isAuthenticated()) {
        console.log('already authenticated!');
        return res.redirect('/students');
    }
    console.log('not authenticated!');
    next()
}
module.exports.isAdmin = (req, res, next) => {
    if (!req.user.admin) {
        req.flash('error', 'You do not have permission to do that!');
        console.log('is not an admin!');
        return res.redirect('/students')
    }
    console.log('is admin!');
    next()
}