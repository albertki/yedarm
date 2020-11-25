const express = require('express');
const router = express.Router({ mergeParams: true });

const parents = require('../controllers/parents');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAdmin } = require('../middleware');


// GET route for CREATE student's parent
router.get('/new', isLoggedIn, isAdmin, catchAsync(parents.renderNewParentForm))
// POST route for CREATE student's parent
router.post('/new', isLoggedIn, isAdmin, catchAsync(parents.createParent))

// GET route to UPDATE student's parents
router.get('/edit', isLoggedIn, isAdmin, catchAsync(parents.renderEditParentForm))
// POST route to UPDATE student's parents
router.put('/', isLoggedIn, isAdmin, catchAsync(parents.updateParent))

// DELETE route to DELETE student's parent
router.delete('/:pId', isLoggedIn, isAdmin, catchAsync(parents.deleteParent))


// Error handlers
const handleCastError = (err) => {
    console.dir(err);
    return err
}
const handleValidationError = (err) => {
    console.dir(err);
    return new ExpressError(`Invalid Student data...${err.message}`, 400);
}

router.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === 'CastError') {
        err = handleCastError(err);
    }
    else if (err.name === 'ValidationError') {
        err = handleValidationError(err);
    }
    next(err);
})

module.exports = router;
